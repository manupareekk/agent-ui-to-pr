import type { DemoVariant } from "./experiment.js";

const CATALOG_ID = "https://a2ui.org/specification/v0_9/basic_catalog.json";
const SURFACE_ID = "demo";

/** Static A2UI v0.9 messages (two CTA label variants) — no LLM required for the demo. */
export function buildDemoMessages(variant: DemoVariant): unknown[] {
  const ctaLabel = variant === "A" ? "Get started" : "Start free";

  return [
    {
      version: "v0.9",
      createSurface: {
        surfaceId: SURFACE_ID,
        catalogId: CATALOG_ID,
      },
    },
    {
      version: "v0.9",
      updateComponents: {
        surfaceId: SURFACE_ID,
        components: [
          {
            id: "root",
            component: "Column",
            children: ["title", "subtitle", "cta"],
            justify: "start",
            align: "stretch",
          },
          {
            id: "title",
            component: "Text",
            text: "A2UI + experiment starter",
            variant: "h2",
          },
          {
            id: "subtitle",
            component: "Text",
            text: "Structured agent UI (Google A2UI) with a tiny A/B hook and an event log. See docs/PLAN.md for the KPI → PR roadmap.",
            variant: "body",
          },
          {
            id: "ctaLabel",
            component: "Text",
            text: ctaLabel,
            variant: "body",
          },
          {
            id: "cta",
            component: "Button",
            child: "ctaLabel",
            variant: "primary",
            action: {
              event: {
                name: "primary_cta",
                context: { variant },
              },
            },
          },
        ],
      },
    },
  ];
}

export { SURFACE_ID };
