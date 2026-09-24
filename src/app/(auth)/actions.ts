"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { db } from "@/db";
import { users } from "@/db/schema";
import { getSafeRedirectPath } from "@/lib/auth/redirect";
import { DUMMY_PASSWORD_HASH, hashPassword, verifyPassword } from "@/lib/auth/password";
import { createSession, deleteSession, findUserByEmail } from "@/lib/auth/session";
import { loginSchema, registerSchema } from "@/lib/validations/auth";

/** État renvoyé aux formulaires d'authentification (via useActionState). */
export type AuthFormState = {
  /** Erreur globale (identifiants invalides…). */
  error?: string;
  /** Erreurs par champ, issues de la validation Zod. */
  fieldErrors?: Record<string, string[] | undefined>;
  /** Valeurs saisies, pour pré-remplir le formulaire après une erreur (jamais le mot de passe). */
  values?: Record<string, string>;
};

export async function login(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const raw = {
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  };
  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors, values: { email: raw.email } };
  }

  const user = await findUserByEmail(parsed.data.email);
  // Toujours comparer un hash (même factice) : temps de réponse identique que l'email existe ou non.
  const passwordOk = await verifyPassword(parsed.data.password, user?.passwordHash ?? DUMMY_PASSWORD_HASH);
  if (!user || !passwordOk) {
    return { error: "Email ou mot de passe incorrect.", values: { email: raw.email } };
  }

  await createSession(user.id);
  redirect(getSafeRedirectPath(formData.get("next")));
}

export async function register(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const raw = {
    fullName: String(formData.get("fullName") ?? ""),
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
    sportLevel: String(formData.get("sportLevel") ?? ""),
  };
  const values = { fullName: raw.fullName, email: raw.email, sportLevel: raw.sportLevel };

  const parsed = registerSchema.safeParse(raw);
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors, values };
  }

  const { fullName, email, password, sportLevel } = parsed.data;
  if (await findUserByEmail(email)) {
    return { fieldErrors: { email: ["Un compte existe déjà avec cet email."] }, values };
  }

  const [user] = await db
    .insert(users)
    .values({ fullName, email, sportLevel, passwordHash: await hashPassword(password) })
    // Filet de sécurité si deux inscriptions simultanées utilisent le même email.
    .onConflictDoNothing({ target: users.email })
    .returning({ id: users.id });

  if (!user) {
    return { fieldErrors: { email: ["Un compte existe déjà avec cet email."] }, values };
  }

  await createSession(user.id);
  redirect("/");
}

export async function logout() {
  await deleteSession();
  redirect("/login");
}
