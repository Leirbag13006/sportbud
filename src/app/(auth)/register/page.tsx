import type { Metadata } from "next";

import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = { title: "Inscription" };

export default function RegisterPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <h2 className="sl-bar text-2xl font-extrabold">
          Crée ton compte <span className="text-brand-text">gratuit.</span>
        </h2>
        <p className="pt-1 text-sm">Et trouve ta première séance dès aujourd&apos;hui.</p>
      </div>
      <RegisterForm />
    </div>
  );
}
