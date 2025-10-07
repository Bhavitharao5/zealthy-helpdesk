// server.js — Helpdesk backend with upload support (images & files)
import express from 'express';
import cors from 'cors';
import crypto from 'crypto';
import multer from 'multer';
import fs from 'fs';
import path from 'path';

const app = express();

// ── middleware
app.use(cors({ origin: true }));
app.use(express.json({ limit: '10mb' })); // allow larger JSON (if needed)

// ── simple logger
app.use((req, _res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// ── health
app.get('/health', (_req, res) => res.json({ ok: true }));

// ── uploads (local folder + static serving)
const uploadDir = path.resolve('uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname || '');
    cb(null, unique + ext);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15 MB per file
});
app.use('/uploads', express.static(uploadDir)); // serve files

// ── upload endpoint: POST /upload  (multipart/form-data)
app.post('/upload', upload.array('files', 10), (req, res) => {
  const files = (req.files || []).map(f => ({
    kind: f.mimetype?.startsWith('image/') ? 'image' : 'file',
    name: f.originalname,
    type: f.mimetype,
    size: f.size,
    url: `/uploads/${f.filename}`, // relative URL (use API base on frontend)
  }));
  res.json({ files });
});

// ── in-memory ticket store
const tickets = new Map();

/**
 * GET /tickets  (?status=NEW|IN_PROGRESS|RESOLVED)
 */
app.get('/tickets', (req, res) => {
  const { status } = req.query;
  let all = Array.from(tickets.values()).reverse();
  if (status && ['NEW', 'IN_PROGRESS', 'RESOLVED'].includes(status)) {
    all = all.filter(t => t.status === status);
  }
  res.json(all);
});

/**
 * POST /tickets
 * Body: {
 *   name, email, description, subject?, requestType?, testInfo?, cc?, location?, room?, priority?,
 *   attachments?: [{ kind, name, type, size?, url? } | { name, type, data }]  // data is still supported
 * }
 */
app.post('/tickets', (req, res) => {
  const { name, email, description } = req.body || {};
  if (!name || !email || !description) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const {
    subject = '',
    requestType = 'IT Request',
    testInfo = '',
    cc = '',
    location = 'NYC',
    room = '',
    priority = 'Medium',
    attachments = [], // [{ name,type,data }] base64 images
  } = req.body || {};

  // Enforce at least one photo/attachment
  if (!Array.isArray(attachments) || attachments.length === 0) {
    return res.status(400).json({ error: 'At least one attachment (photo) is required' });
  }

  const id = crypto.randomUUID();
  const ticket = {
    id, name, email, subject, description,
    requestType, testInfo, cc, location, room, priority,
    attachments,
    status: 'NEW',
    messages: [],
    createdAt: new Date().toISOString(),
  };
  tickets.set(id, ticket);

  // Spec: log a "would send email" message
  console.log(
    `📧 Would normally send email here with body: ` +
    JSON.stringify({
      to: email,
      subject: `Ticket received: ${subject || 'Support request'}`,
      body: `Hi ${name}, we received your ticket (${id}). We'll get back to you soon.`,
    })
  );

  return res.status(201).json(ticket);
});

/** GET /tickets/:id */
app.get('/tickets/:id', (req, res) => {
  const t = tickets.get(req.params.id);
  if (!t) return res.status(404).json({ error: 'Not found' });
  res.json(t);
});

/** PATCH /tickets/:id/status  Body: { status } */
app.patch('/tickets/:id/status', (req, res) => {
  const t = tickets.get(req.params.id);
  if (!t) return res.status(404).json({ error: 'Not found' });
  const { status } = req.body || {};
  const allowed = ['NEW', 'IN_PROGRESS', 'RESOLVED'];
  if (!allowed.includes(status)) return res.status(400).json({ error: 'Invalid status' });
  t.status = status;
  res.json(t);
});

/** POST /tickets/:id/messages  Body: { body, fromAdmin? } */
app.post('/tickets/:id/messages', (req, res) => {
  const t = tickets.get(req.params.id);
  if (!t) return res.status(404).json({ error: 'Not found' });
  const { body, fromAdmin } = req.body || {};
  if (!body) return res.status(400).json({ error: 'Message body required' });
  const message = { id: crypto.randomUUID(), body, fromAdmin: !!fromAdmin, createdAt: new Date().toISOString() };
  t.messages.push(message);
  res.status(201).json(message);
});

/** DELETE /tickets/:id */
app.delete('/tickets/:id', (req, res) => {
  const t = tickets.get(req.params.id);
  if (!t) return res.status(404).json({ error: 'Not found' });
  tickets.delete(req.params.id);
  res.json({ message: 'Deleted successfully' });
});

// ── start
const port = process.env.PORT || 8081;
app.listen(port, () => console.log(`✅ API listening on http://localhost:${port}`));
