/**
 * Minimal experiment harness: sticky A/B assignment + structured event log.
 * Swap `logEvent` for PostHog / Statsig / your API when you wire production.
 */

const STORAGE_KEY = "a2ui-demo-experiment-demo_cta";

export type DemoVariant = "A" | "B";

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

/** Sticky assignment for experiment `demo_cta` (50/50 A/B). */
export function getAssignedVariant(): DemoVariant {
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
    payload,
  };
  buffer.push(ev);
  console.info("[experiment]", ev);
}

export function drainExperimentLog(): DemoEvent[] {
  return buffer.slice();
}
