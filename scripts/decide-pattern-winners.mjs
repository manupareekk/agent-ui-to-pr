#!/usr/bin/env node
/**
 * Aggregates demo_cta events by segment_id × template_id (from surface_exposed payload),
 * picks per-segment template with highest primary CTA CTR (min cell size).
 *
 *   node scripts/decide-pattern-winners.mjs
 *   node scripts/decide-pattern-winners.mjs --apply   # merge into config/ui-pattern-policy.json + sync
 *
 * Stdout (last line): PATTERN_DECISION_JSON=<encodeURIComponent(json)>
 * Env: MIN_PATTERN_CELL (default 40), FAMILY (default confirm_surface)
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const dataFile = path.join(root, "data", "events.ndjson");
const policyFile = path.join(root, "config", "ui-pattern-policy.json");

const MIN_CELL = Number(process.env.MIN_PATTERN_CELL || "40");
const FAMILY = (process.env.PATTERN_FAMILY || "confirm_surface").trim();

function fail(msg) {
  console.error("PATTERN DECISION FAILED:", msg);
  console.log(`PATTERN_DECISION_FAIL=${encodeURIComponent(msg)}`);
  process.exit(1);
}

const apply = process.argv.includes("--apply");

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

/** @type {Map<string, { segment_id?: string, template_id?: string, clicked: boolean }>} */
const sessions = new Map();

for (const ev of events) {
  if (ev.experiment !== "demo_cta") continue;
  const sid = ev.sessionId;
  if (!sessions.has(sid)) {
    sessions.set(sid, { clicked: false });
  }
  const s = sessions.get(sid);
  if (ev.name === "surface_exposed") {
    if (s.template_id !== undefined) continue;
    s.segment_id = ev.payload?.segment_id != null ? String(ev.payload.segment_id) : undefined;
    s.template_id = ev.payload?.template_id != null ? String(ev.payload.template_id) : undefined;
    s.pattern_family = ev.payload?.pattern_family != null ? String(ev.payload.pattern_family) : undefined;
  }
  if (ev.name === "a2ui_action" && ev.payload?.name === "primary_cta") {
    s.clicked = true;
  }
}

/** @type {Map<string, { exp: number, clk: number }>} */
const cells = new Map();

for (const [, s] of sessions) {
  if (!s.template_id || s.segment_id === undefined) continue;
  if (s.pattern_family && s.pattern_family !== FAMILY) continue;
  const k = `${s.segment_id}|${s.template_id}`;
  if (!cells.has(k)) cells.set(k, { exp: 0, clk: 0 });
  const c = cells.get(k);
  c.exp += 1;
  if (s.clicked) c.clk += 1;
}

console.error("--- Pattern cells (segment|template → exposures, clicks) ---");
console.error(Object.fromEntries(cells));

/** @type {Map<string, Map<string, { exp: number, clk: number }>>} */
const bySeg = new Map();
for (const [k, v] of cells) {
  const [seg, tmpl] = k.split("|");
  if (!bySeg.has(seg)) bySeg.set(seg, new Map());
  bySeg.get(seg).set(tmpl, { exp: v.exp, clk: v.clk });
}

const segmentWinners = {};

for (const [seg, tmplMap] of bySeg) {
  let bestT = null;
  let bestCtr = -1;
  for (const [tmpl, { exp, clk }] of tmplMap) {
    if (exp < MIN_CELL) continue;
    const ctr = clk / exp;
    if (ctr > bestCtr || (ctr === bestCtr && tmpl < (bestT ?? ""))) {
      bestCtr = ctr;
      bestT = tmpl;
    }
  }
  if (bestT) {
    segmentWinners[seg] = bestT;
    console.error(`segment ${seg} → ${bestT} (CTR ${bestCtr.toFixed(4)}, min cell ${MIN_CELL})`);
  } else {
    console.error(`segment ${seg} → skip (no template met min cell ${MIN_CELL})`);
  }
}

if (Object.keys(segmentWinners).length === 0) {
  fail("no_segment_winners");
}

const decision = {
  families: {
    [FAMILY]: { segmentWinners },
  },
};

const json = JSON.stringify(decision);
console.error("\n→ Pattern decision JSON\n");
console.log(`PATTERN_DECISION_JSON=${encodeURIComponent(json)}`);

if (apply) {
  if (!fs.existsSync(policyFile)) {
    fail("missing_policy_file");
  }
  const policy = JSON.parse(fs.readFileSync(policyFile, "utf8"));
  if (!policy.families?.[FAMILY]) {
    fail("policy_missing_family");
  }
  policy.families[FAMILY].segmentWinners = {
    ...policy.families[FAMILY].segmentWinners,
    ...segmentWinners,
  };
  policy.updatedAt = new Date().toISOString();
  fs.writeFileSync(policyFile, JSON.stringify(policy, null, 2) + "\n", "utf8");
  console.error("Wrote", policyFile);

  const r = spawnSync(process.execPath, [path.join(root, "scripts", "sync-config-to-public.mjs")], {
    stdio: "inherit",
    cwd: root,
  });
  if (r.status !== 0) process.exit(r.status ?? 1);
}
