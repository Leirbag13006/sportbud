import "server-only";

import { notFound } from "next/navigation";

import type { PublicUser } from "@/db/schema";
import { getCurrentUser, requireUser } from "@/lib/auth/session";

/**
 * Modérateurs : adresses e-mail listées dans la variable d'environnement ADMIN_EMAILS
 * (séparées par des virgules), à régler dans Vercel. Aucun admin si elle est vide.
 */
function adminEmails() {
  return new Set(
    (process.env.ADMIN_EMAILS ?? "")
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean),
  );
}

export function isAdmin(user: Pick<PublicUser, "email">) {
  return adminEmails().has(user.email.toLowerCase());
}

/** Page d'administration : 404 pour tout autre membre (l'écran n'est pas révélé). */
export async function requireAdmin() {
  const user = await requireUser();
  if (!isAdmin(user)) notFound();
  return user;
}

/** Action d'administration : l'admin connecté, sinon null. */
export async function getAdmin() {
  const user = await getCurrentUser();
  return user && isAdmin(user) ? user : null;
}
