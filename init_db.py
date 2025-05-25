import sqlite3
from datetime import datetime, timedelta
import json

# Connect to SQLite (or create new db)
conn = sqlite3.connect("best_in_class.db")
cursor = conn.cursor()

# Drop existing tables if re-running
cursor.executescript("""
DROP TABLE IF EXISTS uploaded_files;
DROP TABLE IF EXISTS goals;
DROP TABLE IF EXISTS sessions;
DROP TABLE IF EXISTS lessons;
DROP TABLE IF EXISTS topics;
DROP TABLE IF EXISTS current_session;
""")

# Create tables based on the updated schema
cursor.executescript("""
CREATE TABLE topics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    key_points TEXT,  -- Store as JSON string
    progress REAL DEFAULT 0,
    session_count INTEGER DEFAULT 0,
    day_streak INTEGER DEFAULT 0,
    overall_progress REAL DEFAULT 0
);

CREATE TABLE lessons (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    topic_id INTEGER,
    title TEXT,
    progress REAL DEFAULT 0,
    FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE
);

CREATE TABLE goals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lesson_id INTEGER,
    description TEXT,
    test_done BOOLEAN DEFAULT 0,
    status TEXT DEFAULT 'pending',
    FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE
);

CREATE TABLE sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    topic_id INTEGER,
    lesson_id INTEGER,
    session_datetime TEXT,
    length_minutes INTEGER,
    mastery_score REAL,
    FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE,
    FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE
);

CREATE TABLE uploaded_files (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    topic_id INTEGER,
    file_path TEXT,
    file_handle TEXT,
    uploaded_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE
);

CREATE TABLE current_session (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    topic_id INTEGER,
    lesson_id INTEGER,
    session_id INTEGER,
    metadata TEXT,
    mode TEXT
);
""")

# Insert mock data with key points
cursor.execute("""
    INSERT INTO topics (name, description, key_points, progress, overall_progress) 
    VALUES (?, ?, ?, ?, ?)
""", (
    "10x Study Methods",
    "Advanced learning techniques and study strategies",
    json.dumps([
        "Spaced Repetition",
        "Pomodoro Technique",
        "Feynman Technique",
        "Cornell Note Taking System"
    ]),
    0.5,  # 50% progress
    0.5
))

cursor.execute("""
    INSERT INTO topics (name, description, key_points, progress, overall_progress) 
    VALUES (?, ?, ?, ?, ?)
""", (
    "Quantum Mechanics",
    "Fundamental principles of quantum physics",
    json.dumps([
        "Wave-Particle Duality",
        "Schrödinger Equation",
        "Quantum Superposition",
        "Quantum Tunneling",
        "Quantum Spin"
    ]),
    0.8,  # 80% progress
    0.8
))

# Fetch topic ids
cursor.execute("SELECT id FROM topics WHERE name = '10x Study Methods'")
study_methods_id = cursor.fetchone()[0]
cursor.execute("SELECT id FROM topics WHERE name = 'Quantum Mechanics'")
quantum_id = cursor.fetchone()[0]

# Lessons for Study Methods
study_methods_lessons = [
    (study_methods_id, "Spaced Repetition", 1.0, "completed"),
    (study_methods_id, "Pomodoro Technique", 1.0, "completed"),
    (study_methods_id, "Feynman Technique", 0.0, "open"),
    (study_methods_id, "Cornell Note Taking System", 0.0, "open")
]

for lesson in study_methods_lessons:
    cursor.execute("""
        INSERT INTO lessons (topic_id, title, progress, status) 
        VALUES (?, ?, ?, ?)
    """, lesson)

# Lessons for Quantum Mechanics
quantum_lessons = [
    (quantum_id, "Wave-Particle Duality", 1.0, "completed"),
    (quantum_id, "The Schrödinger Equation", 1.0, "completed"),
    (quantum_id, "Quantum Superposition and Measurement", 1.0, "completed"),
    (quantum_id, "Quantum Tunneling", 1.0, "completed"),
    (quantum_id, "Quantum Spin and Pauli Exclusion Principle", 0.0, "open")
]

for lesson in quantum_lessons:
    cursor.execute("""
        INSERT INTO lessons (topic_id, title, progress, status) 
        VALUES (?, ?, ?, ?)
    """, lesson)

# Fetch lesson ids for sessions
cursor.execute("SELECT id FROM lessons WHERE title = 'Spaced Repetition'")
spaced_rep_id = cursor.fetchone()[0]
cursor.execute("SELECT id FROM lessons WHERE title = 'Pomodoro Technique'")
pomodoro_id = cursor.fetchone()[0]
cursor.execute("SELECT id FROM lessons WHERE title = 'Wave-Particle Duality'")
wave_particle_id = cursor.fetchone()[0]
cursor.execute("SELECT id FROM lessons WHERE title = 'The Schrödinger Equation'")
schrodinger_id = cursor.fetchone()[0]

# Generate study sessions with realistic timestamps
now = datetime.now()
sessions = [
    # Study Methods sessions
    (study_methods_id, spaced_rep_id, (now - timedelta(days=14)).isoformat(), 45, 0.9),
    (study_methods_id, spaced_rep_id, (now - timedelta(days=10)).isoformat(), 30, 0.95),
    (study_methods_id, pomodoro_id, (now - timedelta(days=7)).isoformat(), 60, 0.85),
    (study_methods_id, pomodoro_id, (now - timedelta(days=5)).isoformat(), 45, 0.9),
    
    # Quantum Mechanics sessions
    (quantum_id, wave_particle_id, (now - timedelta(days=21)).isoformat(), 90, 0.8),
    (quantum_id, wave_particle_id, (now - timedelta(days=18)).isoformat(), 60, 0.85),
    (quantum_id, schrodinger_id, (now - timedelta(days=15)).isoformat(), 120, 0.75),
    (quantum_id, schrodinger_id, (now - timedelta(days=12)).isoformat(), 90, 0.85),
    (quantum_id, schrodinger_id, (now - timedelta(days=9)).isoformat(), 60, 0.9)
]

cursor.executemany("""
    INSERT INTO sessions (topic_id, lesson_id, session_datetime, length_minutes, mastery_score) 
    VALUES (?, ?, ?, ?, ?)
""", sessions)

# Commit and close
conn.commit()
conn.close()

print("SQLite DB initialized with Study Methods and Quantum Mechanics topics, including lessons and study sessions.")
