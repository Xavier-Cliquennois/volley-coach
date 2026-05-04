/**
 * SQLite schema for the volley coach app.
 * Migrations are applied idempotently in client.ts.
 */
export const SCHEMA_STATEMENTS: string[] = [
  `CREATE TABLE IF NOT EXISTS plan_state (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    start_date TEXT NOT NULL,
    week_offset INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    tts_enabled INTEGER NOT NULL DEFAULT 1,
    timer_sound_enabled INTEGER NOT NULL DEFAULT 1,
    haptics_enabled INTEGER NOT NULL DEFAULT 1,
    notifications_enabled INTEGER NOT NULL DEFAULT 1
  )`,
  `CREATE TABLE IF NOT EXISTS session_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    scheduled_date TEXT NOT NULL,
    completed_at TEXT,
    week INTEGER NOT NULL,
    phase INTEGER NOT NULL,
    type TEXT NOT NULL,
    skipped INTEGER NOT NULL DEFAULT 0,
    notes TEXT,
    perceived_effort INTEGER,
    duration_seconds INTEGER
  )`,
  `CREATE INDEX IF NOT EXISTS idx_session_log_date ON session_log(scheduled_date)`,
  `CREATE TABLE IF NOT EXISTS exercise_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id INTEGER NOT NULL,
    exercise_slug TEXT NOT NULL,
    order_idx INTEGER NOT NULL,
    replaced_with TEXT,
    FOREIGN KEY (session_id) REFERENCES session_log(id) ON DELETE CASCADE
  )`,
  `CREATE INDEX IF NOT EXISTS idx_exercise_log_session ON exercise_log(session_id)`,
  `CREATE TABLE IF NOT EXISTS set_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    exercise_log_id INTEGER NOT NULL,
    set_idx INTEGER NOT NULL,
    reps INTEGER,
    load_kg REAL,
    rpe REAL,
    completed_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(exercise_log_id, set_idx),
    FOREIGN KEY (exercise_log_id) REFERENCES exercise_log(id) ON DELETE CASCADE
  )`,
  `CREATE INDEX IF NOT EXISTS idx_set_log_exercise ON set_log(exercise_log_id)`,
  `CREATE TABLE IF NOT EXISTS test_result (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL,
    value REAL NOT NULL,
    unit TEXT NOT NULL,
    week INTEGER,
    taken_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE INDEX IF NOT EXISTS idx_test_result_type ON test_result(type, taken_at)`,
  `CREATE TABLE IF NOT EXISTS body_weight (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    value_kg REAL NOT NULL,
    recorded_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS journal_entry (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id INTEGER,
    body TEXT NOT NULL,
    pain_zones TEXT,
    recorded_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (session_id) REFERENCES session_log(id) ON DELETE SET NULL
  )`,
];

export type SessionRow = {
  id: number;
  scheduled_date: string;
  completed_at: string | null;
  week: number;
  phase: number;
  type: 'A' | 'B' | 'C';
  skipped: number;
  notes: string | null;
  perceived_effort: number | null;
  duration_seconds: number | null;
};

export type ExerciseLogRow = {
  id: number;
  session_id: number;
  exercise_slug: string;
  order_idx: number;
  replaced_with: string | null;
};

export type SetRow = {
  id: number;
  exercise_log_id: number;
  set_idx: number;
  reps: number | null;
  load_kg: number | null;
  rpe: number | null;
  completed_at: string;
};

export type TestType = 'cmj' | 'pullup_max' | 'pushup_max' | 'spike_jump';

export type TestResultRow = {
  id: number;
  type: TestType;
  value: number;
  unit: string;
  week: number | null;
  taken_at: string;
};

export type BodyWeightRow = {
  id: number;
  value_kg: number;
  recorded_at: string;
};

export type JournalRow = {
  id: number;
  session_id: number | null;
  body: string;
  pain_zones: string | null;
  recorded_at: string;
};

export type PlanStateRow = {
  id: 1;
  start_date: string;
  week_offset: number;
  created_at: string;
};

export type SettingsRow = {
  id: 1;
  tts_enabled: number;
  timer_sound_enabled: number;
  haptics_enabled: number;
  notifications_enabled: number;
};
