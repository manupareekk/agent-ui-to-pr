import type { DemoEvent, DemoVariant } from "../experiment.js";
import { StatsigClient } from "@statsig/js-client";

let client: StatsigClient | null = null;
let forcedVariant: DemoVariant | null = null;

function parseVariantFromExperiment(ex: {
  groupName: string | null;
  value: Record<string, unknown>;
}): DemoVariant | null {
  const g = ex.groupName?.trim().toUpperCase();
  if (g === "A" || g === "B") return g;
  const raw = ex.value?.variant;
  const v = typeof raw === "string" ? raw.trim().toUpperCase() : "";
  if (v === "A" || v === "B") return v;
  return null;
}

/**
 * Create a Statsig client SDK key in the Statsig console. Create an experiment named `demo_cta`
 * with groups or a parameter `variant` set to `A` / `B`.
 */
export async function initStatsigFromEnv(userId: string): Promise<void> {
  const key = import.meta.env.VITE_STATSIG_CLIENT_KEY?.trim();
  if (!key) {
    forcedVariant = null;
    return;
  }
  try {
    const c = new StatsigClient(key, { userID: userId });
    await c.initializeAsync();
    client = c;
    const ex = c.getExperiment("demo_cta");
    forcedVariant = parseVariantFromExperiment(ex);
  } catch (e) {
    console.warn("[statsig] init failed", e);
    client = null;
    forcedVariant = null;
  }
}

export function getStatsigForcedVariant(): DemoVariant | null {
  return forcedVariant;
}

export function captureStatsig(ev: DemoEvent): void {
  if (!client) return;
  const meta: Record<string, string> = {
    experiment: ev.experiment,
    variant: ev.variant,
    session_id: ev.sessionId,
    assignment: String(ev.payload?.assignment ?? ""),
  };
  if (ev.payload) {
    for (const [k, v] of Object.entries(ev.payload)) {
      if (k === "assignment") continue;
      meta[k] = typeof v === "string" ? v : JSON.stringify(v);
    }
  }
  client.logEvent(ev.name, undefined, meta);
}
