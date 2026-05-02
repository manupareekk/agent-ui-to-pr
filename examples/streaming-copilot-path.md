# Streaming / Copilot-style A2UI path (sketch)

This starter uses **static** `MessageProcessor.processMessages(...)` in `src/main.ts`. For a **streaming** or **Copilot** flow:

1. **Transport** — Replace the one-shot `buildDemoMessages(variant)` call with a source that yields A2UI JSON chunks (SSE, WebSocket, or Cursor agent tool output).
2. **Incremental parse** — Feed each chunk into the same `MessageProcessor` API your A2UI version documents for partial updates (v0.9 may expose stream-oriented helpers; follow `@a2ui/web_core` release notes).
3. **Experiment events** — Keep `logEvent` at meaningful boundaries (`surface_exposed` once the surface is first shown; `a2ui_action` on user actions). Include `variant` and `sessionId` on every event so NDJSON ingest and `scripts/decide-from-ndjson.mjs` stay valid.
4. **Server** — A small relay that forwards the model stream to the browser and optionally mirrors structured lines to `server/ingest.mjs` closes the loop with the same KPI → PR tooling.

No extra code ships here so the demo stays a single static bundle; copy `ExperimentHost` and swap the message source when you wire streaming.
