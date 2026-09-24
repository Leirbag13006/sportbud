import type { Metadata } from "next";

import { LoginForm } from "@/components/auth/login-form";
import { FormSuccess } from "@/components/forms/form-success";
import { getSafeRedirectPath } from "@/lib/auth/redirect";

export const metadata: Metadata = { title: "Connexion" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { next, reset } = await searchParams;
  const safeNext = getSafeRedirectPath(next, "");

  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <h2 className="sl-bar text-2xl font-extrabold">
          Content de te <span className="text-brand-text">revoir.</span>
        </h2>
        <p className="pt-1 text-sm">Connecte-toi pour retrouver tes séances et tes partenaires.</p>
      </div>
      {reset === "1" && <FormSuccess message="Mot de passe modifié ! Connecte-toi avec ton nouveau mot de passe." />}
      <LoginForm next={safeNext || undefined} />
    </div>
  );
}
