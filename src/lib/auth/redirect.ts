/**
 * Valide une URL de retour (?next=…) pour éviter les redirections ouvertes :
 * seuls les chemins internes sont acceptés.
 */
export function getSafeRedirectPath(next: unknown, fallback = "/") {
  if (typeof next !== "string" || !next.startsWith("/") || next.startsWith("//") || next.includes("\\")) {
    return fallback;
  }
  return next;
}
