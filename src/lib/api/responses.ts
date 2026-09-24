import "server-only";

import { NextResponse } from "next/server";

/** Réponse JSON jamais mise en cache (données propres à l'utilisateur, interrogées régulièrement). */
export function json<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data, {
    ...init,
    headers: { "Cache-Control": "private, no-store", ...init?.headers },
  });
}

export const unauthorized = () => json({ error: "Non connecté." }, { status: 401 });
export const notFound = () => json({ error: "Introuvable." }, { status: 404 });
