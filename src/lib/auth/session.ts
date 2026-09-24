import "server-only";

import { redirect } from "next/navigation";
import { cache } from "react";

import { createClient } from "@/lib/supabase/server";

/**
 * Utilisateur connecté (identifiant + email), ou null.
 * getClaims() vérifie la signature du JWT : ne jamais se fier à getSession() côté serveur.
 * Mis en cache pour la durée d'une requête (plusieurs composants peuvent l'appeler).
 */
export const getCurrentUser = cache(async () => {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) return null;

  return { id: data.claims.sub, email: data.claims.email ?? null };
});

/** Profil complet de l'utilisateur connecté ; redirige vers /login si la session a expiré. */
export const requireProfile = cache(async () => {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const supabase = await createClient();
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error) throw new Error(`Impossible de charger le profil : ${error.message}`);
  return { user, profile };
});
