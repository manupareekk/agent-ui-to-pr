import type { DemoEvent } from "../experiment.js";

/** POST each event as JSON to `VITE_EVENTS_INGEST_URL` (e.g. local ingest server). */
export function forwardToHttpIngest(ev: DemoEvent): void {
  const url = import.meta.env.VITE_EVENTS_INGEST_URL?.trim();
  if (!url) return;

  void fetch(url, {
    method: "POST",
    mode: "cors",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(ev),
  }).catch((err) => {
    console.warn("[ingest] POST failed", err);
  });
}
