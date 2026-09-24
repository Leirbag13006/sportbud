import type { Metadata } from "next";

import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = { title: "Inscription" };

export default function RegisterPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="sl-bar text-3xl font-extrabold">
          Rejoins la <span className="text-brand-text">communauté.</span>
        </h1>
        <p className="text-sm">
          Crée ton compte et trouve des partenaires près de chez toi.
        </p>
      </div>
      <RegisterForm />
    </div>
  );
}
