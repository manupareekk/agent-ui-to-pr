# A2UI experiment starter

A **small, deployable** demo: [Google A2UI](https://a2ui.org/) (official `@a2ui/lit` renderer, v0.9) plus a **minimal A/B assignment** and **structured event log**—the seed for “measure → decide → open a PR” workflows.

This repo is **not** a fork of [google/A2UI](https://github.com/google/A2UI). It **depends on** published npm packages and documents how to grow from here.

## Use it in 60 seconds (no browser required)

```bash
npm install
npm run demo:report
```

That **fabricates a few thousand fake sessions** into `data/events.ndjson`, then prints **variant tables** (B usually wins on clicks — it’s rigged slightly for demos). To match **CI** locally (two production builds + the same pipeline): `npm run verify`. Real traffic: use `npm run dev:full` + `.env` instead; see below.

## Quick start (UI)

```bash
npm install
npm run dev
```

Open the URL Vite prints (default **http://localhost:5180**). You should see an A2UI surface and a **Variant A / B** pill (sticky assignment). Click the primary button and watch the browser console for `[experiment]` lines. Use **“Re-roll my variant”** if you’re stuck on one arm while testing.

### Deploy (Vercel)

From this directory: `npx vercel` (static output: `dist/`). A `vercel.json` is included with `buildCommand` / `outputDirectory`.

### CI and GitHub Pages

- **CI** (`.github/workflows/ci.yml`) runs on every push/PR: `npm ci` then **`npm run verify`** (see `scripts/verify.mjs` — default build, second build with `VERIFY_VITE_BASE` / repo name for Pages URLs, then **`npm run demo:report`**).
- **Pages** (`.github/workflows/pages.yml`) is **`workflow_dispatch` only** so `main` stays green until you enable **Settings → Pages → GitHub Actions** and run **“Deploy GitHub Pages”** manually once.

## What is included today

- **A2UI v0.9** surface using `MessageProcessor` + `basicCatalog` (`@a2ui/lit`, `@a2ui/web_core`).
- **Experiment hook**: `getAssignedVariant()` + `logEvent()` in `src/experiment.ts` (localStorage sticky split).
- **Integrations** in **`src/integrations/`** — PostHog (`posthog-js`), HTTP POST to any ingest URL, Statsig (`@statsig/js-client` when `VITE_STATSIG_CLIENT_KEY` is set). Wire env vars from **`.env.example`**.
- **Local event sink**: **`server/ingest.mjs`** appends JSON lines to **`data/events.ndjson`**. Run **`npm run dev:full`** (Vite + ingest) or two terminals (`dev` + `dev:ingest`).
- **Offline rollup**: **`npm run analyze`** reads `data/events.ndjson` and prints simple tables.
- **Synthetic traffic**: **`npm run demo:synth`** / **`npm run demo:report`** — generate NDJSON + analyze without the UI (see **`scripts/simulate-traffic.mjs`**).
- **Promote PR workflow**: **`.github/workflows/promote-experiment.yml`** (Actions UI: **“Promote experiment PR”**) — `workflow_dispatch` picks **A** or **B**, patches **`config/experiment-defaults.json`** (synced to `public/` on `npm run dev` / `build`), opens a real PR. **`.github/workflows/promote-from-data.yml`** runs synthetic traffic + **`scripts/decide-from-ndjson.mjs`** (min-`n`, SRM, rage guardrail) then opens the same style of PR. If Actions 403s, enable **read/write** workflow permissions (see **`docs/PR_BOT.md`**).
- **Config example**: **`config/`** for future bot-targeted JSON beyond the static `public/` file.
- **Static demo messages** in `src/demoMessages.ts` (no Gemini key required).

## Wiring guides

- **[docs/INTEGRATIONS.md](./docs/INTEGRATIONS.md)** — PostHog, ingest URL, Statsig extension point.
- **[docs/PR_BOT.md](./docs/PR_BOT.md)** — how to replace placeholders with a real GitHub App / `gh` flow.

## Roadmap (KPI → PR)

See **[docs/PLAN.md](./docs/PLAN.md)** for phased work: exposures, outcomes, guardrails, analyzer job, GitHub App PRs, and optional CopilotKit/AG-UI for real agents.

## Official A2UI resources

- [A2UI site](https://a2ui.org/)
- [Specification](https://a2ui.org/specification/v0.9-a2ui/)
- [Google repo](https://github.com/google/A2UI) — full samples (e.g. restaurant demo with Python agent).

## License

Apache-2.0 (same family as A2UI). Your app code is yours; A2UI packages remain under their respective licenses.
