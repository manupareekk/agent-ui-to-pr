import type { DemoEvent } from "../experiment.js";
import { forwardToHttpIngest } from "./httpIngest.js";
import { capturePosthog } from "./posthog.js";
import { captureStatsig } from "./statsig.js";

/** Single place to plug sinks; add Datadog RUM, Amplitude, etc. here. */
export function forwardExperimentEvent(ev: DemoEvent): void {
  forwardToHttpIngest(ev);
  capturePosthog(ev);
  captureStatsig(ev);
}
