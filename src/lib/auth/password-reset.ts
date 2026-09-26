import "server-only";

import { and, count, eq, gt, isNull } from "drizzle-orm";

import { db } from "@/db";
import { passwordResetTokens, sessions, users } from "@/db/schema";
import { clearLoginFailures } from "./login-throttle";
import { hashPassword } from "./password";
import { generateToken, hashToken } from "./tokens";

/** Durée de validité d'un lien de réinitialisation. */
const RESET_TOKEN_TTL_MS = 60 * 60 * 1000;
/** Limite anti-abus : demandes par compte et par heure. */
const MAX_REQUESTS_PER_HOUR = 3;

/**
 * Crée un lien de réinitialisation pour le compte (jeton brut renvoyé, seul son hash est stocké).
 * Renvoie null si trop de demandes récentes.
 */
export async function createPasswordResetToken(userId: string) {
  const since = new Date(Date.now() - RESET_TOKEN_TTL_MS);
  const [recent] = await db
    .select({ value: count() })
    .from(passwordResetTokens)
    .where(and(eq(passwordResetTokens.userId, userId), gt(passwordResetTokens.createdAt, since)));
  if ((recent?.value ?? 0) >= MAX_REQUESTS_PER_HOUR) return null;

  const token = generateToken();
  await db.insert(passwordResetTokens).values({
    id: hashToken(token),
    userId,
    expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS),
  });
  return token;
}

/** Lien encore valable (non expiré, non utilisé) : renvoie l'identifiant du compte, sinon null. */
export async function findValidResetToken(token: string) {
  const [row] = await db
    .select({ userId: passwordResetTokens.userId })
    .from(passwordResetTokens)
    .where(
      and(
        eq(passwordResetTokens.id, hashToken(token)),
        isNull(passwordResetTokens.usedAt),
        gt(passwordResetTokens.expiresAt, new Date()),
      ),
    );
  return row?.userId ?? null;
}

/**
 * Change le mot de passe avec un lien valable, puis invalide ce lien (et les autres liens du compte),
 * ferme toutes les sessions ouvertes et lève le blocage des tentatives de connexion.
 * Renvoie false si le lien n'est plus valable.
 */
export async function resetPasswordWithToken(token: string, newPassword: string) {
  const userId = await findValidResetToken(token);
  if (!userId) return false;

  const passwordHash = await hashPassword(newPassword);
  await db.transaction(async (tx) => {
    await tx.update(users).set({ passwordHash }).where(eq(users.id, userId));
    await tx
      .update(passwordResetTokens)
      .set({ usedAt: new Date() })
      .where(and(eq(passwordResetTokens.userId, userId), isNull(passwordResetTokens.usedAt)));
    await tx.delete(sessions).where(eq(sessions.userId, userId));
  });
  // Le blocage après trop d'échecs de connexion est levé : le membre a prouvé l'accès à son email.
  const user = await db.query.users.findFirst({ columns: { email: true }, where: eq(users.id, userId) });
  if (user) await clearLoginFailures(user.email);
  return true;
}
