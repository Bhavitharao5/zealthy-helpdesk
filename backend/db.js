// db.js
import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// DB file lives next to backend folder (you can change this)
const DB_PATH = path.join(__dirname, 'helpdesk.sqlite');

// open connection
export const db = new sqlite3.Database(DB_PATH);

// helper to run a statement (Promise)
export function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve(this); // has lastID, changes
    });
  });
}

// helper to get one row
export function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => (err ? reject(err) : resolve(row)));
  });
}

// helper to get all rows
export function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => (err ? reject(err) : resolve(rows)));
  });
}

// initialize db (called by "npm run db:init")
if (process.argv[1]?.endsWith('db.js')) {
  (async () => {
    try {
      await run(`
        CREATE TABLE IF NOT EXISTS tickets (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          email TEXT NOT NULL,
          description TEXT NOT NULL,
          attachment TEXT,
          status TEXT NOT NULL DEFAULT 'NEW',
          created_at TEXT NOT NULL DEFAULT (datetime('now')),
          updated_at TEXT NOT NULL DEFAULT (datetime('now'))
        );
      `);

      await run(`
        CREATE TABLE IF NOT EXISTS messages (
          id TEXT PRIMARY KEY,
          ticket_id TEXT NOT NULL,
          body TEXT NOT NULL,
          created_at TEXT NOT NULL DEFAULT (datetime('now')),
          FOREIGN KEY(ticket_id) REFERENCES tickets(id)
        );
      `);

      console.log('✅ Database initialized at', DB_PATH);
      process.exit(0);
    } catch (e) {
      console.error('DB init failed:', e.message);
      process.exit(1);
    }
  })();
}
