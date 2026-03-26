import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

let db: Database.Database;

export const initSqlite = (): Database.Database => {
  const dbPath = process.env.SQLITE_DB_PATH || './data/reports.db';
  const dir = path.dirname(dbPath);

  // ensure dir exists
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  db = new Database(dbPath);

  // create table if not exists
  db.exec(`
    CREATE TABLE IF NOT EXISTS monthly_reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      month INTEGER NOT NULL,
      year INTEGER NOT NULL,
      total_spent REAL NOT NULL DEFAULT 0,
      top_category TEXT,
      overbudget_categories TEXT DEFAULT '[]',
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  console.log('✅ SQLite initialized');
  return db;
};

export const getDb = (): Database.Database => {
  if (!db) throw new Error('SQLite not initialized');
  return db;
};
