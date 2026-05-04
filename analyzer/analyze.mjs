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
const rage = { A: 0, B: 0 };
const byTemplate = {};

for (const ev of events) {
  const v = ev.variant;
  if (v !== "A" && v !== "B") continue;
  byVariant[v] = (byVariant[v] || 0) + 1;
  if (ev.name === "surface_exposed") {
    exposures[v]++;
    const tid = ev.payload?.template_id;
    if (tid) byTemplate[tid] = (byTemplate[tid] || 0) + 1;
  }
  if (ev.name === "a2ui_action" && ev.payload?.name === "primary_cta") ctaClicks[v]++;
  if (ev.name === "rage_proxy") rage[v]++;
}

console.log("--- Raw counts (all events with variant) ---");
console.table(byVariant);
console.log("--- surface_exposed (proxy for assignment seen in log stream) ---");
console.table(exposures);
console.log("--- surface_exposed by template_id ---");
console.table(byTemplate);
console.log("--- primary_cta clicks by variant ---");
console.table(ctaClicks);
console.log("--- rage_proxy by variant ---");
console.table(rage);

const nExp = exposures.A + exposures.B;
if (nExp > 0) {
  const exp = nExp * 0.5;
  const chi = (exposures.A - exp) ** 2 / exp + (exposures.B - exp) ** 2 / exp;
  console.log(`SRM check (50/50): chi-square(1df) = ${chi.toFixed(3)} (reject if > 3.84)`);
}
