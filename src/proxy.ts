import type { NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/proxy";

/** Exécuté avant chaque requête : rafraîchit la session et protège les routes privées. */
export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    // Toutes les routes sauf les fichiers statiques et les images.
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
