/** Erreur HTTP renvoyée par nos routes API (le statut permet de distinguer 401 / 404). */
export class FetchError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

/** Fetcher SWR : JSON des routes /api, erreur typée si la réponse n'est pas 2xx. */
export async function fetcher<T>(url: string): Promise<T> {
  const response = await fetch(url, { headers: { Accept: "application/json" } });
  if (!response.ok) throw new FetchError(`Requête ${url} échouée`, response.status);
  return response.json() as Promise<T>;
}

/** Intervalles de rafraîchissement automatique (ms). */
export const POLL_INTERVALS = {
  /** Conversation ouverte : quasi temps réel. */
  chat: 2000,
  /** Liste des conversations et badges. */
  background: 5000,
} as const;
