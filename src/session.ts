const SESSION_KEY = "a2ui-demo-session";

/** Session id for analytics / Statsig user key (avoids circular imports with integrations). */
export function getSessionId(): string {
  try {
    let id = sessionStorage.getItem(SESSION_KEY);
    if (!id) {
      id = `sess_${crypto.randomUUID?.() ?? String(Date.now())}`;
      sessionStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return `sess_${Date.now()}`;
  }
}

/** Clears sticky session so the next load gets a new id (new A/B + segment bucketing for demos). */
export function resetSessionId(): void {
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch {
    /* ignore */
  }
}
