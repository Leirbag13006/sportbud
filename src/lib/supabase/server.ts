import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import type { Database } from "@/types/database";
import { getSupabaseEnv } from "./env";

/**
 * Client Supabase pour le serveur (Server Components, Server Actions, Route Handlers).
 * À créer à chaque requête : il lit la session de l'utilisateur dans ses cookies.
 */
export async function createClient() {
  // cookies() en premier : c'est lui qui rend la page dynamique (rendu à chaque requête).
  const cookieStore = await cookies();
  const { url, publishableKey } = getSupabaseEnv();

  return createServerClient<Database>(url, publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Appelé depuis un Server Component, où l'écriture de cookies est interdite :
          // sans conséquence, le proxy se charge de rafraîchir la session.
        }
      },
    },
  });
}
