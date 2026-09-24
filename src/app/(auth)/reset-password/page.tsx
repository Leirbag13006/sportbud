import type { Metadata } from "next";
import Link from "next/link";

import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { FormAlert } from "@/components/forms/form-alert";
import { findValidResetToken } from "@/lib/auth/password-reset";

export const metadata: Metadata = { title: "Nouveau mot de passe" };

export default async function ResetPasswordPage({ searchParams }: PageProps<"/reset-password">) {
  const { token } = await searchParams;
  const isValid = typeof token === "string" && (await findValidResetToken(token)) !== null;

  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <h2 className="sl-bar text-2xl font-extrabold">
          Nouveau <span className="text-brand-text">mot de passe.</span>
        </h2>
        <p className="pt-1 text-sm">Choisis un mot de passe que tu n&apos;utilises pas ailleurs.</p>
      </div>
      {isValid ? (
        <ResetPasswordForm token={token} />
      ) : (
        <div className="space-y-4">
          <FormAlert message="Ce lien a expiré ou a déjà été utilisé." />
          <Link
            href="/forgot-password#acces"
            className="block text-center text-sm font-medium text-brand-text underline-offset-4 hover:underline"
          >
            Demander un nouveau lien
          </Link>
        </div>
      )}
    </div>
  );
}
