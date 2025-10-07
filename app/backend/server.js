import express from "express";
import cors from "cors";
import ticketsRouter from "./routes/tickets.js"; // note the .js

const app = express();

// middleware
app.use(cors({ origin: true }));
app.use(express.json());

// health route
app.get("/health", (_req, res) => res.json({ ok: true }));

// all ticket APIs
app.use("/tickets", ticketsRouter);

// simple homepage so you don’t see “Cannot GET /”
app.get("/", (_req, res) => {
  res.type("text/html").send(`
    <h1>Zealthy Helpdesk API</h1>
    <p>✅ Server running on port ${process.env.PORT || 8080}</p>
    <ul>
      <li><a href="/health">GET /health</a></li>
      <li><a href="/tickets">GET /tickets</a></li>
    </ul>
  `);
});

// start server
const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`✅ API listening on http://localhost:${port}`);
});
