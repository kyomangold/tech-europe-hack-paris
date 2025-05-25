from fastapi import FastAPI, HTTPException, UploadFile, File, Form, Request
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import sqlite3
from pydantic import BaseModel
import datetime
import openai
from openai import OpenAI
import json

from agents_openai import upload_study_material, give_more_info, call_generate_topic_summary, call_generate_study_plan, call_generate_topic_title




# Define FastAPI app
app = FastAPI()

# CORS configuration (allow all for simplicity)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/api/give-more-info")
async def api_give_more_info(query: str = Form(...)):
    result = await give_more_info(query)
    return {"result": result}

@app.post("/api/upload-study-material")
async def api_upload_study_material(file: UploadFile = File(...)):
    try:
        if file.content_type != 'application/pdf':
            raise HTTPException(status_code=400, detail="Only PDF files are allowed")

        # Save the uploaded file temporarily
        file_path = f"/tmp/{file.filename}"
        with open(file_path, "wb") as f:
            content = await file.read()
            f.write(content)
        
        # Upload to OpenAI with purpose="user_data"
        client = OpenAI()
        with open(file_path, "rb") as f:
            uploaded_file = client.files.create(
                file=f,
                purpose="user_data"
            )
        
        # Store in database
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        try:
            cursor.execute("""
                INSERT INTO uploaded_files (file_path, file_handle)
                VALUES (?, ?)
            """, (file_path, str(uploaded_file.id)))
            conn.commit()
            file_id = cursor.lastrowid
        finally:
            conn.close()
        
        return {"file_id": file_id, "file_handle": str(uploaded_file.id)}
    except Exception as e:
        print(f"Error uploading file: {str(e)}")  # Add logging
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/create-topic")
async def create_topic(
    name: str = Form(...),
    description: str = Form(None),
    file_id: str = Form(None)
):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    try:
        # If file_id is provided, get the file handle from the database
        file_handle = None
        if file_id:
            cursor.execute("SELECT file_handle FROM uploaded_files WHERE id = ?", (file_id,))
            result = cursor.fetchone()
            if result:
                file_handle = result[0]

        # Generate topic title and summary using AI if file is provided
        topic_title = name
        topic_summary = description
        key_points = []
        if file_handle:
            try:
                client = OpenAI()
                # Use the file with GPT-4
                response = client.responses.create(
                    model="gpt-4.1",
                    input=[
                        {
                            "role": "user",
                            "content": [
                                {
                                    "type": "input_file",
                                    "file_id": file_handle,
                                },
                                {
                                    "type": "input_text",
                                    "text": f"Generate a concise title and summary for this study material. Return ONLY a JSON object in this exact format:\n"
                                    "{\n"
                                    '  "title": "Academic Title Here",\n'
                                    '  "summary": "2-3 sentence summary here",\n'
                                    '  "key_points": [\n'
                                    '    "Key point 1",\n'
                                    '    "Key point 2",\n'
                                    '    "Key point 3"\n'
                                    '  ]\n'
                                    "}\n\n"
                                    "Rules:\n"
                                    "1. Title must be academic and concise\n"
                                    "2. Summary must be 2-3 sentences\n"
                                    "3. Include 3-5 key points\n"
                                    "4. Return ONLY the JSON, no other text\n"
                                    "5. Ensure the JSON is valid and properly formatted",
                                },
                            ]
                        }
                    ]
                )
                
                # Parse the JSON response to get title, summary and key points
                ai_response = json.loads(response.output_text)
                topic_title = ai_response["title"]
                topic_summary = ai_response["summary"]
                key_points = ai_response["key_points"]
                
                # Check if topic name already exists and make it unique if needed
                base_title = topic_title
                counter = 1
                while True:
                    cursor.execute("SELECT id FROM topics WHERE name = ?", (topic_title,))
                    if not cursor.fetchone():
                        break
                    topic_title = f"{base_title} ({counter})"
                    counter += 1
                
                # Insert new topic into database with key_points
                cursor.execute("""
                    INSERT INTO topics (name, description, key_points, progress, session_count, day_streak, overall_progress)
                    VALUES (?, ?, ?, 0, 0, 0, 0)
                """, (topic_title, topic_summary, json.dumps(key_points)))
                topic_id = cursor.lastrowid

                # Generate and parse study plan
                study_plan_response = client.responses.create(
                    model="gpt-4.1",
                    input=[
                        {
                            "role": "user",
                            "content": [
                                {
                                    "type": "input_file",
                                    "file_id": file_handle,
                                },
                                {
                                    "type": "input_text",
                                    "text": f"Create a study plan for this topic based on the summary and the material in the file:\n\n{topic_summary}\n\n"
                                    "Return the response in the following JSON format:\n"
                                    "{\n"
                                    '  "lessons": [\n'
                                    '    {\n'
                                    '      "title": "Lesson Title",\n'
                                    '      "description": "Short description of the lesson"\n'
                                    '    },\n'
                                    '    ...\n'
                                    '  ]\n'
                                    "}\n\n"
                                    "Rules:\n"
                                    "1. Maximum 5 lessons\n"
                                    "2. Each lesson must have a clear, concise title\n"
                                    "3. Each lesson must have a brief description\n"
                                    "4. Return ONLY the JSON, no other text\n"
                                    "5. Ensure the JSON is valid and properly formatted",
                                },
                            ]
                        }
                    ]
                )
                study_plan = study_plan_response.output_text
                
                # Parse JSON study plan and create lessons
                try:
                    study_plan_json = json.loads(study_plan)
                    for lesson in study_plan_json["lessons"]:
                        cursor.execute("""
                            INSERT INTO lessons (topic_id, title, progress)
                            VALUES (?, ?, 0)
                        """, (topic_id, lesson["title"]))
                except json.JSONDecodeError as e:
                    print(f"Error parsing study plan JSON: {str(e)}")
                    raise HTTPException(status_code=500, detail="Invalid study plan format")

                # Update the topic_id in uploaded_files
                cursor.execute("""
                    UPDATE uploaded_files 
                    SET topic_id = ? 
                    WHERE id = ?
                """, (topic_id, file_id))

                conn.commit()
                return {
                    "id": topic_id,
                    "name": topic_title,
                    "description": topic_summary,
                    "key_points": key_points,
                    "file_handle": file_handle,
                    "study_plan": study_plan
                }
            except Exception as e:
                print(f"Error processing file content: {str(e)}")
                raise HTTPException(status_code=500, detail=f"Error processing file content: {str(e)}")
        else:
            # If no file is provided, check for duplicate name and make it unique if needed
            base_title = topic_title
            counter = 1
            while True:
                cursor.execute("SELECT id FROM topics WHERE name = ?", (topic_title,))
                if not cursor.fetchone():
                    break
                topic_title = f"{base_title} ({counter})"
                counter += 1

            # Create the topic with the unique name
            cursor.execute("""
                INSERT INTO topics (name, description, key_points, progress, session_count, day_streak, overall_progress)
                VALUES (?, ?, ?, 0, 0, 0, 0)
            """, (topic_title, topic_summary, json.dumps(key_points)))
            topic_id = cursor.lastrowid
            conn.commit()
            
            return {
                "id": topic_id,
                "name": topic_title,
                "description": topic_summary,
                "key_points": key_points
            }
    except Exception as e:
        conn.rollback()
        print(f"Error creating topic: {str(e)}")  # Add logging
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()

