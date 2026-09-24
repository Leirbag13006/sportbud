import type { Metadata } from "next";

import { LoginForm } from "@/components/auth/login-form";
import { getSafeRedirectPath } from "@/lib/auth/redirect";

export const metadata: Metadata = { title: "Connexion" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { next } = await searchParams;
  const safeNext = getSafeRedirectPath(next, "");

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="sl-bar text-3xl font-extrabold">
          Content de te <span className="text-brand-text">revoir.</span>
        </h1>
        <p className="text-sm">Connecte-toi pour retrouver tes activités.</p>
      </div>
      <LoginForm next={safeNext || undefined} />
    </div>
  );
}
