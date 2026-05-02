/**
 * Minimal offline rollup for ../data/events.ndjson (written by server/ingest.mjs).
 * Replace with SQL/dbt/Statsig console when you outgrow NDJSON.
 *
 * Run: npm run analyze
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const dataFile = path.join(root, "data", "events.ndjson");

if (!fs.existsSync(dataFile)) {
  console.log("No data file yet. Run `npm run dev:ingest`, set VITE_EVENTS_INGEST_URL in .env, use the app, then re-run.");
  process.exit(0);
}

const lines = fs.readFileSync(dataFile, "utf8").trim().split("\n").filter(Boolean);
const events = [];
for (const line of lines) {
  try {
    events.push(JSON.parse(line));
  } catch {
    /* skip bad line */
  }
}

const byVariant = { A: 0, B: 0 };
const exposures = { A: 0, B: 0 };
const ctaClicks = { A: 0, B: 0 };

for (const ev of events) {
  const v = ev.variant;
  if (v !== "A" && v !== "B") continue;
  byVariant[v] = (byVariant[v] || 0) + 1;
  if (ev.name === "surface_exposed") exposures[v]++;
  if (ev.name === "a2ui_action" && ev.payload?.name === "primary_cta") ctaClicks[v]++;
}

console.log("--- Raw counts (all events with variant) ---");
console.table(byVariant);
console.log("--- surface_exposed (proxy for assignment seen in log stream) ---");
console.table(exposures);
console.log("--- primary_cta clicks by variant ---");
console.table(ctaClicks);
