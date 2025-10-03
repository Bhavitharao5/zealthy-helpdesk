import sqlite3 from 'sqlite3';
import { readFileSync } from 'fs';
import { join } from 'path';

const dbFile = process.env.DATABASE_URL || './dev.db';
const db = new sqlite3.Database(dbFile);

// Run schema on startup
const schema = readFileSync(join(process.cwd(), 'schema.sql'), 'utf-8');
db.exec(schema);

// Convert sqlite3 callbacks -> Promises (very small wrapper)
export function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve({ id: this.lastID, changes: this.changes });
    });
  });
}

export function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
}

export function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}
