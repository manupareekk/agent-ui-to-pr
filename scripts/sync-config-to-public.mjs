#!/usr/bin/env node
/**
 * Canonical config lives in config/experiment-defaults.json.
 * Static hosting reads public/experiment-defaults.json — copy before dev/build.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const src = path.join(root, "config", "experiment-defaults.json");
const dest = path.join(root, "public", "experiment-defaults.json");

if (!fs.existsSync(src)) {
  console.error("Missing", src);
  process.exit(1);
}
fs.mkdirSync(path.dirname(dest), { recursive: true });
fs.copyFileSync(src, dest);
console.log("synced", src, "→", dest);
