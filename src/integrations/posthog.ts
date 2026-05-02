import type { DemoEvent } from "../experiment.js";
import { getSessionId } from "../session.js";

type PostHog = {
  init: (key: string, options: { api_host: string; person_profiles?: string }) => void;
  capture: (event: string, props?: Record<string, unknown>) => void;
  identify?: (distinctId: string) => void;
};

let posthog: PostHog | null = null;
let loadFailed = false;

/** Call once from the app shell (e.g. experiment-host connectedCallback). */
export async function initPosthogFromEnv(): Promise<void> {
  const key = import.meta.env.VITE_POSTHOG_KEY?.trim();
  if (!key || posthog || loadFailed) return;

  try {
    const mod = await import("posthog-js");
    posthog = mod.default as PostHog;
    posthog.init(key, {
      api_host: import.meta.env.VITE_POSTHOG_HOST?.trim() || "https://us.i.posthog.com",
      person_profiles: "identified_only",
    });
    posthog.identify?.(getSessionId());
  } catch (e) {
    loadFailed = true;
    console.warn("[posthog] install dependency: npm i posthog-js", e);
  }
}

export function capturePosthog(ev: DemoEvent): void {
  if (!posthog) return;
  posthog.capture(ev.name, {
    experiment: ev.experiment,
    variant: ev.variant,
    session_id: ev.sessionId,
    ...ev.payload,
  });
}
