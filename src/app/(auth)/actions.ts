"use server";

import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import { db } from "@/db";
import { users } from "@/db/schema";
import { DUMMY_PASSWORD_HASH, hashPassword, verifyPassword } from "@/lib/auth/password";
import { clearLoginFailures, isLoginThrottled, recordLoginFailure } from "@/lib/auth/login-throttle";
import { createPasswordResetToken, resetPasswordWithToken } from "@/lib/auth/password-reset";
import { getSafeRedirectPath } from "@/lib/auth/redirect";
import { createSession, deleteSession, findUserByEmail, getCurrentUser, isUsernameTaken } from "@/lib/auth/session";
import { sendEmail } from "@/lib/email";
import { passwordResetEmail } from "@/lib/email/templates";
import { getFirstName } from "@/lib/format";
import {
  deleteAccountSchema,
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
} from "@/lib/validations/auth";

/** État renvoyé aux formulaires d'authentification (via useActionState). */
export type AuthFormState = {
  /** Erreur globale (identifiants invalides…). */
  error?: string;
  /** Erreurs par champ, issues de la validation Zod. */
  fieldErrors?: Record<string, string[] | undefined>;
  /** Valeurs saisies, pour pré-remplir le formulaire après une erreur (jamais le mot de passe). */
  values?: Record<string, string>;
  /** Action réussie sans redirection (ex. e-mail de réinitialisation envoyé). */
  success?: boolean;
};

/**
 * Adresse publique du site pour les liens envoyés par e-mail.
 * En production, le domaine officiel (jamais l'en-tête Host, falsifiable) ; en local, l'hôte courant.
 */
async function getAppUrl() {
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  const host = (await headers()).get("host") ?? "localhost:3000";
  return `${host.startsWith("localhost") ? "http" : "https"}://${host}`;
}

export async function login(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const raw = {
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  };
  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors, values: { email: raw.email } };
  }

  if (await isLoginThrottled(parsed.data.email)) {
    return {
      error: "Trop de tentatives de connexion. Patiente 15 minutes ou réinitialise ton mot de passe.",
      values: { email: raw.email },
    };
  }

  const user = await findUserByEmail(parsed.data.email);
  // Toujours comparer un hash (même factice) : temps de réponse identique que l'email existe ou non.
  const passwordOk = await verifyPassword(parsed.data.password, user?.passwordHash ?? DUMMY_PASSWORD_HASH);
  if (!user || !passwordOk) {
    await recordLoginFailure(parsed.data.email);
    return { error: "Email ou mot de passe incorrect.", values: { email: raw.email } };
  }

  await clearLoginFailures(parsed.data.email);
  // Vérifié après le mot de passe : on ne révèle pas la suspension à un tiers.
  if (user.suspendedAt) {
    return {
      error: "Ce compte a été suspendu par la modération à la suite de signalements.",
      values: { email: raw.email },
    };
  }
  await createSession(user.id);
  redirect(getSafeRedirectPath(formData.get("next")));
}

export async function register(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const raw = {
    username: String(formData.get("username") ?? ""),
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  };
  const values = { username: raw.username, email: raw.email };

  const parsed = registerSchema.safeParse(raw);
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors, values };
  }

  const { username, email, password } = parsed.data;
  if (await findUserByEmail(email)) {
    return { fieldErrors: { email: ["Un compte existe déjà avec cet email."] }, values };
  }
  if (await isUsernameTaken(username)) {
    return { fieldErrors: { username: ["Ce pseudo est déjà pris, essaie une variante."] }, values };
  }

  const [user] = await db
    .insert(users)
    .values({ username, email, passwordHash: await hashPassword(password) })
    // Filet de sécurité si deux inscriptions simultanées utilisent le même email.
    .onConflictDoNothing({ target: users.email })
    .returning({ id: users.id });

  if (!user) {
    return { fieldErrors: { email: ["Un compte existe déjà avec cet email."] }, values };
  }

  await createSession(user.id);
  // Parcours d'accueil, puis retour à la page d'origine (ex. une séance partagée).
  const next = getSafeRedirectPath(formData.get("next"), "");
  redirect(next ? `/welcome?next=${encodeURIComponent(next)}` : "/");
}

/**
 * « Mot de passe oublié » : envoie un lien de réinitialisation.
 * La réponse est la même que l'email corresponde à un compte ou non (pas de divulgation des inscrits).
 */
export async function requestPasswordReset(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const raw = { email: String(formData.get("email") ?? "") };
  const parsed = forgotPasswordSchema.safeParse(raw);
  if (!parsed.success) return { fieldErrors: z.flattenError(parsed.error).fieldErrors, values: raw };

  const user = await findUserByEmail(parsed.data.email);
  if (user) {
    const token = await createPasswordResetToken(user.id);
    if (token) {
      const url = `${await getAppUrl()}/reset-password?token=${token}`;
      try {
        await sendEmail({ to: user.email, ...passwordResetEmail({ firstName: getFirstName(user), url }) });
      } catch (error) {
        console.error("[email] Échec de l'envoi du lien de réinitialisation", error);
        return { error: "L'e-mail n'a pas pu être envoyé. Réessaie dans quelques minutes.", values: raw };
      }
    }
  }
  return { success: true, values: raw };
}

/** Nouveau mot de passe depuis le lien reçu par e-mail ; toutes les sessions sont fermées. */
export async function resetPassword(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const parsed = resetPasswordSchema.safeParse({
    token: String(formData.get("token") ?? ""),
    password: String(formData.get("password") ?? ""),
    confirmPassword: String(formData.get("confirmPassword") ?? ""),
  });
  if (!parsed.success) return { fieldErrors: z.flattenError(parsed.error).fieldErrors };

  if (!(await resetPasswordWithToken(parsed.data.token, parsed.data.password))) {
    return { error: "Ce lien a expiré ou a déjà été utilisé. Demande-en un nouveau." };
  }
  redirect("/login?reset=1");
}

/**
 * Suppression définitive du compte (confirmée par le mot de passe).
 * Supprime en cascade : activités organisées, candidatures, messages, avis, blocages.
 */
export async function deleteAccount(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const current = await getCurrentUser();
  if (!current) redirect("/login");

  const parsed = deleteAccountSchema.safeParse({ password: String(formData.get("password") ?? "") });
  if (!parsed.success) return { fieldErrors: z.flattenError(parsed.error).fieldErrors };

  const user = await findUserByEmail(current.email);
  if (!user || !(await verifyPassword(parsed.data.password, user.passwordHash))) {
    return { fieldErrors: { password: ["Mot de passe incorrect."] } };
  }

  await db.delete(users).where(eq(users.id, user.id));
  await deleteSession();
  redirect("/register?deleted=1");
}

export async function logout() {
  await deleteSession();
  redirect("/login");
}
