import { LitElement, html, css } from "lit";
import { customElement, state } from "lit/decorators.js";
import { MessageProcessor } from "@a2ui/web_core/v0_9";
import { A2uiSurface, basicCatalog } from "@a2ui/lit/v0_9";
import { injectBasicCatalogStyles } from "@a2ui/web_core/v0_9/basic_catalog";
import { buildDemoMessages, SURFACE_ID } from "./demoMessages.js";
import {
  clearStickyAssignment,
  drainExperimentLog,
  getAssignedVariant,
  loadExperimentDefaults,
  logEvent,
  type DemoVariant,
} from "./experiment.js";
import { initPosthogFromEnv } from "./integrations/posthog.js";
import { initStatsigFromEnv } from "./integrations/statsig.js";
import { getSessionId } from "./session.js";

import type { ComponentApi, SurfaceModel } from "@a2ui/web_core/v0_9";

void A2uiSurface;

@customElement("experiment-host")
export class ExperimentHost extends LitElement {
  static styles = css`
    :host {
      display: block;
      font-family: system-ui, sans-serif;
      max-width: 720px;
      margin: 0 auto;
      padding: 1.5rem;
    }
    header {
      margin-bottom: 1rem;
    }
    .pill {
      display: inline-block;
      padding: 0.15rem 0.55rem;
      border-radius: 999px;
      background: #e0f2fe;
      color: #075985;
      font-size: 0.8rem;
      font-weight: 600;
    }
    .panel {
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 1rem;
      margin-top: 1rem;
      background: #f8fafc;
    }
    pre {
      overflow: auto;
      font-size: 0.75rem;
      max-height: 220px;
    }
    a2ui-surface {
      display: block;
      border: 1px solid #cbd5e1;
      border-radius: 12px;
      padding: 1rem;
      background: #fff;
    }
    button.linkish {
      margin-top: 0.5rem;
      border: none;
      background: none;
      color: #0369a1;
      text-decoration: underline;
      cursor: pointer;
      font: inherit;
      padding: 0;
    }
  `;

  private processor = new MessageProcessor([basicCatalog], (action) => {
    logEvent("a2ui_action", {
      name: action.name,
      surfaceId: action.surfaceId,
      sourceComponentId: action.sourceComponentId,
      context: action.context,
    });
    this.requestUpdate();
  });

  @state()
  private surface: SurfaceModel<ComponentApi> | null = null;

  @state()
  private variant: DemoVariant | null = null;

  connectedCallback(): void {
    super.connectedCallback();
    void loadExperimentDefaults().then(async () => {
      await initStatsigFromEnv(getSessionId());
      this.variant = getAssignedVariant();
      injectBasicCatalogStyles();
      void initPosthogFromEnv();

      this.processor.onSurfaceCreated((s) => {
        if (s.id === SURFACE_ID) {
          this.surface = s as SurfaceModel<ComponentApi>;
        }
      });

      this.processor.processMessages(buildDemoMessages(this.variant) as never[]);
      logEvent("surface_exposed", { surfaceId: SURFACE_ID });
      this.requestUpdate();
    });
  }

  render() {
    if (this.variant === null) {
      return html`<p>Loading experiment defaults…</p>`;
    }
    return html`
      <header>
        <span class="pill">Variant ${this.variant}</span>
        <p style="margin:0.5rem 0 0;color:#475569;font-size:0.95rem;">
          Same A2UI surface; only the primary button label changes. Open the console for
          <code>[experiment]</code> lines. Optional: copy <code>.env.example</code> →
          <code>.env</code>, run <code>npm run dev:full</code> for local NDJSON ingest — see
          <code>docs/INTEGRATIONS.md</code>.
        </p>
        <button
          type="button"
          class="linkish"
          @click=${() => {
            clearStickyAssignment();
            location.reload();
          }}
        >
          Re-roll my variant (clears sticky A/B, page reload)
        </button>
      </header>
      ${this.surface
        ? html`<a2ui-surface .surface=${this.surface}></a2ui-surface>`
        : html`<div>Loading A2UI surface…</div>`}
      <div class="panel">
        <strong>Experiment log (this session)</strong>
        <pre>${JSON.stringify(drainExperimentLog(), null, 2)}</pre>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "experiment-host": ExperimentHost;
  }
}
