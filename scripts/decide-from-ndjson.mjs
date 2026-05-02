#!/usr/bin/env node
/**
 * Reads data/events.ndjson, picks A/B by CTR, enforces min sample, SRM, rage guardrail.
 * Prints human-readable tables to stderr; prints exactly one stdout line:
 *   DECISION_WINNER=A|B   or   DECISION_FAIL=<encodeURIComponent(reason)>
 *
 * Env: MIN_PER_ARM (default 200), SRM_CHI_MAX (default 3.84), GUARDRAIL_RAGE_RATIO (default 1.15)
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const dataFile = path.join(root, "data", "events.ndjson");

const MIN_PER_ARM = Number(process.env.MIN_PER_ARM || "200");
const SRM_CHI_MAX = Number(process.env.SRM_CHI_MAX || "3.84");
const GUARDRAIL_RAGE_RATIO = Number(process.env.GUARDRAIL_RAGE_RATIO || "1.15");

function fail(msg) {
  console.error("DECISION FAILED:", msg);
  console.log(`DECISION_FAIL=${encodeURIComponent(msg)}`);
  process.exit(1);
}

function ok(winner) {
  console.error(`\n→ Winner: ${winner} (by primary CTR)\n`);
  console.log(`DECISION_WINNER=${winner}`);
  process.exit(0);
}

if (!fs.existsSync(dataFile)) {
  fail("missing_data_file");
}

const lines = fs.readFileSync(dataFile, "utf8").trim().split("\n").filter(Boolean);
const events = [];
for (const line of lines) {
  try {
    events.push(JSON.parse(line));
  } catch {
    /* skip */
  }
}

const exposures = { A: 0, B: 0 };
const clicks = { A: 0, B: 0 };
const rage = { A: 0, B: 0 };

for (const ev of events) {
  if (ev.experiment !== "demo_cta") continue;
  const v = ev.variant;
  if (v !== "A" && v !== "B") continue;
  if (ev.name === "surface_exposed") exposures[v]++;
  if (ev.name === "a2ui_action" && ev.payload?.name === "primary_cta") clicks[v]++;
  if (ev.name === "rage_proxy") rage[v]++;
}

console.error("--- Exposures (surface_exposed) ---");
console.error(exposures);
console.error("--- CTA clicks ---");
console.error(clicks);
console.error("--- Rage proxy events ---");
console.error(rage);

if (exposures.A < MIN_PER_ARM || exposures.B < MIN_PER_ARM) {
  fail(`min_per_arm (need >=${MIN_PER_ARM} each)`);
}

const n = exposures.A + exposures.B;
const exp = n * 0.5;
const chi = (exposures.A - exp) ** 2 / exp + (exposures.B - exp) ** 2 / exp;
console.error(`SRM chi-square (1df, expect ~0 at 50/50): ${chi.toFixed(3)} (max ${SRM_CHI_MAX})`);
if (chi > SRM_CHI_MAX) {
  fail("srm_sample_ratio_mismatch");
}

const ctrA = clicks.A / Math.max(1, exposures.A);
const ctrB = clicks.B / Math.max(1, exposures.B);
const winner = ctrB > ctrA ? "B" : ctrA > ctrB ? "A" : "A";
console.error(`CTR A=${ctrA.toFixed(4)} B=${ctrB.toFixed(4)} → primary pick ${winner}`);

const rageRateA = rage.A / Math.max(1, exposures.A);
const rageRateB = rage.B / Math.max(1, exposures.B);
if (rage.A + rage.B > 0 && winner === "B" && rageRateB > rageRateA * GUARDRAIL_RAGE_RATIO) {
  fail("guardrail_rage");
}

ok(winner);
