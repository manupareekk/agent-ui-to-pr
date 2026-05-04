/**
 * UI pattern taxonomy + segment-aware winners + epsilon exploration (client-side).
 * Policy JSON is synced from config/ → public/ (see scripts/sync-config-to-public.mjs).
 */

import { getSessionId } from "./session.js";

export type PatternFamilyId = "confirm_surface";

export type PatternPolicyFamily = {
  templates: string[];
  segmentWinners: Record<string, string>;
};

export type UiPatternPolicyFile = {
  updatedAt?: string | null;
  explorationRate: number;
  segmentCount: number;
  families: Record<string, PatternPolicyFamily>;
};

const STORAGE_PREFIX = "a2ui-pattern-choice-";

let cachedPolicy: UiPatternPolicyFile | null = null;

let activeLogFields: {
  surfaceKind: string;
  templateId: string;
  chromePack: string;
  patternFamily: PatternFamilyId;
  segmentId: string;
  exploration: boolean;
} | null = null;

function stableHash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export async function loadPatternPolicy(): Promise<void> {
  try {
    const res = await fetch(`${import.meta.env.BASE_URL}ui-pattern-policy.json`, {
      cache: "no-store",
    });
    if (!res.ok) {
      cachedPolicy = null;
      return;
    }
    cachedPolicy = (await res.json()) as UiPatternPolicyFile;
  } catch {
    cachedPolicy = null;
  }
}

export function getSegmentId(sessionId: string): string {
  const policy = cachedPolicy;
  const n = policy?.segmentCount && policy.segmentCount > 0 ? Math.floor(policy.segmentCount) : 4;
  return String(stableHash(sessionId) % n);
}

function chromePackFromTemplateId(templateId: string): string {
  if (templateId.includes("flag")) return "flag";
  if (templateId.includes("sheet")) return "sheet";
  return "default";
}

function pickExplorationTemplate(templates: string[]): string {
  const idx = stableHash(`${getSessionId()}:explore:${Date.now()}`) % templates.length;
  return templates[idx] ?? templates[0];
}

/**
 * Sticky template choice per family + epsilon exploration; respects segmentWinners when not exploring.
 */
export function resolvePatternChoice(family: PatternFamilyId): {
  templateId: string;
  surfaceKind: string;
  chromePack: string;
  patternFamily: PatternFamilyId;
  segmentId: string;
  exploration: boolean;
} {
  const sid = getSessionId();
  const segmentId = getSegmentId(sid);
  const policy = cachedPolicy;
  const fallback = {
    templateId: "flag_modal_v1",
    surfaceKind: family,
    chromePack: "flag",
    patternFamily: family,
    segmentId,
    exploration: false,
  };

  if (!policy?.families?.[family]) {
    activeLogFields = fallback;
    return fallback;
  }

  const fam = policy.families[family];
  const templates = fam.templates?.length ? fam.templates : [fallback.templateId];
  const exploreRate = Math.min(1, Math.max(0, Number(policy.explorationRate) || 0));
  const exploration = Math.random() < exploreRate;

  const storageKey = `${STORAGE_PREFIX}${family}`;
  let templateId: string;

  if (exploration) {
    templateId = pickExplorationTemplate(templates);
  } else {
    try {
      const sticky = localStorage.getItem(storageKey);
      if (sticky && templates.includes(sticky)) {
        templateId = sticky;
      } else {
        const w = fam.segmentWinners?.[segmentId] ?? fam.segmentWinners?.default ?? templates[0];
        templateId = templates.includes(w) ? w : templates[0];
        localStorage.setItem(storageKey, templateId);
      }
    } catch {
      const w = fam.segmentWinners?.[segmentId] ?? templates[0];
      templateId = templates.includes(w) ? w : templates[0];
    }
  }

  const out = {
    templateId,
    surfaceKind: family,
    chromePack: chromePackFromTemplateId(templateId),
    patternFamily: family,
    segmentId,
    exploration,
  };
  activeLogFields = out;
  return out;
}

export function getActivePatternLogFields(): Record<string, unknown> {
  if (!activeLogFields) return {};
  return {
    surface_kind: activeLogFields.surfaceKind,
    template_id: activeLogFields.templateId,
    chrome_pack: activeLogFields.chromePack,
    pattern_family: activeLogFields.patternFamily,
    segment_id: activeLogFields.segmentId,
    pattern_exploration: activeLogFields.exploration,
  };
}

export function clearPatternSticky(): void {
  activeLogFields = null;
  try {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k?.startsWith(STORAGE_PREFIX)) keys.push(k);
    }
    for (const k of keys) localStorage.removeItem(k);
  } catch {
    /* ignore */
  }
}
