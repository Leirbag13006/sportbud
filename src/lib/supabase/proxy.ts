import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import type { Database } from "@/types/database";
import { getSupabaseEnv } from "./env";

/** Routes accessibles sans être connecté. */
const PUBLIC_PATHS = ["/login", "/register", "/auth"];
/** Routes réservées aux visiteurs non connectés (renvoient vers l'app si connecté). */
const GUEST_ONLY_PATHS = ["/login", "/register"];

function matches(pathname: string, paths: string[]) {
  return paths.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

/**
 * Rafraîchit la session Supabase à chaque requête et protège les routes :
 * - visiteur non connecté sur une page privée → /login?next=<page demandée>
 * - utilisateur connecté sur /login ou /register → /
 */
export async function updateSession(request: NextRequest) {
  const { url, publishableKey } = getSupabaseEnv();
  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(url, publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        // Propage les jetons rafraîchis à la requête (pour le rendu) et à la réponse (pour le navigateur).
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
        // En-têtes anti-cache fournis par Supabase : une réponse contenant une session ne doit jamais être mise en cache.
        Object.entries(headers).forEach(([key, value]) => response.headers.set(key, value));
      },
    },
  });

  // Ne rien exécuter entre la création du client et getClaims() :
  // c'est cet appel qui valide le JWT et rafraîchit la session si besoin.
  const { data } = await supabase.auth.getClaims();
  const isAuthenticated = Boolean(data?.claims);
  const { pathname, search } = request.nextUrl;

  if (!isAuthenticated && !matches(pathname, PUBLIC_PATHS)) {
    const loginUrl = new URL("/login", request.url);
    if (pathname !== "/") loginUrl.searchParams.set("next", `${pathname}${search}`);
    return redirectWithCookies(loginUrl, response);
  }

  if (isAuthenticated && matches(pathname, GUEST_ONLY_PATHS)) {
    return redirectWithCookies(new URL("/", request.url), response);
  }

  return response;
}

/** Redirige en conservant les cookies de session éventuellement rafraîchis. */
function redirectWithCookies(destination: URL, source: NextResponse) {
  const redirect = NextResponse.redirect(destination);
  source.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
  source.headers.forEach((value, key) => {
    if (key.toLowerCase() !== "location") redirect.headers.set(key, value);
  });
  return redirect;
}
