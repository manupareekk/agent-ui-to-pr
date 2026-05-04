/** Optional product cohort (A/B infra separate from hash segment). `?cohort=beta` or persisted in localStorage. */

const STORAGE_KEY = "a2ui-demo-cohort";
const SLUG = /^[a-zA-Z0-9_-]{1,64}$/;

function valid(id: string | null): id is string {
  return id != null && SLUG.test(id);
}

export function getCohortId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const qp = new URLSearchParams(window.location.search).get("cohort");
    if (valid(qp)) {
      localStorage.setItem(STORAGE_KEY, qp);
      return qp;
    }
    const stored = localStorage.getItem(STORAGE_KEY);
    return valid(stored) ? stored : null;
  } catch {
    return null;
  }
}

export function clearCohort(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
