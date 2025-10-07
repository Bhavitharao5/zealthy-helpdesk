import { useEffect, useState } from "react";
import {
  listTickets,
  createTicket,
  updateStatus,
  addMessage,
  deleteTicket,
} from "./api";
import "./App.css";

export default function App() {
  const [tickets, setTickets] = useState([]);
  const [filter, setFilter] = useState("ALL");

  // Form with ALL options (ordered like before)
  const [form, setForm] = useState({
    requestType: "IT Request",
    name: "",
    email: "",
    subject: "",
    description: "",
    testInfo: "",
    cc: "",
    ccEnabled: false,
    location: "NYC",
    room: "",
    priority: "Medium",
  });

  // Image attachments (base64 thumbnails sent to backend)
  const [images, setImages] = useState([]); // [{name,type,data}]

  // Admin modal state
  const [adminTicket, setAdminTicket] = useState(null);

  async function refresh() {
    const data = await listTickets();
    setTickets(data);
  }
  useEffect(() => { refresh(); }, []);

  // file -> data URL
  function fileToDataURL(file) {
    return new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve({ name: file.name, type: file.type, data: r.result });
      r.onerror = reject;
      r.readAsDataURL(file);
    });
  }

  async function onPickImages(e) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const list = await Promise.all(files.map(fileToDataURL));
    setImages(prev => [...prev, ...list]);
    e.target.value = "";
  }

  function removeImage(i) {
    setImages(arr => arr.filter((_, idx) => idx !== i));
  }

  async function onSubmit(e) {
    e.preventDefault();
    const { name, email, description } = form;
    if (!name || !email || !description) {
      alert("Please fill Name, Email, and Description.");
      return;
    }
    const payload = {
      requestType: form.requestType,
      name: form.name,
      email: form.email,
      subject: form.subject,
      description: form.description,
      testInfo: form.testInfo,
      cc: form.ccEnabled ? form.cc : "",
      location: form.location,
      room: form.room,
      priority: form.priority,
      attachments: images, // [{ name,type,data }]
    };
    await createTicket(payload);
    setForm({
      requestType: "IT Request",
      name: "",
      email: "",
      subject: "",
      description: "",
      testInfo: "",
      cc: "",
      ccEnabled: false,
      location: "NYC",
      room: "",
      priority: "Medium",
    });
    setImages([]);
    refresh();
  }

  const filtered = filter === "ALL" ? tickets : tickets.filter(t => t.status === filter);

  return (
    <div className="hd-shell">
      <header className="hd-header">
        <div className="brand">🎟️ Help Desk System</div>
      </header>

      <div className="hd-grid">
        {/* LEFT — Form */}
        <section className="card">
          <h2 className="title">Help Request</h2>
          <form className="form" onSubmit={onSubmit}>
            <label>Request Type
              <select
                value={form.requestType}
                onChange={(e) => setForm({ ...form, requestType: e.target.value })}
              >
                <option>IT Request</option>
                <option>Facilities</option>
                <option>HR</option>
              </select>
            </label>

            <label>Name <span className="req">*</span>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Your full name"
              />
            </label>

            <label>Email <span className="req">*</span>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
              />
            </label>

            <label>Subject
              <input
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                placeholder="Short summary"
              />
            </label>

            <label>Request Detail <span className="req">*</span>
              <textarea
                rows={5}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Describe the issue…"
              />
            </label>

            <label>Notes
              <input
                value={form.testInfo}
                onChange={(e) => setForm({ ...form, testInfo: e.target.value })}
                placeholder="Optional notes"
              />
            </label>

            <div className="row">
              <label className="grow">Carbon Copy (Cc)
                <input
                  disabled={!form.ccEnabled}
                  value={form.cc}
                  onChange={(e) => setForm({ ...form, cc: e.target.value })}
                  placeholder="name@example.com"
                />
              </label>
              <label className="chk">
                <input
                  type="checkbox"
                  checked={form.ccEnabled}
                  onChange={(e) => setForm({ ...form, ccEnabled: e.target.checked })}
                />
                Enabled
              </label>
            </div>

            <div className="label-row">
              <span>Attachments (images)</span>
              <label className="pick-btn">
                <input type="file" accept="image/*" multiple onChange={onPickImages} />
                Add Images
              </label>
            </div>
            {images.length > 0 && (
              <div className="thumbs">
                {images.map((img, i) => (
                  <div key={i} className="thumb">
                    <img src={img.data} alt={img.name} />
                    <button type="button" onClick={() => removeImage(i)}>✕</button>
                  </div>
                ))}
              </div>
            )}

            <div className="row">
              <label className="grow">Location
                <select
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                >
                  <option>NYC</option>
                  <option>ATL</option>
                  <option>SFO</option>
                </select>
              </label>

              <label className="grow">Room
                <select
                  value={form.room}
                  onChange={(e) => setForm({ ...form, room: e.target.value })}
                >
                  <option value="">(none)</option>
                  <option>101</option>
                  <option>202</option>
                  <option>305</option>
                </select>
              </label>
            </div>

            <label>Priority
              <select
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
              >
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
                <option>Urgent</option>
              </select>
            </label>

            <div className="actions">
              <button type="submit" className="btn primary">+ Create Ticket</button>
              <button
                type="button"
                className="btn ghost"
                onClick={() =>
                  setForm({
                    requestType: "IT Request",
                    name: "", email: "",
                    subject: "", description: "", testInfo: "",
                    cc: "", ccEnabled: false,
                    location: "NYC", room: "", priority: "Medium",
                  })
                }
              >
                Cancel
              </button>
            </div>
          </form>
        </section>

        {/* RIGHT — Filters + compact list + Go to Admin */}
        <section className="card">
          <h2 className="title">Tickets</h2>

          <div className="filters">
            <button className={filter==="ALL"?"active":""} onClick={() => setFilter("ALL")}>All</button>
            <button className={filter==="NEW"?"active":""} onClick={() => setFilter("NEW")}>New</button>
            <button className={filter==="IN_PROGRESS"?"active":""} onClick={() => setFilter("IN_PROGRESS")}>In Progress</button>
            <button className={filter==="RESOLVED"?"active":""} onClick={() => setFilter("RESOLVED")}>Resolved</button>
          </div>

          {filtered.length === 0 ? (
            <p className="muted">No tickets yet.</p>
          ) : (
            <div className="list">
              {filtered.map(t => (
                <article className="ticket" key={t.id}>
                  <div className="ticket-head">
                    <div className="ticket-main">
                      <b>{t.name}</b>
                      <div className="meta">{t.email}</div>
                    </div>
                    <span className={`status ${t.status?.toLowerCase?.()}`}>{t.status}</span>
                  </div>

                  {/* Only the issue in list */}
                  <p className="body">{t.description}</p>

                  <div className="actions line">
                    <button className="btn" onClick={() => setAdminTicket(t)}>Go to Admin</button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Admin modal: full ticket + images + actions */}
      {adminTicket && (
        <AdminModal
          ticket={adminTicket}
          onClose={() => setAdminTicket(null)}
          onRefresh={refresh}
        />
      )}
    </div>
  );
}

/* ---------- Admin Modal (with zoom lightbox) ---------- */
function AdminModal({ ticket, onClose, onRefresh }) {
  const [msg, setMsg] = useState("");

  // Lightbox / zoom state
  const [zoom, setZoom] = useState({ open: false, src: "", name: "" });
  function openZoom(src, name = "") { setZoom({ open: true, src, name }); }
  function closeZoom() { setZoom({ open: false, src: "", name: "" }); }

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal">
        <div className="modal-head">
          <h3>Admin — Ticket</h3>
          <button className="icon-btn" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <div className="info">
            <div><b>Name:</b> {ticket.name}</div>
            <div><b>Email:</b> {ticket.email}</div>
            <div><b>Status:</b> {ticket.status}</div>
            <div><b>Created:</b> {new Date(ticket.createdAt).toLocaleString()}</div>
            {ticket.subject ? <div style={{gridColumn:"1 / -1"}}><b>Subject:</b> {ticket.subject}</div> : null}
          </div>

          <div className="section">
            <div className="label">Issue</div>
            <div className="issue-box">{ticket.description}</div>
          </div>

          <div className="section">
            <div className="label">Attachments</div>
            {Array.isArray(ticket.attachments) && ticket.attachments.length > 0 ? (
              <div className="thumbs readonly">
                {ticket.attachments.map((a, i) =>
                  a?.data?.startsWith("data:image") ? (
                    <img
                      key={i}
                      className="zoom-thumb"
                      src={a.data}
                      alt={a.name || `image-${i}`}
                      onClick={() => openZoom(a.data, a.name)}
                      title="Click to zoom"
                    />
                  ) : null
                )}
              </div>
            ) : (
              <div className="muted">No images attached.</div>
            )}
          </div>

          <div className="section">
            <div className="label">Actions</div>
            <div className="actions">
              <button onClick={() => updateStatus(ticket.id, "NEW").then(onRefresh)}>New</button>
              <button onClick={() => updateStatus(ticket.id, "IN_PROGRESS").then(onRefresh)}>In Progress</button>
              <button onClick={() => updateStatus(ticket.id, "RESOLVED").then(onRefresh)}>Resolved</button>
              <button
                className="danger"
                onClick={async () => {
                  if (confirm("Delete this ticket?")) {
                    await deleteTicket(ticket.id);
                    onRefresh();
                    onClose();
                  }
                }}
              >
                Delete
              </button>
            </div>
          </div>

          <form
            className="msg-form"
            onSubmit={async (e) => {
              e.preventDefault();
              const body = msg.trim();
              if (!body) return;
              await addMessage(ticket.id, body, true);
              setMsg("");
              onRefresh();
            }}
          >
            <input
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
              placeholder="Add an admin note…"
            />
            <button className="btn">Send</button>
          </form>

          {ticket.messages?.length > 0 && (
            <ul className="messages">
              {ticket.messages.map((m) => (
                <li key={m.id}>
                  <b>{m.fromAdmin ? "Admin" : "User"}:</b> {m.body}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Lightbox overlay */}
      {zoom.open && <Lightbox src={zoom.src} name={zoom.name} onClose={closeZoom} />}
    </div>
  );
}

/* ---------- Simple Lightbox component ---------- */
function Lightbox({ src, name = "", onClose }) {
  const [scale, setScale] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [drag, setDrag] = useState({ active: false, startX: 0, startY: 0 });

  function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

  function onWheel(e) {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.1 : 0.9;
    setScale(s => clamp(s * factor, 0.5, 6));
  }

  function onMouseDown(e) {
    e.preventDefault();
    setDrag({ active: true, startX: e.clientX - pos.x, startY: e.clientY - pos.y });
  }
  function onMouseMove(e) {
    if (!drag.active) return;
    setPos({ x: e.clientX - drag.startX, y: e.clientY - drag.startY });
  }
  function onMouseUp() { setDrag(d => ({ ...d, active: false })); }

  function reset() { setScale(1); setPos({ x: 0, y: 0 }); }
  function zoomIn() { setScale(s => clamp(s * 1.2, 0.5, 6)); }
  function zoomOut() { setScale(s => clamp(s / 1.2, 0.5, 6)); }

  useEffect(() => {
    function onKey(e) { if (e.key === "Escape") onClose(); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="lightbox-backdrop" onClick={onClose}>
      <div className="lightbox-surface" onClick={(e) => e.stopPropagation()}>
        <div className="lightbox-controls">
          <span className="lb-name" title={name}>{name || "Image"}</span>
          <div className="lb-buttons">
            <button onClick={zoomOut} aria-label="Zoom out">−</button>
            <button onClick={zoomIn} aria-label="Zoom in">+</button>
            <button onClick={reset} aria-label="Reset">Reset</button>
            <button onClick={onClose} aria-label="Close">Close ✕</button>
          </div>
        </div>

        <div
          className="lightbox-stage"
          onWheel={onWheel}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
        >
          <img
            src={src}
            alt={name || "image"}
            draggable={false}
            style={{ transform: `translate(${pos.x}px, ${pos.y}px) scale(${scale})` }}
          />
        </div>
      </div>
    </div>
  );
}
