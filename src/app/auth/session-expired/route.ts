import { NextResponse, type NextRequest } from "next/server";

import { SESSION_COOKIE_NAME } from "@/lib/auth/constants";

/**
 * Session invalide ou expirée alors que le cookie existe encore (ex. base réinitialisée) :
 * on efface le cookie avant de renvoyer vers /login, sinon le proxy renverrait vers l'app en boucle.
 */
export function GET(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/login", request.url));
  response.cookies.delete(SESSION_COOKIE_NAME);
  return response;
}
