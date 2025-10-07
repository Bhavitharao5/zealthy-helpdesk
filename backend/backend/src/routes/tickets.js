// routes/tickets.js
import express from 'express';
import crypto from 'crypto';

const router = express.Router();

// Simple in-memory store (resets on server restart)
const tickets = new Map();

/**
 * GET /tickets
 * Optional: /tickets?status=NEW|IN_PROGRESS|RESOLVED
 * Lists newest first
 */
router.get('/', (req, res) => {
  const { status } = req.query;
  let all = Array.from(tickets.values()).reverse();
  if (status && ['NEW', 'IN_PROGRESS', 'RESOLVED'].includes(status)) {
    all = all.filter(t => t.status === status);
  }
  res.json(all);
});

/**
 * POST /tickets
 * Body: { name, email, description, attachment? }
 */
router.post('/', (req, res) => {
  const { name, email, description, attachment } = req.body || {};
  if (!name || !email || !description) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  const id = crypto.randomUUID();
  const ticket = {
    id,
    name,
    email,
    description,
    attachment: attachment || null,
    status: 'NEW',
    messages: [],
    createdAt: new Date().toISOString(),
  };
  tickets.set(id, ticket);
  return res.status(201).json(ticket);
});

/**
 * GET /tickets/:id
 */
router.get('/:id', (req, res) => {
  const t = tickets.get(req.params.id);
  if (!t) return res.status(404).json({ error: 'Not found' });
  return res.json(t);
});

/**
 * PATCH /tickets/:id/status
 * Body: { status: "NEW" | "IN_PROGRESS" | "RESOLVED" }
 */
router.patch('/:id/status', (req, res) => {
  const t = tickets.get(req.params.id);
  if (!t) return res.status(404).json({ error: 'Not found' });

  const { status } = req.body || {};
  const allowed = ['NEW', 'IN_PROGRESS', 'RESOLVED'];
  if (!allowed.includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }
  t.status = status;
  return res.json(t);
});

/**
 * POST /tickets/:id/messages
 * Body: { body, fromAdmin? }
 */
router.post('/:id/messages', (req, res) => {
  const t = tickets.get(req.params.id);
  if (!t) return res.status(404).json({ error: 'Not found' });

  const { body, fromAdmin } = req.body || {};
  if (!body) return res.status(400).json({ error: 'Message body required' });

  const message = {
    id: crypto.randomUUID(),
    body,
    fromAdmin: !!fromAdmin,
    createdAt: new Date().toISOString(),
  };

  t.messages.push(message);
  return res.status(201).json(message);
});

/**
 * DELETE /tickets/:id
 */
router.delete('/:id', (req, res) => {
  const t = tickets.get(req.params.id);
  if (!t) return res.status(404).json({ error: 'Not found' });
  tickets.delete(req.params.id);
  return res.json({ message: 'Deleted successfully' });
});

export default router;
