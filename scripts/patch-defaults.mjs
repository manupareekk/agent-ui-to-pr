#!/usr/bin/env node
/**
 * Writes public/experiment-defaults.json (what the static app fetches at runtime).
 * Used locally and by GitHub Actions before opening a promote PR.
 *
 *   node scripts/patch-defaults.mjs A
 *   node scripts/patch-defaults.mjs B
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const target = path.join(root, "public", "experiment-defaults.json");

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
