# Plan: from this starter to “KPI → PR”

This document is the **roadmap** you can attach to issues or a LinkedIn post. Each phase is shippable on its own.

## Phase 0 — Done in this repo

- Render an A2UI v0.9 surface from **static messages** (no LLM).
- Sticky **A/B** assignment for a single experiment key (`demo_cta`).
- **Structured logging** to the console + an on-page JSON dump (`logEvent`).
- **Sink stubs**: PostHog + HTTP ingest + Statsig hook (`src/integrations/`), local **NDJSON** server (`server/ingest.mjs`), **analyzer** script, **`promote-experiment.yml`** / **`promote-from-data.yml`** (PR patching `config/experiment-defaults.json`), plus docs under `docs/`.

## Beyond this starter (explicit gaps)

These are **product decisions and layers** you add on top of the same logging + promotion spine—not missing “by accident,” just out of scope for a small reference repo.

1. **Taxonomy of UI patterns** (“flag modal v3” vs “sheet”) as **first-class logged dimensions**  
   The starter logs generic experiment events (`surface_exposed`, `a2ui_action`, etc.). To compare *pattern families*, you encode **stable IDs** in payloads (e.g. `surface_kind`, `template_id`, `chrome_pack`) everywhere the agent or host emits UI—otherwise analytics can’t aggregate apples-to-apples.

2. **Automatic “feed winners into generation”** (backend prompt / template selection)  
   Promotion today is **pick A or B** for the single `demo_cta` demo (defaults JSON). It is **not** yet “promote a **library** of winning patterns per cohort” or push policy into your model/router. The next step is usually: metrics → **policy artifact** (config, ranked templates, rules table) → **structured context** on the backend call (or **template slots** so the model fills content, not chrome).

3. **Exploration vs exploitation, segments, template slots**  
   Bandits, cohort rules, “10% explore,” and “model chooses only inside catalog X” are **policy engines** above this kit. The starter gives you assignment + logs + a blunt decide + PR hook; you swap in your own decisioning and config shape when you outgrow one global A/B.

## Phase 1 — Real product telemetry

- Add stable **element / surface ids** on every meaningful interaction (already partially true via A2uiClientAction).
- Send events to **PostHog**, **Statsig**, **Amplitude**, or your own `/api/events` → warehouse.
- Log **exposure** (user saw variant) separately from **outcomes** (clicked CTA, completed task).

## Phase 2 — Decision rules

- Define **primary KPI** (e.g. CTA click rate) and **guardrail metrics** (e.g. rage clicks, error rate proxy).
- Implement a small **analyzer** (cron or serverless): aggregate by variant, apply minimum sample size + simple statistical rule (or use the vendor’s experiment engine).
- Output a machine-readable **decision** file (e.g. `decision.json`).

## Phase 3 — GitHub PR automation

- GitHub App or PAT with least privilege: open a branch, commit **config-as-code** (e.g. default variant, copy map, feature flag JSON).
- PR template auto-filled with **metrics table**, guardrail pass/fail, and experiment id.
- **CI gates**: typecheck, lint, optional visual regression on the host shell only.

## Phase 4 — Real agents (optional)

- Keep this repo as the **“host shell”**; connect an agent via **CopilotKit + AG-UI** (see [Google’s guide](https://github.com/google/A2UI/blob/main/docs/guides/a2ui-with-any-agent-framework.md)) or your own transport.
- The agent emits A2UI messages; your host still enforces **catalog + logging + experiments**.

## What stays out of scope (until you need it)

- Full Bayesian personalization (start with A/B or multi-armed bandits in a vendor).
- Silent auto-merge to production without guardrails (prefer **PR + review** or staged rollout).
