# Integrations (plug-in map)

All client hooks read **`import.meta.env`** (Vite). Copy **`.env.example`** → **`.env`**.

| Goal | Where | Env / command |
|------|--------|-----------------|
| **PostHog** events | `src/integrations/posthog.ts` | `VITE_POSTHOG_KEY`, optional `VITE_POSTHOG_HOST` |
| **Your API** or local file sink | `src/integrations/httpIngest.ts` | `VITE_EVENTS_INGEST_URL` (POST JSON body per event) |
| **Statsig** (stub) | `src/integrations/statsig.ts` | `VITE_STATSIG_CLIENT_KEY` — add SDK + `logEvent` when ready |
| **More sinks** | `src/integrations/index.ts` | Add one line in `forwardExperimentEvent` |

## Local NDJSON sink

1. Terminal A: `npm run dev:ingest` (writes `data/events.ndjson`).
2. `.env`: `VITE_EVENTS_INGEST_URL=http://127.0.0.1:3847/events`
3. Terminal B: `npm run dev` (or `npm run dev:full` for both).
4. After clicking around: `npm run analyze`

## PostHog

1. Create a project key in PostHog.
2. `.env`: `VITE_POSTHOG_KEY=phc_...`
3. Events appear as `capture(name)` with `experiment`, `variant`, `session_id`, and payload fields.

You can still run **without** any env vars: events only go to the console + on-page buffer.
