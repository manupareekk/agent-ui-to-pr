/**
 * Tiny local event sink: append one JSON object per line to ../data/events.ndjson
 * Point the browser at it with VITE_EVENTS_INGEST_URL=http://127.0.0.1:3847/events
 *
 * Run: npm run dev:ingest   (or npm run dev:full with the Vite app)
 *
 * Optional: INGEST_REDACT_KEYS=email,phone strips those keys from the top-level event and from payload before append.
 */
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const dataFile = path.join(root, "data", "events.ndjson");
const port = Number(process.env.INGEST_PORT || 3847);
const maxBodyBytes = Number(process.env.INGEST_MAX_BODY_BYTES || 262144);
const redactKeys = (process.env.INGEST_REDACT_KEYS || "")
  .split(",")
  .map((k) => k.trim())
  .filter(Boolean);

function redactEvent(obj) {
  if (!redactKeys.length || !obj || typeof obj !== "object") return obj;
  for (const k of redactKeys) {
    if (k in obj) delete obj[k];
    if (obj.payload && typeof obj.payload === "object" && k in obj.payload) {
      delete obj.payload[k];
    }
  }
  return obj;
}

function cors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

const server = http.createServer((req, res) => {
  cors(res);
  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }
  if (req.method === "POST" && req.url === "/events") {
    const chunks = [];
    let total = 0;
    let aborted = false;
    req.on("error", () => {
      aborted = true;
    });
    req.on("data", (c) => {
      if (aborted) return;
      total += c.length;
      if (total > maxBodyBytes) {
        aborted = true;
        res.writeHead(413);
        res.end("payload too large");
        req.destroy();
        return;
      }
      chunks.push(c);
    });
    req.on("end", () => {
      if (aborted) return;
      try {
        const raw = Buffer.concat(chunks).toString("utf8").trim();
        if (!raw) {
          res.writeHead(400);
          res.end("empty body");
          return;
        }
        const obj = JSON.parse(raw);
        redactEvent(obj);
        const line = JSON.stringify(obj);
        fs.mkdirSync(path.dirname(dataFile), { recursive: true });
        fs.appendFileSync(dataFile, line + "\n", "utf8");
        res.writeHead(204);
        res.end();
      } catch (e) {
        res.writeHead(400);
        res.end(String(e));
      }
    });
    return;
  }
  res.writeHead(404);
  res.end("POST /events only");
});

server.on("error", (err) => {
  console.error("[ingest] server error:", err.message);
  process.exit(1);
});

server.listen(port, "127.0.0.1", () => {
  console.log(`[ingest] http://127.0.0.1:${port}/events → ${dataFile}`);
});
