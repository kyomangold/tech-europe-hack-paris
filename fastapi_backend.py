from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import sqlite3
from pydantic import BaseModel
import datetime

from agents_openai import upload_study_material, give_more_info, call_generate_topic_summary, call_generate_study_plan




# Define FastAPI app
app = FastAPI()

# CORS configuration (allow all for simplicity)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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
    # Save the uploaded file to disk or temp
    file_path = f"/tmp/{file.filename}"
    with open(file_path, "wb") as f:
        content = await file.read()
        f.write(content)
    file_handle = await upload_study_material(file_path)
    return {"file_id": str(file_handle.id)}

@app.post("/api/new-topic")
async def api_new_topic(
    file_id: str = Form(...),
    user_input: str = Form(...)
):
    # Extract document text (implement according to your storage)
    # For now, pseudo-code:
    document_text = "..."  # TODO: retrieve from file_id, see OpenAI API docs for file retrieval
    result = await call_generate_topic_summary(document_text, user_input)
    return {"result": result}

"""
@app.post("/api/study-planner")
async def api_study_planner(topic_description: str = Form(...)):
    plan = await call_generate_study_plan(topic_description)
    return {"plan": plan}
"""

# Database path
DB_PATH = "best_in_class.db"

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
    study_hours: float
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
                study_hours,
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
            study_hours=row[3],
            session_count=row[4],
            day_streak=row[5],
            overall_progress=row[6]
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
                    study_hours,
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
                    study_hours,
                    session_count,
                    day_streak,
                    overall_progress
                FROM topics
                ORDER BY overall_progress DESC, study_hours DESC
                LIMIT 1
            """)
        
        row = cursor.fetchone()
        
        if not row:
            raise HTTPException(status_code=404, detail="No topics found")
            
        return {
            "id": row[0],
            "name": row[1],
            "description": row[2],
            "study_hours": row[3],
            "session_count": row[4],
            "day_streak": row[5],
            "overall_progress": row[6]
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
                    ORDER BY overall_progress DESC, study_hours DESC 
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
                ORDER BY overall_progress DESC, study_hours DESC 
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
                    ORDER BY overall_progress DESC, study_hours DESC 
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
                    ORDER BY overall_progress DESC, study_hours DESC 
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
                    t.study_hours,
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
                    t.study_hours,
                    t.session_count,
                    t.day_streak,
                    t.overall_progress
                FROM topics t
                WHERE t.id = (
                    SELECT id FROM topics 
                    ORDER BY overall_progress DESC, study_hours DESC 
                    LIMIT 1
                )
            """)
        
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="No topics found")
            
        return {
            "topic_id": row[0],
            "topic_name": row[1],
            "study_hours": row[2],
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
