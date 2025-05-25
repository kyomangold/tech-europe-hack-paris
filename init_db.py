import sqlite3
from datetime import datetime
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
    "Trigonometry",
    "Study of sine, cosine, tangent, etc.",
    json.dumps([
        "Understanding of basic trigonometric functions",
        "Application of sine and cosine laws",
        "Solving trigonometric equations"
    ]),
    5.5,
    0.78
))

cursor.execute("""
    INSERT INTO topics (name, description, key_points, progress, overall_progress) 
    VALUES (?, ?, ?, ?, ?)
""", (
    "Linear Algebra",
    "Vectors, matrices, and operations",
    json.dumps([
        "Matrix operations and properties",
        "Vector spaces and subspaces",
        "Eigenvalues and eigenvectors"
    ]),
    3.2,
    0.45
))

# Fetch topic ids
cursor.execute("SELECT id FROM topics WHERE name = 'Trigonometry'")
topic1_id = cursor.fetchone()[0]
cursor.execute("SELECT id FROM topics WHERE name = 'Linear Algebra'")
topic2_id = cursor.fetchone()[0]

# Lessons for Trigonometry
cursor.execute("INSERT INTO lessons (topic_id, title, progress) VALUES (?, ?, ?)", 
               (topic1_id, "Learn about sine", 0.9))
cursor.execute("INSERT INTO lessons (topic_id, title, progress) VALUES (?, ?, ?)", 
               (topic1_id, "Understand cosine", 0.65))
cursor.execute("INSERT INTO lessons (topic_id, title, progress) VALUES (?, ?, ?)", 
               (topic2_id, "Matrix Multiplication", 0.5))

# Fetch lesson ids
cursor.execute("SELECT id FROM lessons WHERE title = 'Learn about sine'")
lesson1_id = cursor.fetchone()[0]
cursor.execute("SELECT id FROM lessons WHERE title = 'Understand cosine'")
lesson2_id = cursor.fetchone()[0]
cursor.execute("SELECT id FROM lessons WHERE title = 'Matrix Multiplication'")
lesson3_id = cursor.fetchone()[0]

# Goals for lesson 1
cursor.executemany("INSERT INTO goals (lesson_id, description, test_done, status) VALUES (?, ?, ?, ?)", [
    (lesson1_id, "Understand amplitude", 1, "complete"),
    (lesson1_id, "Understand phase", 1, "complete"),
    (lesson1_id, "Explain sine graph", 0, "pending")
])

# Sessions
cursor.executemany("INSERT INTO sessions (topic_id, lesson_id, session_datetime, length_minutes, mastery_score) VALUES (?, ?, ?, ?, ?)", [
    (topic1_id, lesson1_id, datetime.now().isoformat(), 45, 0.85),
    (topic1_id, lesson2_id, datetime.now().isoformat(), 30, 0.75),
    (topic2_id, lesson3_id, datetime.now().isoformat(), 50, 0.6)
])

# Commit and close
conn.commit()
conn.close()

print("SQLite DB initialized with 2 topics, multiple lessons, goals, and sessions.")
