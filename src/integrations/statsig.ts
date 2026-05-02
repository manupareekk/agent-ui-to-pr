import type { DemoEvent } from "../experiment.js";

/**
 * Statsig placeholder — add `@statsig/js-client` (or use their HTTP API) and
 * initialize here with `import.meta.env.VITE_STATSIG_CLIENT_KEY`.
 *
 * Suggested pattern:
 * 1. npm i @statsig/js-client
 * 2. create a Statsig client once, identify(user) with your session id
 * 3. logEvent(ev.name, ev.payload) with experiment + variant as metadata
 */
export function captureStatsigPlaceholder(_ev: DemoEvent): void {
  if (!import.meta.env.VITE_STATSIG_CLIENT_KEY) return;
  // Deliberately empty: wire your client when you add the dependency.
}
