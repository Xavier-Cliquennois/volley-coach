import { getDb } from './client';
import {
  BodyWeightRow,
  ExerciseLogRow,
  JournalRow,
  PlanStateRow,
  SessionRow,
  SetRow,
  SettingsRow,
  TestResultRow,
  TestType,
} from './schema';

export async function getPlanState(): Promise<PlanStateRow | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<PlanStateRow>('SELECT * FROM plan_state WHERE id = 1');
  return row ?? null;
}

export async function setPlanState(startDate: string, weekOffset = 0): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    'INSERT OR REPLACE INTO plan_state (id, start_date, week_offset) VALUES (1, ?, ?)',
    [startDate, weekOffset]
  );
}

export async function bumpWeekOffset(delta: number): Promise<void> {
  const db = await getDb();
  await db.runAsync('UPDATE plan_state SET week_offset = week_offset + ? WHERE id = 1', [delta]);
}

export async function getSettings(): Promise<SettingsRow> {
  const db = await getDb();
  const row = await db.getFirstAsync<SettingsRow>('SELECT * FROM settings WHERE id = 1');
  if (!row) {
    throw new Error('Settings row missing');
  }
  return row;
}

export async function updateSettings(patch: Partial<Omit<SettingsRow, 'id'>>): Promise<void> {
  const db = await getDb();
  const keys = Object.keys(patch) as Array<keyof typeof patch>;
  if (keys.length === 0) return;
  const setClause = keys.map((k) => `${k} = ?`).join(', ');
  const values = keys.map((k) => patch[k] as number);
  await db.runAsync(`UPDATE settings SET ${setClause} WHERE id = 1`, values);
}

export async function createSession(input: {
  scheduledDate: string;
  week: number;
  phase: number;
  type: 'A' | 'B' | 'C';
}): Promise<number> {
  const db = await getDb();
  const result = await db.runAsync(
    'INSERT INTO session_log (scheduled_date, week, phase, type) VALUES (?, ?, ?, ?)',
    [input.scheduledDate, input.week, input.phase, input.type]
  );
  return result.lastInsertRowId as number;
}

export async function completeSession(
  id: number,
  data: { durationSeconds: number; perceivedEffort?: number; notes?: string }
): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `UPDATE session_log
     SET completed_at = datetime('now'), duration_seconds = ?, perceived_effort = ?, notes = ?
     WHERE id = ?`,
    [data.durationSeconds, data.perceivedEffort ?? null, data.notes ?? null, id]
  );
}

export async function markSessionSkipped(id: number): Promise<void> {
  const db = await getDb();
  await db.runAsync('UPDATE session_log SET skipped = 1 WHERE id = ?', [id]);
}

export async function findSessionByDate(scheduledDate: string): Promise<SessionRow | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<SessionRow>(
    `SELECT * FROM session_log
     WHERE scheduled_date = ? AND skipped = 0
     ORDER BY id DESC LIMIT 1`,
    [scheduledDate]
  );
  return row ?? null;
}

export async function getRecentSessions(limit = 30): Promise<SessionRow[]> {
  const db = await getDb();
  return db.getAllAsync<SessionRow>(
    'SELECT * FROM session_log ORDER BY scheduled_date DESC LIMIT ?',
    [limit]
  );
}

export async function getCompletedSessionCount(): Promise<number> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ c: number }>(
    'SELECT COUNT(*) as c FROM session_log WHERE completed_at IS NOT NULL'
  );
  return row?.c ?? 0;
}

export async function createExerciseLog(input: {
  sessionId: number;
  exerciseSlug: string;
  orderIdx: number;
  replacedWith?: string;
}): Promise<number> {
  const db = await getDb();
  const result = await db.runAsync(
    'INSERT INTO exercise_log (session_id, exercise_slug, order_idx, replaced_with) VALUES (?, ?, ?, ?)',
    [input.sessionId, input.exerciseSlug, input.orderIdx, input.replacedWith ?? null]
  );
  return result.lastInsertRowId as number;
}

