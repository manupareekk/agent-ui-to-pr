#!/usr/bin/env node
/**
 * Canonical file: config/experiment-defaults.json (PRs should touch this).
 * Copies to public/ for Vite static hosting.
 *
 *   node scripts/patch-defaults.mjs A
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const target = path.join(root, "config", "experiment-defaults.json");

const winner = (process.argv[2] || "").trim().toUpperCase();
if (winner !== "A" && winner !== "B") {
  console.error("Usage: node scripts/patch-defaults.mjs <A|B>");
  process.exit(1);
}

const body = {
  demo_cta: {
    winner,
    updatedAt: new Date().toISOString(),
  },
};

fs.mkdirSync(path.dirname(target), { recursive: true });
fs.writeFileSync(target, JSON.stringify(body, null, 2) + "\n", "utf8");
console.log("Wrote", target, body);

const r = spawnSync(process.execPath, [path.join(root, "scripts", "sync-config-to-public.mjs")], {
  stdio: "inherit",
  cwd: root,
});
if (r.status !== 0) process.exit(r.status ?? 1);