"""
@app.post("/api/study-planner")
async def api_study_planner(topic_description: str = Form(...)):
    plan = await call_generate_study_plan(topic_description)
    return {"plan": plan}
"""

# Database path
DB_PATH = "best_in_class.db"

# Initialize database with schema
def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Create topics table with key_points
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS topics (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT,
            key_points TEXT,  -- Store as JSON string
            progress FLOAT DEFAULT 0,
            session_count INTEGER DEFAULT 0,
            day_streak INTEGER DEFAULT 0,
            overall_progress FLOAT DEFAULT 0
        )
    """)
    
    # Create lessons table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS lessons (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            topic_id INTEGER,
            title TEXT NOT NULL,
            progress FLOAT DEFAULT 0,
            FOREIGN KEY (topic_id) REFERENCES topics (id)
        )
    """)
    
    # Create current_session table (singleton row for now)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS current_session (
            id INTEGER PRIMARY KEY CHECK (id = 1),
            topic_id INTEGER,
            lesson_id INTEGER,
            session_id INTEGER,
            metadata TEXT,
            mode TEXT
        )
    """)
    
    conn.commit()
    conn.close()

# Call init_db when the application starts
init_db()

# Pydantic models
class StudySession(BaseModel):
    id: int
    topic_id: int
    lesson_id: int
    session_datetime: str
    length_minutes: int
    mastery_score: float

class Topic(BaseModel):
    id: int
    name: str
    description: str | None
    key_points: List[str] | None
    progress: float
    session_count: int
    day_streak: int
    overall_progress: float

# Utility function to fetch sessions from DB
def get_all_study_sessions() -> List[StudySession]:
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT id, topic_id, lesson_id, session_datetime, length_minutes, mastery_score FROM sessions")
        rows = cursor.fetchall()
        return [StudySession(
            id=row[0],
            topic_id=row[1],
            lesson_id=row[2],
            session_datetime=row[3],
            length_minutes=row[4],
            mastery_score=row[5]
        ) for row in rows]
    finally:
        conn.close()

# Utility function to fetch topics from DB
def get_all_topics() -> List[Topic]:
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    try:
        cursor.execute("""
            SELECT 
                id,
                name,
                description,
                key_points,
                progress,
                session_count,
                day_streak,
                overall_progress
            FROM topics
        """)
        rows = cursor.fetchall()
        return [Topic(
            id=row[0],
            name=row[1],
            description=row[2],
            key_points=json.loads(row[3]) if row[3] else None,
            progress=row[4],
            session_count=row[5],
            day_streak=row[6],
            overall_progress=row[7]
        ) for row in rows]
    finally:
        conn.close()

# Endpoint: /api/study-sessions
@app.get("/api/study-sessions", response_model=List[StudySession])
def read_study_sessions():
    try:
        sessions = get_all_study_sessions()
        return sessions
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Endpoint: /api/topics
@app.get("/api/topics", response_model=List[Topic])
def read_topics():
    try:
        topics = get_all_topics()
        return topics
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Endpoint: /api/current-topic
@app.get("/api/current-topic")
def get_current_topic(topic_id: int = None):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    try:
        # If topic_id is provided, get that specific topic, otherwise get the most recent one
        if topic_id is not None:
            cursor.execute("""
                SELECT 
                    id,
                    name,
                    description,
                    key_points,
                    progress,
                    session_count,
                    day_streak,
                    overall_progress
                FROM topics
                WHERE id = ?
            """, (topic_id,))
        else:
            cursor.execute("""
                SELECT 
                    id,
                    name,
                    description,
                    key_points,
                    progress,
                    session_count,
                    day_streak,
                    overall_progress
                FROM topics
                ORDER BY overall_progress DESC, progress DESC
                LIMIT 1
            """)
        
        row = cursor.fetchone()
        
        if not row:
            raise HTTPException(status_code=404, detail="No topics found")
            
        return {
            "id": row[0],
            "name": row[1],
            "description": row[2],
            "key_points": row[3],
            "progress": row[4],
            "session_count": row[5],
            "day_streak": row[6],
            "overall_progress": row[7]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()

# Endpoint: /api/topic-progress
@app.get("/api/topic-progress")
def get_topic_progress(topic_id: int = None):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    try:
        # If topic_id is provided, get progress for that topic, otherwise get the most recent one
        if topic_id is not None:
            cursor.execute("""
                SELECT 
                    t.id,
                    t.name,
                    COUNT(l.id) as total_lessons,
                    COUNT(CASE WHEN l.progress >= 1 THEN 1 END) as completed_lessons
                FROM topics t
                LEFT JOIN lessons l ON t.id = l.topic_id
                WHERE t.id = ?
                GROUP BY t.id, t.name
            """, (topic_id,))
        else:
            cursor.execute("""
                SELECT 
                    t.id,
                    t.name,
                    COUNT(l.id) as total_lessons,
                    COUNT(CASE WHEN l.progress >= 1 THEN 1 END) as completed_lessons
                FROM topics t
                LEFT JOIN lessons l ON t.id = l.topic_id
                WHERE t.id = (
                    SELECT id FROM topics 
                    ORDER BY overall_progress DESC, progress DESC 
                    LIMIT 1
                )
                GROUP BY t.id, t.name
            """)
        
        row = cursor.fetchone()
        
        if not row:
            raise HTTPException(status_code=404, detail="No topics found")
            
        return {
            "topic_id": row[0],
            "topic_name": row[1],
            "total_lessons": row[2],
            "completed_lessons": row[3]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()

# Endpoint: /api/next-up-topics
@app.get("/api/next-up-topics")
def get_next_up_topics():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    try:
        # Get topics with incomplete lessons, ordered by progress
        cursor.execute("""
            SELECT 
                t.id,
                t.name,
                t.description,
                t.overall_progress,
                COUNT(l.id) as total_lessons,
                COUNT(CASE WHEN l.progress >= 1 THEN 1 END) as completed_lessons
            FROM topics t
            LEFT JOIN lessons l ON t.id = l.topic_id
            WHERE t.id != (
                SELECT id FROM topics 
                ORDER BY overall_progress DESC, progress DESC 
                LIMIT 1
            )
            GROUP BY t.id, t.name, t.description, t.overall_progress
            HAVING total_lessons > completed_lessons
            ORDER BY t.overall_progress DESC
            LIMIT 3
        """)
        rows = cursor.fetchall()
        
        return [{
            "id": row[0],
            "name": row[1],
            "description": row[2],
            "progress": row[3],
            "total_lessons": row[4],
            "completed_lessons": row[5]
        } for row in rows]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()

# Endpoint: /api/study-goals
@app.get("/api/study-goals")
def get_study_goals(topic_id: int = None):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    try:
        # If topic_id is provided, get goals for that topic, otherwise get goals for current topic
        if topic_id is not None:
            cursor.execute("""
                SELECT 
                    g.id,
                    g.lesson_id,
                    l.title as lesson_title,
                    g.description as goal_description,
                    g.test_done,
                    g.status
                FROM goals g
                JOIN lessons l ON g.lesson_id = l.id
                WHERE l.topic_id = ?
                ORDER BY g.id DESC
            """, (topic_id,))
        else:
            cursor.execute("""
                SELECT 
                    g.id,
                    g.lesson_id,
                    l.title as lesson_title,
                    g.description as goal_description,
                    g.test_done,
                    g.status
                FROM goals g
                JOIN lessons l ON g.lesson_id = l.id
                WHERE l.topic_id = (
                    SELECT id FROM topics 
                    ORDER BY overall_progress DESC, progress DESC 
                    LIMIT 1
                )
                ORDER BY g.id DESC
            """)
        
        rows = cursor.fetchall()
        return [{
            "id": row[0],
            "lesson_id": row[1],
            "lesson_title": row[2],
            "goal_description": row[3],
            "test_done": bool(row[4]),
            "status": row[5]
        } for row in rows]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()

# Endpoint: /api/improvement-areas
@app.get("/api/improvement-areas")
def get_improvement_areas(topic_id: int = None):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    try:
        # If topic_id is provided, get improvement areas for that topic, otherwise get for current topic
        if topic_id is not None:
            cursor.execute("""
                SELECT 
                    l.id as lesson_id,
                    l.title as lesson_title,
                    t.name as topic_name,
                    l.progress,
                    COUNT(g.id) - COUNT(CASE WHEN g.status = 'complete' THEN 1 END) as missing_goals
                FROM lessons l
                JOIN topics t ON l.topic_id = t.id
                LEFT JOIN goals g ON l.id = g.lesson_id
                WHERE t.id = ?
                GROUP BY l.id, l.title, t.name, l.progress
                HAVING l.progress < 1
                ORDER BY l.progress ASC
            """, (topic_id,))
        else:
            cursor.execute("""
                SELECT 
                    l.id as lesson_id,
                    l.title as lesson_title,
                    t.name as topic_name,
                    l.progress,
                    COUNT(g.id) - COUNT(CASE WHEN g.status = 'complete' THEN 1 END) as missing_goals
                FROM lessons l
                JOIN topics t ON l.topic_id = t.id
                LEFT JOIN goals g ON l.id = g.lesson_id
                WHERE t.id = (
                    SELECT id FROM topics 
                    ORDER BY overall_progress DESC, progress DESC 
                    LIMIT 1
                )
                GROUP BY l.id, l.title, t.name, l.progress
                HAVING l.progress < 1
                ORDER BY l.progress ASC
            """)
        
        rows = cursor.fetchall()
        return [{
            "lesson_id": row[0],
            "lesson_title": row[1],
            "topic_name": row[2],
            "progress": row[3],
            "missing_goals": row[4]
        } for row in rows]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()

# Endpoint: /api/study-metrics
@app.get("/api/study-metrics")
def get_study_metrics(topic_id: int = None):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    try:
        # If topic_id is provided, get metrics for that topic, otherwise get for current topic
        if topic_id is not None:
            cursor.execute("""
                SELECT 
                    t.id as topic_id,
                    t.name as topic_name,
                    t.progress,
                    t.session_count,
                    t.day_streak,
                    t.overall_progress
                FROM topics t
                WHERE t.id = ?
            """, (topic_id,))
        else:
            cursor.execute("""
                SELECT 
                    t.id as topic_id,
                    t.name as topic_name,
                    t.progress,
                    t.session_count,
                    t.day_streak,
                    t.overall_progress
                FROM topics t
                WHERE t.id = (
                    SELECT id FROM topics 
                    ORDER BY overall_progress DESC, progress DESC 
                    LIMIT 1
                )
            """)
        
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="No topics found")
            
        return {
            "topic_id": row[0],
            "topic_name": row[1],
            "progress": row[2],
            "session_count": row[3],
            "day_streak": row[4],
            "overall_progress": row[5]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()

# Skeleton Endpoints
@app.get("/api/connection-details")
def get_connection_details():
    return {"message": "Connection details placeholder"}

@app.get("/api/study-goals")
def get_study_goals():
    return {"message": "Study goals placeholder"}

@app.get("/api/improvement-areas")
def get_improvement_areas():
    return {"message": "Improvement areas placeholder"}

@app.get("/api/study-metrics")
def get_study_metrics():
    return {"message": "Study metrics placeholder"}

# Endpoint to set the current session/topic/metadata
@app.post("/api/current-session")
async def set_current_session(request: Request):
    data = await request.json()
    topic_id = data.get("topic_id")
    lesson_id = data.get("lesson_id")
    session_id = data.get("session_id")
    metadata = data.get("metadata")
    mode = data.get("mode")
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    try:
        cursor.execute("""
            INSERT OR REPLACE INTO current_session (id, topic_id, lesson_id, session_id, metadata, mode)
            VALUES (1, ?, ?, ?, ?, ?)
        """, (topic_id, lesson_id, session_id, json.dumps(metadata) if metadata else None, mode))
        conn.commit()
        return {"status": "ok"}
    finally:
        conn.close()

# Endpoint to get the current session/topic/metadata
@app.get("/api/current-session")
def get_current_session():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT topic_id, lesson_id, session_id, metadata, mode FROM current_session WHERE id = 1")
        row = cursor.fetchone()
        if not row:
            return {"topic_id": None, "lesson_id": None, "session_id": None, "metadata": None, "mode": None}
        topic_id, lesson_id, session_id, metadata, mode = row
        return {
            "topic_id": topic_id,
            "lesson_id": lesson_id,
            "session_id": session_id,
            "metadata": json.loads(metadata) if metadata else None,
            "mode": mode
        }
    finally:
        conn.close()