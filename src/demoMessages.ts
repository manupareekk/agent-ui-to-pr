import type { DemoVariant } from "./experiment.js";

const CATALOG_ID = "https://a2ui.org/specification/v0_9/basic_catalog.json";
const SURFACE_ID = "demo";

/** Static A2UI v0.9 messages — CTA label from A/B + chrome from `template_id` (logged as first-class dimensions). */
export function buildDemoMessages(variant: DemoVariant, templateId: string): unknown[] {
  const ctaLabel = variant === "A" ? "Get started" : "Start free";

  const isSheet = templateId === "sheet_v1";
  const titleText = isSheet ? "Continue in your workspace" : "Confirm";
  const subtitleText = isSheet
    ? "Sheet-style pattern (template_id=sheet_v1): more copy, calmer chrome. Logged per segment for pattern winners."
    : "Flag-style pattern (template_id=flag_modal_v1): short confirm. Same catalog; different template for CTR splits.";

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
            children: ["title", "subtitle", "ctaLabel", "cta"],
            justify: "start",
            align: "stretch",
          },
          {
            id: "title",
            component: "Text",
            text: titleText,
            variant: "h2",
          },
          {
            id: "subtitle",
            component: "Text",
            text: subtitleText,
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
                context: { variant, templateId },
              },
            },
          },
        ],
      },
    },
  ];
}

export { SURFACE_ID };
