import type { Metadata } from "next";

import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export const metadata: Metadata = { title: "Mot de passe oublié" };

export default function ForgotPasswordPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <h2 className="sl-bar text-2xl font-extrabold">
          Mot de passe <span className="text-brand-text">oublié ?</span>
        </h2>
        <p className="pt-1 text-sm">Pas de panique : indique ton email, on t&apos;envoie un lien pour en choisir un nouveau.</p>
      </div>
      <ForgotPasswordForm />
    </div>
  );
}
