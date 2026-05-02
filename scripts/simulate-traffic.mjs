#!/usr/bin/env node
/**
 * Writes synthetic experiment events to data/events.ndjson (same shape as the ingest server).
 * So you can run `npm run analyze` without clicking or running the browser.
 *
 *   node scripts/simulate-traffic.mjs 3000
 *   node scripts/simulate-traffic.mjs 5000 --fresh
 *
 * B is slightly more likely to "click" so tables usually favor B (toy winner for demos).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const dataFile = path.join(root, "data", "events.ndjson");

const args = process.argv.slice(2);
const fresh = args.includes("--fresh");
const nArg = args.find((a) => a !== "--fresh");
const n = Math.max(1, parseInt(nArg || "2000", 10) || 2000);

if (fresh && fs.existsSync(dataFile)) fs.unlinkSync(dataFile);

const lines = [];
const base = Date.now();
const pClick = { A: 0.09, B: 0.13 };

for (let i = 0; i < n; i++) {
  const variant = i % 2 === 0 ? "A" : "B";
  const sessionId = `sim_${i}`;
  const ts = () => new Date(base + i).toISOString();

  lines.push(
    JSON.stringify({
      ts: ts(),
      experiment: "demo_cta",
      variant,
      sessionId,
      name: "surface_exposed",
      payload: { assignment: "client", synthetic: true },
    }),
  );

  if (Math.random() < pClick[variant]) {
    lines.push(
      JSON.stringify({
        ts: ts(),
        experiment: "demo_cta",
        variant,
        sessionId,
        name: "a2ui_action",
        payload: { name: "primary_cta", assignment: "client", synthetic: true },
      }),
    );
  }
}

fs.mkdirSync(path.dirname(dataFile), { recursive: true });
fs.appendFileSync(dataFile, lines.join("\n") + "\n", "utf8");
console.log(`Wrote ${lines.length} lines (${n} sessions) → ${dataFile}`);
console.log("Next: npm run analyze");
