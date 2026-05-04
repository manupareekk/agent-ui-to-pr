#!/usr/bin/env node
/** JSON.parse every tracked config file under config/*.json (excludes *.example.json). */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dir = path.join(__dirname, "..", "config");
const names = fs.readdirSync(dir).filter((f) => f.endsWith(".json") && !f.endsWith(".example.json"));

for (const name of names) {
  const p = path.join(dir, name);
  const txt = fs.readFileSync(p, "utf8");
  try {
    JSON.parse(txt);
    console.log("ok", p);
  } catch (e) {
    console.error("invalid JSON", p, e);
    process.exit(1);
  }
}
