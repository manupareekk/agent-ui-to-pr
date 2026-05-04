/**
 * Read-through API for agent backends: merged config + a suggested system-prompt slice.
 * Run: npm run dev:policy   (default http://127.0.0.1:3890)
 *
 * Your server can curl this and attach `suggested_system_prompt_slice` to the model call.
 */
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const port = Number(process.env.POLICY_API_PORT || 3890);

function readJson(name) {
  const p = path.join(root, "config", name);
  if (!fs.existsSync(p)) return null;
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

function buildPromptSlice(experimentDefaults, patternPolicy) {
  const lines = [
    "You generate or constrain A2UI v0.9 surfaces for a web host. Obey the host catalog.",
    "",
    "Current shipped defaults (do not contradict unless the user explicitly overrides):",
    JSON.stringify(
      { experiment_defaults: experimentDefaults ?? {}, ui_pattern_policy: patternPolicy ?? {} },
      null,
      2,
    ),
    "",
    "Prefer template_id from ui_pattern_policy.families.confirm_surface.segmentWinners for the user's segment when choosing chrome.",
  ];
  return lines.join("\n");
}

function cors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

const server = http.createServer((req, res) => {
  cors(res);
  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }
  if (req.method === "GET" && req.url === "/healthz") {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("ok");
    return;
  }
  if (req.method === "GET" && (req.url === "/api/policy-snapshot" || req.url?.startsWith("/api/policy-snapshot?"))) {
    const experimentDefaults = readJson("experiment-defaults.json");
    const uiPatternPolicy = readJson("ui-pattern-policy.json");
    const body = {
      experiment_defaults: experimentDefaults,
      ui_pattern_policy: uiPatternPolicy,
      suggested_system_prompt_slice: buildPromptSlice(experimentDefaults, uiPatternPolicy),
    };
    res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
    res.end(JSON.stringify(body, null, 2));
    return;
  }
  res.writeHead(404, { "Content-Type": "text/plain" });
  res.end("GET /api/policy-snapshot or /healthz");
});

server.on("error", (err) => {
  console.error("[policy-context] server error:", err.message);
  process.exit(1);
});

server.listen(port, "127.0.0.1", () => {
  console.log(`[policy-context] http://127.0.0.1:${port}/api/policy-snapshot`);
});
