import type { Metadata } from "next";

import { LoginForm } from "@/components/auth/login-form";
import { getSafeRedirectPath } from "@/lib/auth/redirect";

export const metadata: Metadata = { title: "Connexion" };

const URL_ERRORS: Record<string, string> = {
  confirmation: "Le lien de confirmation est invalide ou a expiré. Connecte-toi ou réinscris-toi.",
};

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { next, error } = await searchParams;
  const safeNext = getSafeRedirectPath(next, "");

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Content de te revoir 👋</h1>
        <p className="text-sm text-muted-foreground">Connecte-toi pour retrouver tes activités.</p>
      </div>
      <LoginForm
        next={safeNext || undefined}
        initialError={typeof error === "string" ? URL_ERRORS[error] : undefined}
      />
    </div>
  );
}
