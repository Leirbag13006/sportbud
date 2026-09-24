import { NextResponse, type NextRequest } from "next/server";

import { SESSION_COOKIE_NAME } from "@/lib/auth/constants";

/** Pages accessibles uniquement aux visiteurs non connectés. */
const GUEST_ONLY_PATHS = ["/login", "/register"];
/** Pages publiques (accessibles connecté ou non). */
const PUBLIC_PATHS = ["/credits"];
/** Routes techniques d'authentification, accessibles dans tous les cas. */
const AUTH_ROUTES_PREFIX = "/auth/";

/**
 * Vérification rapide, avant le rendu, basée sur la présence du cookie de session.
 * Ce n'est qu'un premier filtre : la validité réelle de la session est contrôlée
 * côté serveur (requireUser) dans chaque page et action protégée.
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  if (pathname.startsWith(AUTH_ROUTES_PREFIX)) return NextResponse.next();

  const hasSession = request.cookies.has(SESSION_COOKIE_NAME);

  // API : pas de redirection HTML, les routes répondent elles-mêmes 401 si besoin.
  if (pathname.startsWith("/api/")) return NextResponse.next();

  // Pages publiques, accessibles connecté ou non.
  if (PUBLIC_PATHS.includes(pathname)) return NextResponse.next();
  const isGuestOnly = GUEST_ONLY_PATHS.includes(pathname);

  if (!hasSession && !isGuestOnly) {
    // Visiteur sur l'accueil : landing orientée inscription.
    if (pathname === "/") return NextResponse.redirect(new URL("/register", request.url));
    // Lien vers une page précise (session expirée, lien partagé) : connexion puis retour.
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  if (hasSession && isGuestOnly) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Toutes les routes sauf l'API (qui vérifie elle-même la session), les fichiers statiques et les images.
    "/((?!api/|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
