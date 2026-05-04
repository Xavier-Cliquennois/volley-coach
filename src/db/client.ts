import * as SQLite from 'expo-sqlite';
import { SCHEMA_STATEMENTS } from './schema';

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

async function initDb(): Promise<SQLite.SQLiteDatabase> {
  const db = await SQLite.openDatabaseAsync('volley-coach.db');
  await db.execAsync('PRAGMA foreign_keys = ON;');
  for (const stmt of SCHEMA_STATEMENTS) {
    await db.execAsync(stmt);
  }
  await db.runAsync(
    'INSERT OR IGNORE INTO settings (id, tts_enabled, timer_sound_enabled, haptics_enabled, notifications_enabled) VALUES (1, 1, 1, 1, 1)'
  );
  return db;
}

export function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = initDb().catch((e) => {
      // Reset so a future call can retry instead of being stuck on a rejected promise.
      dbPromise = null;
      throw e;
    });
  }
  return dbPromise;
}

export async function resetDb(): Promise<void> {
  const db = await getDb();
  await db.execAsync(`
    DROP TABLE IF EXISTS set_log;
    DROP TABLE IF EXISTS exercise_log;
    DROP TABLE IF EXISTS journal_entry;
    DROP TABLE IF EXISTS session_log;
    DROP TABLE IF EXISTS test_result;
    DROP TABLE IF EXISTS body_weight;
    DROP TABLE IF EXISTS plan_state;
    DROP TABLE IF EXISTS settings;
  `);
  for (const stmt of SCHEMA_STATEMENTS) {
    await db.execAsync(stmt);
  }
  await db.runAsync(
    'INSERT OR IGNORE INTO settings (id, tts_enabled, timer_sound_enabled, haptics_enabled, notifications_enabled) VALUES (1, 1, 1, 1, 1)'
  );
}
