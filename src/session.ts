/** Session id for analytics / Statsig user key (avoids circular imports with integrations). */
export function getSessionId(): string {
  try {
    const k = "a2ui-demo-session";
    let id = sessionStorage.getItem(k);
    if (!id) {
      id = `sess_${crypto.randomUUID?.() ?? String(Date.now())}`;
      sessionStorage.setItem(k, id);
    }
    return id;
  } catch {
    return `sess_${Date.now()}`;
  }
}
