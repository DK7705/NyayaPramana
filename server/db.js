import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

// Use a local database file
const dbFile = path.resolve('nyaya_pramana.db');
const db = new Database(dbFile);

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');

// Initialize schema
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'student',
    institution TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    token TEXT NOT NULL UNIQUE,
    expires_at DATETIME NOT NULL,
    last_activity DATETIME NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS game_results (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    game_type TEXT NOT NULL,
    level INTEGER NOT NULL,
    score INTEGER NOT NULL,
    accuracy INTEGER NOT NULL,
    correct INTEGER NOT NULL,
    total INTEGER NOT NULL,
    hints_used INTEGER NOT NULL,
    time_seconds INTEGER NOT NULL,
    pramana_data TEXT,
    completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS user_progress (
    user_id TEXT PRIMARY KEY,
    completed_levels TEXT DEFAULT '[]',
    total_score INTEGER DEFAULT 0,
    pramana_accuracy TEXT DEFAULT '{"pratyaksa":0,"anumana":0,"sabda":0}',
    overall_accuracy INTEGER DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS classes (
    id TEXT PRIMARY KEY,
    teacher_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    class_code TEXT UNIQUE NOT NULL,
    type TEXT NOT NULL DEFAULT 'class',
    questions TEXT,
    status TEXT DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (teacher_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS class_enrollments (
    id TEXT PRIMARY KEY,
    class_id TEXT NOT NULL,
    student_id TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    enrolled_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (class_id) REFERENCES classes(id),
    FOREIGN KEY (student_id) REFERENCES users(id),
    UNIQUE(class_id, student_id)
  );

  CREATE TABLE IF NOT EXISTS class_results (
    id TEXT PRIMARY KEY,
    class_id TEXT NOT NULL,
    student_id TEXT NOT NULL,
    score INTEGER DEFAULT 0,
    accuracy INTEGER DEFAULT 0,
    correct INTEGER DEFAULT 0,
    total INTEGER DEFAULT 0,
    time_seconds INTEGER DEFAULT 0,
    pramana_data TEXT,
    completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (class_id) REFERENCES classes(id),
    FOREIGN KEY (student_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS pre_post_tests (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL,
    test_type TEXT NOT NULL,
    score INTEGER NOT NULL,
    pramana_breakdown TEXT,
    responses TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS hint_logs (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL,
    game_mode TEXT NOT NULL,
    question_id INTEGER NOT NULL,
    hint_number INTEGER NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS reflection_journal (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL,
    level_id INTEGER NOT NULL,
    pramana_tag TEXT,
    journal_entry TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(id)
  );

  -- Performance indexes
  CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
  CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
  CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);
  CREATE INDEX IF NOT EXISTS idx_game_results_user ON game_results(user_id);
  CREATE INDEX IF NOT EXISTS idx_class_enrollments_class ON class_enrollments(class_id, status);
  CREATE INDEX IF NOT EXISTS idx_class_enrollments_student ON class_enrollments(student_id);
  CREATE INDEX IF NOT EXISTS idx_class_results_class ON class_results(class_id);
  CREATE INDEX IF NOT EXISTS idx_pre_post_tests_student ON pre_post_tests(student_id);
`);

export default db;
