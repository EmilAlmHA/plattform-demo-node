// A small notes app for the student platform demo.
// pg reads PGHOST, PGUSER, PGPASSWORD and PGDATABASE from the environment,
// which the platform sets when the project has a database.
const http = require("http");
const { Pool } = require("pg");

const pool = new Pool();
const escape = (s) =>
  String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

async function page(res) {
  const { rows } = await pool.query("SELECT text, created_at FROM notes ORDER BY id DESC LIMIT 20");
  const items = rows
    .map((r) => `<li>${escape(r.text)} <small>${r.created_at.toISOString().slice(0, 16)}</small></li>`)
    .join("");
  res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
  // Relative form action, so it works under /<project>/ on the platform.
  res.end(`<!doctype html><title>Demo Node</title><h1>Anteckningar (Node + PostgreSQL)</h1>
<form method="post" action="add"><input name="text" required maxlength="200"> <button>Spara</button></form>
<ul>${items}</ul>`);
}

http
  .createServer(async (req, res) => {
    try {
      if (req.method === "POST" && req.url === "/add") {
        let body = "";
        for await (const chunk of req) body += chunk;
        const text = (new URLSearchParams(body).get("text") || "").trim();
        if (text) await pool.query("INSERT INTO notes (text) VALUES ($1)", [text.slice(0, 200)]);
        res.writeHead(303, { Location: "./" });
        return res.end();
      }
      await page(res);
    } catch (err) {
      console.error(err);
      res.writeHead(500);
      res.end("Databasfel, se loggarna.");
    }
  })
  .listen(process.env.PORT || 3000, process.env.HOST || "0.0.0.0");
