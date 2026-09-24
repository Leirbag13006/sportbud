import { createBrowserClient } from "@supabase/ssr";

import type { Database } from "@/types/database";
import { getSupabaseEnv } from "./env";

/**
 * Client Supabase pour les composants client (Realtime, requêtes côté navigateur).
 * createBrowserClient renvoie un singleton : l'appeler plusieurs fois est sans coût.
 */
export function createClient() {
  const { url, publishableKey } = getSupabaseEnv();
  return createBrowserClient<Database>(url, publishableKey);
}
