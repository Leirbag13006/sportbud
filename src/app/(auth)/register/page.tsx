import type { Metadata } from "next";

import { RegisterForm } from "@/components/auth/register-form";
import { FormSuccess } from "@/components/forms/form-success";
import { getSafeRedirectPath } from "@/lib/auth/redirect";

export const metadata: Metadata = { title: "Inscription" };

export default async function RegisterPage({ searchParams }: PageProps<"/register">) {
  const { deleted, next } = await searchParams;
  const safeNext = getSafeRedirectPath(next, "");

  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <h2 className="sl-bar text-2xl font-extrabold">
          Crée ton compte <span className="text-brand-text">gratuit.</span>
        </h2>
        <p className="pt-1 text-sm">Et trouve ta première séance dès aujourd&apos;hui.</p>
      </div>
      {deleted === "1" && <FormSuccess message="Ton compte et tes données ont bien été supprimés. À bientôt sur le terrain !" />}
      <RegisterForm next={safeNext || undefined} />
    </div>
  );
}
