/**
 * Minimal experiment harness: sticky A/B assignment + structured event log.
 * Sinks live in `src/integrations/` (PostHog, HTTP ingest, Statsig).
 */

import { forwardExperimentEvent } from "./integrations/index.js";
import { getActivePatternLogFields, clearPatternSticky } from "./patternPolicy.js";
import { getStatsigForcedVariant } from "./integrations/statsig.js";
import { getSessionId, resetSessionId } from "./session.js";

export { getSessionId } from "./session.js";

const STORAGE_KEY = "a2ui-demo-experiment-demo_cta";

export type DemoVariant = "A" | "B";

/** When set from synced `config/experiment-defaults.json` → public, all users get this variant. */
let remoteWinner: DemoVariant | null = null;

/** Fetch once; call from app shell before first `getAssignedVariant()`. */
export async function loadExperimentDefaults(): Promise<void> {
  try {
    const res = await fetch(`${import.meta.env.BASE_URL}experiment-defaults.json`, {
      cache: "no-store",
    });
    if (!res.ok) return;
    const json = (await res.json()) as { demo_cta?: { winner?: string | null } };
    const w = json?.demo_cta?.winner;
    if (w === "A" || w === "B") remoteWinner = w;
  } catch {
    /* offline / adblock */
  }
}

export function getAssignmentMode(): "remote" | "statsig" | "client" {
  if (remoteWinner) return "remote";
  if (getStatsigForcedVariant()) return "statsig";
  return "client";
}

function stableHash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Sticky assignment for experiment `demo_cta` (50/50 A/B), unless remote or Statsig wins. */
export function getAssignedVariant(): DemoVariant {
  if (remoteWinner) return remoteWinner;
  const sg = getStatsigForcedVariant();
  if (sg) return sg;
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
    payload: {
      ...getActivePatternLogFields(),
      ...payload,
      assignment: getAssignmentMode(),
    },
  };
  buffer.push(ev);
  console.info("[experiment]", ev);
  forwardExperimentEvent(ev);
}

export function drainExperimentLog(): DemoEvent[] {
  return buffer.slice();
}

/**
 * Clears sticky A/B + pattern picks and **rotates the anonymous session id** so after reload
 * variant / segment / template can change (otherwise hashes from the same sessionId repeat).
 */
export function clearStickyAssignment(): void {
  clearPatternSticky();
  resetSessionId();
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
