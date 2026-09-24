import type { Metadata } from "next";

import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = { title: "Inscription" };

export default function RegisterPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Crée ton compte</h1>
        <p className="text-sm text-muted-foreground">
          Rejoins la communauté et trouve tes partenaires de sport.
        </p>
      </div>
      <RegisterForm />
    </div>
  );
}
