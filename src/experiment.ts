/**
 * Minimal experiment harness: sticky A/B assignment + structured event log.
 * Sinks live in `src/integrations/` (PostHog, HTTP ingest, Statsig placeholder).
 */

import { forwardExperimentEvent } from "./integrations/index.js";

const STORAGE_KEY = "a2ui-demo-experiment-demo_cta";

export type DemoVariant = "A" | "B";

/** When set from `public/experiment-defaults.json`, all users get this variant. */
let remoteWinner: DemoVariant | null = null;

/** Fetch once; call from app shell before first `getAssignedVariant()`. */
export async function loadExperimentDefaults(): Promise<void> {
  try {
    const res = await fetch("/experiment-defaults.json", { cache: "no-store" });
    if (!res.ok) return;
    const json = (await res.json()) as { demo_cta?: { winner?: string | null } };
    const w = json?.demo_cta?.winner;
    if (w === "A" || w === "B") remoteWinner = w;
  } catch {
    /* offline / adblock */
  }
}

export function getAssignmentMode(): "remote" | "client" {
  return remoteWinner ? "remote" : "client";
}

function stableHash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function getSessionId(): string {
  try {
    const k = "a2ui-demo-session";
    let id = sessionStorage.getItem(k);
    if (!id) {
      id = `sess_${crypto.randomUUID?.() ?? String(Date.now())}`;
      sessionStorage.setItem(k, id);
    }
    return id;
  } catch {
    return `sess_${Date.now()}`;
  }
}

/** Sticky assignment for experiment `demo_cta` (50/50 A/B), unless repo default wins. */
export function getAssignedVariant(): DemoVariant {
  if (remoteWinner) return remoteWinner;
  try {
    const existing = localStorage.getItem(STORAGE_KEY) as DemoVariant | null;
    if (existing === "A" || existing === "B") return existing;
  } catch {
    /* ignore */
  }
  const sid = getSessionId();
  const v: DemoVariant = stableHash(sid) % 2 === 0 ? "A" : "B";
  try {
    localStorage.setItem(STORAGE_KEY, v);
  } catch {
    /* ignore */
  }
  return v;
}

export type DemoEvent = {
  ts: string;
  experiment: string;
  variant: DemoVariant;
  sessionId: string;
  name: string;
  payload?: Record<string, unknown>;
};

const buffer: DemoEvent[] = [];

export function logEvent(name: string, payload?: Record<string, unknown>): void {
  const ev: DemoEvent = {
    ts: new Date().toISOString(),
    experiment: "demo_cta",
    variant: getAssignedVariant(),
    sessionId: getSessionId(),
    name,
    payload: { ...payload, assignment: getAssignmentMode() },
  };
  buffer.push(ev);
  console.info("[experiment]", ev);
  forwardExperimentEvent(ev);
}

export function drainExperimentLog(): DemoEvent[] {
  return buffer.slice();
}

/** Clears sticky A/B so the next load re-randomizes (local testing only). */
export function clearStickyAssignment(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
