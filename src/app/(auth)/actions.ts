"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import { getSafeRedirectPath } from "@/lib/auth/redirect";
import { createClient } from "@/lib/supabase/server";
import { loginSchema, registerSchema } from "@/lib/validations/auth";

/** État renvoyé aux formulaires d'authentification (via useActionState). */
export type AuthFormState = {
  /** Erreur globale (identifiants invalides, erreur réseau…). */
  error?: string;
  /** Erreurs par champ, issues de la validation Zod. */
  fieldErrors?: Record<string, string[] | undefined>;
  /** Valeurs saisies, pour pré-remplir le formulaire après une erreur (jamais le mot de passe). */
  values?: Record<string, string>;
  /** Inscription réussie mais email à confirmer. */
  confirmationSentTo?: string;
};

/** Traduit les erreurs Supabase Auth les plus courantes en messages utilisateur. */
function toFrenchAuthError(code: string | undefined, fallback: string) {
  switch (code) {
    case "invalid_credentials":
      return "Email ou mot de passe incorrect.";
    case "email_not_confirmed":
      return "Confirme ton adresse email avant de te connecter (vérifie ta boîte mail).";
    case "user_already_exists":
    case "email_exists":
      return "Un compte existe déjà avec cet email.";
    case "weak_password":
      return "Mot de passe trop faible, choisis-en un plus robuste.";
    case "over_request_rate_limit":
    case "over_email_send_rate_limit":
      return "Trop de tentatives. Réessaie dans quelques minutes.";
    default:
      return fallback;
  }
}

export async function login(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const raw = { email: String(formData.get("email") ?? ""), password: String(formData.get("password") ?? "") };
  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors, values: { email: raw.email } };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    return {
      error: toFrenchAuthError(error.code, "Connexion impossible. Réessaie."),
      values: { email: raw.email },
    };
  }

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
  const origin = (await headers()).get("origin") ?? "";

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // Lues par le trigger handle_new_user pour créer le profil.
      data: { full_name: fullName, sport_level: sportLevel },
      // Lien de confirmation : échange du code contre une session, puis retour à l'app.
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    return { error: toFrenchAuthError(error.code, "Inscription impossible. Réessaie."), values };
  }

  // Confirmation d'email activée dans Supabase : pas encore de session.
  if (!data.session) {
    return { confirmationSentTo: email };
  }

  redirect("/");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
