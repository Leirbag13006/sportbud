import "server-only";

import { eq, sql } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";

import { db } from "@/db";
import { sessions, users, type PublicUser } from "@/db/schema";
import { SESSION_COOKIE_NAME } from "./constants";
import { generateToken, hashToken } from "./tokens";

const DAY_MS = 24 * 60 * 60 * 1000;
/** Durée de vie d'une session. */
const SESSION_DURATION_MS = 30 * DAY_MS;
/** En deçà de cette durée restante, la session est prolongée (session « glissante »). */
const SESSION_RENEW_THRESHOLD_MS = 15 * DAY_MS;

async function setSessionCookie(token: string, expiresAt: Date) {
  (await cookies()).set(SESSION_COOKIE_NAME, token, {
    httpOnly: true, // inaccessible au JavaScript du navigateur
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

/** Ouvre une session pour l'utilisateur et pose le cookie. À appeler depuis une Server Action. */
export async function createSession(userId: string) {
  const token = generateToken();
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

  await db.insert(sessions).values({ id: hashToken(token), userId, expiresAt });
  await setSessionCookie(token, expiresAt);
}

/** Ferme la session courante (base + cookie). À appeler depuis une Server Action. */
export async function deleteSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (token) await db.delete(sessions).where(eq(sessions.id, hashToken(token)));
  cookieStore.delete(SESSION_COOKIE_NAME);
}

/**
 * Utilisateur connecté, ou null si pas de session valide.
 * Mis en cache pour la durée d'une requête : plusieurs composants peuvent l'appeler sans surcoût.
 */
export const getCurrentUser = cache(async (): Promise<PublicUser | null> => {
  const token = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  const sessionId = hashToken(token);
  const session = await db.query.sessions.findFirst({
    where: eq(sessions.id, sessionId),
    with: { user: { columns: { passwordHash: false } } },
  });
  if (!session) return null;

  const now = Date.now();
  if (session.expiresAt.getTime() <= now) {
    await db.delete(sessions).where(eq(sessions.id, sessionId));
    return null;
  }

  // Prolonge en base les sessions actives. Le cookie, lui, ne peut être réécrit que
  // depuis une Server Action : il est renouvelé à la prochaine connexion.
  if (session.expiresAt.getTime() - now < SESSION_RENEW_THRESHOLD_MS) {
    await db
      .update(sessions)
      .set({ expiresAt: new Date(now + SESSION_DURATION_MS) })
      .where(eq(sessions.id, sessionId));
  }

  return session.user;
});

/**
 * Utilisateur connecté ; sinon, redirige vers la route qui efface le cookie périmé
 * puis renvoie vers /login. À utiliser dans les pages privées.
 */
export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/session-expired");
  return user;
}

/** Vrai si le pseudo est déjà pris (sans tenir compte de la casse), hors compte `exceptUserId`. */
export async function isUsernameTaken(username: string, exceptUserId?: string) {
  const [row] = await db
    .select({ id: users.id })
    .from(users)
    .where(sql`lower(${users.username}) = lower(${username})`)
    .limit(1);
  return Boolean(row && row.id !== exceptUserId);
}

/** Recherche un utilisateur par email (connexion / inscription). */
export function findUserByEmail(email: string) {
  return db.query.users.findFirst({ where: eq(users.email, email) });
}
