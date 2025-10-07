import express from "express";
import crypto from "crypto";

const router = express.Router();

// In-memory store so you can run immediately
const tickets = new Map();

// POST /tickets
router.post("/", (req, res) => {
  const { name, email, description, attachment } = req.body || {};
  if (!name || !email || !description) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  const id = crypto.randomUUID();
  const ticket = {
    id,
    name,
    email,
    description,
    attachment: attachment || null,
    status: "NEW",
    messages: []
  };
  tickets.set(id, ticket);
  return res.status(201).json(ticket);
});

// GET /tickets/:id
router.get("/:id", (req, res) => {
  const t = tickets.get(req.params.id);
  if (!t) return res.status(404).json({ error: "Not found" });
  return res.json(t);
});

// PATCH /tickets/:id/status
router.patch("/:id/status", (req, res) => {
  const t = tickets.get(req.params.id);
  if (!t) return res.status(404).json({ error: "Not found" });

  const { status } = req.body || {};
  const allowed = ["NEW", "IN_PROGRESS", "RESOLVED"];
  if (!allowed.includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }
  t.status = status;
  return res.json(t);
});

// POST /tickets/:id/messages
router.post("/:id/messages", (req, res) => {
  const t = tickets.get(req.params.id);
  if (!t) return res.status(404).json({ error: "Not found" });

  const { body } = req.body || {};
  if (!body) return res.status(400).json({ error: "Message body required" });

  t.messages.push({ id: crypto.randomUUID(), body, createdAt: new Date().toISOString() });
  return res.status(201).json({ ok: true });
});

export default router;
