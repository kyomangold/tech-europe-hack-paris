from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import sqlite3
from pydantic import BaseModel
import datetime

from agents_openai import (
    upload_study_material,
    give_more_info,
    call_generate_topic_summary,
    call_generate_study_plan
)



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
    return {"plan": plan}
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

# Endpoint: /api/study-sessions
@app.get("/api/study-sessions", response_model=List[StudySession])
def read_study_sessions():
    try:
        sessions = get_all_study_sessions()
        return sessions
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

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
