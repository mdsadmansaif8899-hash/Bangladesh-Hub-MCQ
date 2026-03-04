import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = new Database("database.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS exam_results (
    id TEXT PRIMARY KEY,
    userName TEXT,
    date TEXT,
    score INTEGER,
    totalQuestions INTEGER,
    timeSpent INTEGER,
    answers TEXT
  );

  CREATE TABLE IF NOT EXISTS comments (
    id TEXT PRIMARY KEY,
    userName TEXT,
    email TEXT,
    content TEXT,
    date TEXT,
    reply TEXT,
    replyDate TEXT
  );
`);

async function startServer() {
  const app = express();
  app.use(express.json());

  // API Routes
  app.get("/api/results", (req, res) => {
    const results = db.prepare("SELECT * FROM exam_results ORDER BY score DESC, date DESC").all();
    res.json(results.map(r => ({ ...r, answers: JSON.parse(r.answers as string) })));
  });

  app.post("/api/results", (req, res) => {
    const { id, userName, date, score, totalQuestions, timeSpent, answers } = req.body;
    db.prepare(`
      INSERT INTO exam_results (id, userName, date, score, totalQuestions, timeSpent, answers)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(id, userName, date, score, totalQuestions, timeSpent, JSON.stringify(answers));
    res.status(201).json({ status: "success" });
  });

  app.delete("/api/results/:id", (req, res) => {
    db.prepare("DELETE FROM exam_results WHERE id = ?").run(req.params.id);
    res.json({ status: "success" });
  });

  app.patch("/api/results/:id", (req, res) => {
    const { userName, score } = req.body;
    db.prepare("UPDATE exam_results SET userName = ?, score = ? WHERE id = ?").run(userName, score, req.params.id);
    res.json({ status: "success" });
  });

  app.get("/api/comments", (req, res) => {
    const comments = db.prepare("SELECT * FROM comments ORDER BY date DESC").all();
    res.json(comments);
  });

  app.post("/api/comments", (req, res) => {
    const { id, userName, email, content, date } = req.body;
    db.prepare(`
      INSERT INTO comments (id, userName, email, content, date)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, userName, email, content, date);
    res.status(201).json({ status: "success" });
  });

  app.patch("/api/comments/:id/reply", (req, res) => {
    const { reply, replyDate } = req.body;
    db.prepare("UPDATE comments SET reply = ?, replyDate = ? WHERE id = ?").run(reply, replyDate, req.params.id);
    res.json({ status: "success" });
  });

  app.delete("/api/comments/:id", (req, res) => {
    db.prepare("DELETE FROM comments WHERE id = ?").run(req.params.id);
    res.json({ status: "success" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  const PORT = 3000;
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