export async function getExerciseLogsForSession(sessionId: number): Promise<ExerciseLogRow[]> {
  const db = await getDb();
  return db.getAllAsync<ExerciseLogRow>(
    'SELECT * FROM exercise_log WHERE session_id = ? ORDER BY order_idx ASC',
    [sessionId]
  );
}

export async function recordSet(input: {
  exerciseLogId: number;
  setIdx: number;
  reps: number | null;
  loadKg: number | null;
  rpe: number | null;
}): Promise<void> {
  const db = await getDb();
  // Idempotent: a re-tap on the same (exercise_log, set_idx) overwrites instead of duplicating.
  await db.runAsync(
    `INSERT INTO set_log (exercise_log_id, set_idx, reps, load_kg, rpe)
     VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(exercise_log_id, set_idx)
     DO UPDATE SET reps = excluded.reps, load_kg = excluded.load_kg, rpe = excluded.rpe, completed_at = datetime('now')`,
    [input.exerciseLogId, input.setIdx, input.reps, input.loadKg, input.rpe]
  );
}

export async function getSetsForExerciseLog(exerciseLogId: number): Promise<SetRow[]> {
  const db = await getDb();
  return db.getAllAsync<SetRow>(
    'SELECT * FROM set_log WHERE exercise_log_id = ? ORDER BY set_idx ASC',
    [exerciseLogId]
  );
}

export async function getLastSetsForExercise(
  exerciseSlug: string,
  limit = 5
): Promise<Array<SetRow & { scheduled_date: string }>> {
  const db = await getDb();
  return db.getAllAsync<SetRow & { scheduled_date: string }>(
    `SELECT s.*, sl.scheduled_date
     FROM set_log s
     JOIN exercise_log el ON el.id = s.exercise_log_id
     JOIN session_log sl ON sl.id = el.session_id
     WHERE el.exercise_slug = ?
     ORDER BY sl.scheduled_date DESC, s.set_idx ASC
     LIMIT ?`,
    [exerciseSlug, limit * 8]
  );
}

export async function recordTest(input: {
  type: TestType;
  value: number;
  unit: string;
  week?: number;
}): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    'INSERT INTO test_result (type, value, unit, week) VALUES (?, ?, ?, ?)',
    [input.type, input.value, input.unit, input.week ?? null]
  );
}

export async function getTestHistory(type: TestType): Promise<TestResultRow[]> {
  const db = await getDb();
  return db.getAllAsync<TestResultRow>(
    'SELECT * FROM test_result WHERE type = ? ORDER BY taken_at ASC',
    [type]
  );
}

export async function getLatestTest(type: TestType): Promise<TestResultRow | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<TestResultRow>(
    'SELECT * FROM test_result WHERE type = ? ORDER BY taken_at DESC LIMIT 1',
    [type]
  );
  return row ?? null;
}

export async function recordBodyWeight(valueKg: number): Promise<void> {
  const db = await getDb();
  await db.runAsync('INSERT INTO body_weight (value_kg) VALUES (?)', [valueKg]);
}

export async function getBodyWeightHistory(): Promise<BodyWeightRow[]> {
  const db = await getDb();
  return db.getAllAsync<BodyWeightRow>('SELECT * FROM body_weight ORDER BY recorded_at ASC');
}

export async function recordJournal(input: {
  sessionId?: number;
  body: string;
  painZones?: string;
}): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    'INSERT INTO journal_entry (session_id, body, pain_zones) VALUES (?, ?, ?)',
    [input.sessionId ?? null, input.body, input.painZones ?? null]
  );
}

export async function getRecentJournal(limit = 20): Promise<JournalRow[]> {
  const db = await getDb();
  return db.getAllAsync<JournalRow>(
    'SELECT * FROM journal_entry ORDER BY recorded_at DESC LIMIT ?',
    [limit]
  );
}

export async function exportAll(): Promise<Record<string, unknown[]>> {
  const db = await getDb();
  const tables = [
    'plan_state',
    'settings',
    'session_log',
    'exercise_log',
    'set_log',
    'test_result',
    'body_weight',
    'journal_entry',
  ];
  const result: Record<string, unknown[]> = {};
  for (const table of tables) {
    result[table] = await db.getAllAsync(`SELECT * FROM ${table}`);
  }
  return result;
}
