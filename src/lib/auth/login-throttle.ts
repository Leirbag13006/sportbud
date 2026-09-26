import "server-only";

import { and, count, eq, gt, lt } from "drizzle-orm";
import { headers } from "next/headers";

import { db } from "@/db";
import { loginAttempts } from "@/db/schema";
import { hashToken } from "./tokens";

/** Fenêtre d'observation des échecs. */
const WINDOW_MS = 15 * 60 * 1000;
/** Échecs tolérés par compte (essais de mots de passe sur une adresse précise). */
const MAX_FAILURES_PER_EMAIL = 5;
/** Échecs tolérés par adresse IP (essais sur de nombreux comptes). */
const MAX_FAILURES_PER_IP = 20;
/** Au-delà, les traces sont inutiles : elles sont purgées. */
const RETENTION_MS = 24 * 60 * 60 * 1000;

async function getKeys(email: string) {
  // Sur Vercel, la première adresse de x-forwarded-for est celle du visiteur.
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim();
  return {
    email: hashToken(`email:${email.trim().toLowerCase()}`),
    ip: ip ? hashToken(`ip:${ip}`) : null,
  };
}

async function countRecentFailures(keyHash: string) {
  const [row] = await db
    .select({ value: count() })
    .from(loginAttempts)
    .where(and(eq(loginAttempts.keyHash, keyHash), gt(loginAttempts.createdAt, new Date(Date.now() - WINDOW_MS))));
  return row?.value ?? 0;
}

/** Vrai si trop d'échecs récents pour ce compte ou cette adresse IP : la connexion est refusée d'office. */
export async function isLoginThrottled(email: string) {
  const keys = await getKeys(email);
  if ((await countRecentFailures(keys.email)) >= MAX_FAILURES_PER_EMAIL) return true;
  return keys.ip !== null && (await countRecentFailures(keys.ip)) >= MAX_FAILURES_PER_IP;
}

/** Enregistre un échec (compte + IP) et purge les traces anciennes. */
export async function recordLoginFailure(email: string) {
  const keys = await getKeys(email);
  await db.insert(loginAttempts).values([keys.email, keys.ip].filter((key) => key !== null).map((keyHash) => ({ keyHash })));
  await db.delete(loginAttempts).where(lt(loginAttempts.createdAt, new Date(Date.now() - RETENTION_MS)));
}

/** Connexion réussie : les échecs du compte sont oubliés (ceux de l'IP restent comptés). */
export async function clearLoginFailures(email: string) {
  const keys = await getKeys(email);
  await db.delete(loginAttempts).where(eq(loginAttempts.keyHash, keys.email));
}
