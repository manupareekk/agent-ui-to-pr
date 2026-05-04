#!/usr/bin/env node
/**
 * Writes synthetic experiment events to data/events.ndjson (same shape as the ingest server).
 * So you can run `npm run analyze` without clicking or running the browser.
 *
 *   node scripts/simulate-traffic.mjs 3000
 *   node scripts/simulate-traffic.mjs 5000 --fresh
 *
 * B is slightly more likely to "click" so tables usually favor B (toy winner for demos).
 * Rage events are deterministic per arm so offline `decide-from-ndjson` guardrails stay stable in CI.
 * Every event includes pattern taxonomy fields (segment_id, template_id, …) for `decide-pattern-winners.mjs`.
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
const parsed = Number.parseInt(String(nArg ?? "").trim(), 10);
const n = Math.min(
  5_000_000,
  Math.max(1, Number.isFinite(parsed) && parsed > 0 ? parsed : 2000),
);

if (fresh && fs.existsSync(dataFile)) fs.unlinkSync(dataFile);

const lines = [];
const base = Date.now();
const pClick = { A: 0.09, B: 0.13 };
const SEGMENT_COUNT = 4;
const TEMPLATES = ["flag_modal_v1", "sheet_v1"];

function patternPayload(i) {
  const seg = i % SEGMENT_COUNT;
  /** Alternate template across session index so each segment sees both templates (~50/50). */
  const templateId = TEMPLATES[Math.floor(i / SEGMENT_COUNT) % 2];
  const chrome_pack = templateId.includes("flag") ? "flag" : "sheet";
  return {
    assignment: "client",
    synthetic: true,
    surface_kind: "confirm_surface",
    pattern_family: "confirm_surface",
    template_id: templateId,
    chrome_pack,
    segment_id: String(seg),
  };
}

for (let i = 0; i < n; i++) {
  const variant = i % 2 === 0 ? "A" : "B";
  const sessionId = `sim_${i}`;
  const ts = () => new Date(base + i).toISOString();
  const armIndex = variant === "A" ? Math.floor(i / 2) : Math.floor((i - 1) / 2);
  const pat = patternPayload(i);

  lines.push(
    JSON.stringify({
      ts: ts(),
      experiment: "demo_cta",
      variant,
      sessionId,
      name: "surface_exposed",
      payload: { ...pat },
    }),
  );

  const sheetBoost = pat.template_id === "sheet_v1" ? 1.12 : 1;
  if (Math.random() < pClick[variant] * sheetBoost) {
    lines.push(
      JSON.stringify({
        ts: ts(),
        experiment: "demo_cta",
        variant,
        sessionId,
        name: "a2ui_action",
        payload: { name: "primary_cta", ...pat },
      }),
    );
  }

  /** Deterministic rage counts per arm so `decide-from-ndjson` guardrails stay stable in CI. */
  const rageEvery = variant === "A" ? 17 : 18;
  if (armIndex > 0 && armIndex % rageEvery === 0) {
    lines.push(
      JSON.stringify({
        ts: ts(),
        experiment: "demo_cta",
        variant,
        sessionId,
        name: "rage_proxy",
        payload: { ...pat },
      }),
    );
  }
}

fs.mkdirSync(path.dirname(dataFile), { recursive: true });
fs.appendFileSync(dataFile, lines.join("\n") + "\n", "utf8");
console.log(`Wrote ${lines.length} lines (${n} sessions) → ${dataFile}`);
console.log("Next: npm run analyze");
