import type { Metadata } from "next";

import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = { title: "Inscription" };

export default function RegisterPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <h2 className="sl-bar text-2xl font-extrabold">
          Rejoins la <span className="text-brand-text">communauté.</span>
        </h2>
        <p className="pt-1 text-sm">Crée ton compte gratuitement en une minute.</p>
      </div>
      <RegisterForm />
    </div>
  );
}
