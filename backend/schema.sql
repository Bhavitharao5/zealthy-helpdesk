-- Creates tables if not exist
CREATE TABLE IF NOT EXISTS tickets (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  description TEXT NOT NULL,
  attachment TEXT,
  status TEXT NOT NULL DEFAULT 'NEW',
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  ticketId TEXT NOT NULL,
  body TEXT NOT NULL,
  fromAdmin INTEGER NOT NULL DEFAULT 0,
  createdAt TEXT NOT NULL,
  FOREIGN KEY(ticketId) REFERENCES tickets(id) ON DELETE CASCADE
);
