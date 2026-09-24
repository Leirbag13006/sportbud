/**
 * Configuration Supabase lue depuis les variables d'environnement publiques.
 * Les accès sont écrits en toutes lettres pour que Next.js les injecte dans le bundle client.
 */
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export function getSupabaseEnv() {
  if (!url || !publishableKey) {
    throw new Error(
      "Configuration Supabase manquante : copie .env.example en .env.local et renseigne " +
        "NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, puis relance le serveur.",
    );
  }
  return { url, publishableKey };
}
