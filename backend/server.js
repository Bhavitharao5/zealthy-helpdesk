import express from 'express';
import cors from 'cors';
import { randomUUID } from 'crypto';
import { run, get, all } from './db.js';

const app = express();
app.use(cors());
app.use(express.json({ limit: '2mb' }));

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

// Create Ticket
app.post('/api/tickets', async (req, res) => {
  try {
    const { name, email, description, attachment } = req.body || {};
    if (!name || !email || !description) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const id = randomUUID();
    const now = new Date().toISOString();

    await run(
      `INSERT INTO tickets (id, name, email, description, attachment, status, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, 'NEW', ?, ?)`,
      [id, name, email, description, attachment || null, now, now]
    );

    // Email mock
    console.log(
      `[Email Mock] Would normally send email here with body: New ticket from ${name} <${email}>: ${description}`
    );

    const ticket = await get(
      `SELECT id, name, email, description, attachment, status, createdAt FROM tickets WHERE id = ?`,
      [id]
    );
    res.json(ticket);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

// List Tickets (simple, newest first)
app.get('/api/tickets', async (_req, res) => {
  try {
    const rows = await all(
      `SELECT id, name, email, status, createdAt FROM tickets ORDER BY datetime(createdAt) DESC`
    );
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get Ticket + Messages
app.get('/api/tickets/:id', async (req, res) => {
  try {
    const ticket = await get(`SELECT * FROM tickets WHERE id = ?`, [req.params.id]);
    if (!ticket) return res.status(404).json({ error: 'Not found' });
    const messages = await all(
      `SELECT id, body, fromAdmin, createdAt FROM messages WHERE ticketId = ? ORDER BY datetime(createdAt) ASC`,
      [req.params.id]
    );
    res.json({ ...ticket, messages });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update Ticket status
app.patch('/api/tickets/:id', async (req, res) => {
  try {
    const { status } = req.body || {};
    const valid = ['NEW', 'IN_PROGRESS', 'RESOLVED'];
    if (status && !valid.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    const now = new Date().toISOString();
    const result = await run(
      `UPDATE tickets SET status = ?, updatedAt = ? WHERE id = ?`,
      [status, now, req.params.id]
    );
    if (!result.changes) return res.status(404).json({ error: 'Not found' });
    const row = await get(
      `SELECT id, status, updatedAt FROM tickets WHERE id = ?`,
      [req.params.id]
    );
    res.json(row);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add Message to Ticket
app.post('/api/tickets/:id/messages', async (req, res) => {
  try {
    const { body, fromAdmin } = req.body || {};
    if (!body) return res.status(400).json({ error: 'Missing body' });

    const ticket = await get(`SELECT id FROM tickets WHERE id = ?`, [req.params.id]);
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

    const id = randomUUID();
    const now = new Date().toISOString();

    await run(
      `INSERT INTO messages (id, ticketId, body, fromAdmin, createdAt) VALUES (?, ?, ?, ?, ?)`,
      [id, req.params.id, body, fromAdmin ? 1 : 0, now]
    );

    // Email mock
    console.log(`[Email Mock] Would normally send email here with body: ${body}`);

    res.json({ id, ticketId: req.params.id, body, fromAdmin: !!fromAdmin, createdAt: now });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});
