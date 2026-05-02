# A2UI experiment starter

A **small, deployable** demo: [Google A2UI](https://a2ui.org/) (official `@a2ui/lit` renderer, v0.9) plus a **minimal A/B assignment** and **structured event log**—the seed for “measure → decide → open a PR” workflows.

This repo is **not** a fork of [google/A2UI](https://github.com/google/A2UI). It **depends on** published npm packages and documents how to grow from here.

## Quick start

```bash
npm install
npm run dev
```

Open the URL Vite prints (default **http://localhost:5180**). You should see an A2UI surface and a **Variant A / B** pill (sticky assignment). Click the primary button and watch the browser console for `[experiment]` lines.

### Deploy (Vercel)

From this directory: `npx vercel` (static output: `dist/`). A `vercel.json` is included with `buildCommand` / `outputDirectory`.

## What is included today

- **A2UI v0.9** surface using `MessageProcessor` + `basicCatalog` (`@a2ui/lit`, `@a2ui/web_core`).
- **Experiment hook**: `getAssignedVariant()` + `logEvent()` in `src/experiment.ts` (localStorage sticky split). **Replace** with PostHog / Statsig / your collector when you are ready.
- **Static demo messages** in `src/demoMessages.ts` (no Gemini key required).

## Roadmap (KPI → PR)

See **[docs/PLAN.md](./docs/PLAN.md)** for phased work: exposures, outcomes, guardrails, analyzer job, GitHub App PRs, and optional CopilotKit/AG-UI for real agents.

## Official A2UI resources

- [A2UI site](https://a2ui.org/)
- [Specification](https://a2ui.org/specification/v0.9-a2ui/)
- [Google repo](https://github.com/google/A2UI) — full samples (e.g. restaurant demo with Python agent).

## License

Apache-2.0 (same family as A2UI). Your app code is yours; A2UI packages remain under their respective licenses.
