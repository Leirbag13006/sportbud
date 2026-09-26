import { NextResponse, type NextRequest } from "next/server";

import { SESSION_COOKIE_NAME } from "@/lib/auth/constants";

/** Pages accessibles uniquement aux visiteurs non connectés. */
const GUEST_ONLY_PATHS = ["/login", "/register", "/forgot-password", "/reset-password"];
/**
 * Espace membre : accueil (exploration) et pages connectées. Tout le reste est public
 * (landing, légal, crédits, robots.txt, sitemap, manifest) ou renvoie la page 404.
 */
const MEMBER_PREFIXES = ["/activities", "/messages", "/profile", "/welcome"];

function isMemberPath(pathname: string) {
  return pathname === "/" || MEMBER_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

/**
 * Vérification rapide, avant le rendu, basée sur la présence du cookie de session.
 * Ce n'est qu'un premier filtre : la validité réelle de la session est contrôlée
 * côté serveur (requireUser) dans chaque page et action protégée.
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const hasSession = request.cookies.has(SESSION_COOKIE_NAME);
  const isGuestOnly = GUEST_ONLY_PATHS.includes(pathname);

  if (!hasSession && isMemberPath(pathname)) {
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
