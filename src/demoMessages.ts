import type { DemoVariant } from "./experiment.js";

const CATALOG_ID = "https://a2ui.org/specification/v0_9/basic_catalog.json";
const SURFACE_ID = "demo";

/** Logged pattern fields — surfaced in copy so pills / NDJSON match what you see. */
export type DemoPatternDims = {
  templateId: string;
  chromePack: string;
  segmentId: string;
};

/** Static A2UI v0.9 messages — CTA from A/B; layout + copy from pattern (same dimensions as events). */
export function buildDemoMessages(variant: DemoVariant, pattern: DemoPatternDims): unknown[] {
  const ctaLabel = variant === "A" ? "Get started" : "Start free";
  const { templateId, chromePack, segmentId } = pattern;
  const isSheet = templateId === "sheet_v1";

  const liveLine = `Live: ${templateId} · ${chromePack} · segment ${segmentId}`;

  const titleText = isSheet ? "Continue in your workspace" : "Confirm";
  const subtitleText = isSheet
    ? "Sheet-style pattern: more copy, calmer chrome. Logged per segment for pattern winners."
    : "Flag-style pattern: compact title + action in one row. Same catalog; different template for CTR splits.";

  const rootChildren = isSheet
    ? ["liveDim", "sheetHint", "title", "subtitle", "cta"]
    : ["liveDim", "flagRow", "subtitle"];

  const components: unknown[] = [
    {
      id: "root",
      component: "Column",
      children: rootChildren,
      justify: "start",
      align: "stretch",
    },
    {
      id: "liveDim",
      component: "Text",
      text: liveLine,
      variant: "caption",
    },
    ...(isSheet
      ? [
          {
            id: "sheetHint",
            component: "Text",
            text: "Sheet chrome",
            variant: "caption",
          },
        ]
      : [
          {
            id: "flagRow",
            component: "Row",
            children: ["title", "cta"],
            justify: "spaceBetween",
            align: "center",
          },
        ]),
    {
      id: "title",
      component: "Text",
      text: titleText,
      variant: isSheet ? "h2" : "h3",
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
  ];

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
        components,
      },
    },
  ];
}

export { SURFACE_ID };
