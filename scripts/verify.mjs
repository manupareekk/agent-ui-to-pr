#!/usr/bin/env node
/**
 * Local / CI gate: default build, subpath build (matches GitHub Pages layout), synthetic pipeline.
 * In Actions, set VERIFY_VITE_BASE=/repo-name/ (CI does this automatically).
 */
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

function npmRun(script, extraEnv = {}) {
  const env = { ...process.env, ...extraEnv };
  const r = spawnSync("npm", ["run", script], {
    cwd: root,
    stdio: "inherit",
    env,
    shell: process.platform === "win32",
  });
  if (r.error) {
    console.error(r.error);
    process.exit(1);
  }
  if (r.status !== 0) process.exit(r.status ?? 1);
}

function withTrailingSlash(b) {
  if (!b || b === "/") return "/";
  const x = b.startsWith("/") ? b : `/${b}`;
  return x.endsWith("/") ? x : `${x}/`;
}

npmRun("build");

const baseRaw =
  process.env.VERIFY_VITE_BASE?.trim() ||
  process.env.VITE_BASE_PATH?.trim() ||
  "/__verify_base_path__/";
npmRun("build", { VITE_BASE_PATH: withTrailingSlash(baseRaw) });

npmRun("demo:report");

console.error("\nverify: all checks passed\n");
