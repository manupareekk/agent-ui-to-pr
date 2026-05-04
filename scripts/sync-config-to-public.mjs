#!/usr/bin/env node
/**
 * Canonical JSON under config/ is copied to public/ for Vite static hosting.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const configDir = path.join(root, "config");
const publicDir = path.join(root, "public");

const files = ["experiment-defaults.json", "ui-pattern-policy.json"];

for (const name of files) {
  const src = path.join(configDir, name);
  const dest = path.join(publicDir, name);
  if (!fs.existsSync(src)) {
    console.error("Missing", src);
    process.exit(1);
  }
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
  console.log("synced", src, "→", dest);
}
