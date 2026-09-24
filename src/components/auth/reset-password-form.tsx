"use client";

import Link from "next/link";
import { useActionState } from "react";

import { resetPassword, type AuthFormState } from "@/app/(auth)/actions";
import { FormAlert } from "@/components/forms/form-alert";
import { FormField } from "@/components/forms/form-field";
import { PasswordInput } from "@/components/forms/password-input";
import { SubmitButton } from "@/components/forms/submit-button";

/** Choix d'un nouveau mot de passe depuis le lien reçu par e-mail. */
export function ResetPasswordForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState<AuthFormState, FormData>(resetPassword, {});

  return (
    <form action={action} noValidate className="space-y-5">
      <input type="hidden" name="token" value={token} />
      <FormAlert message={state.error} />

      <FormField
        id="password"
        label="Nouveau mot de passe"
        errors={state.fieldErrors?.password}
        hint="8 caractères minimum, avec au moins une lettre et un chiffre."
      >
        <PasswordInput
          id="password"
          name="password"
          autoComplete="new-password"
          aria-invalid={Boolean(state.fieldErrors?.password)}
          aria-describedby="password-message"
          className="h-10"
          required
        />
      </FormField>

      <FormField id="confirmPassword" label="Confirme le mot de passe" errors={state.fieldErrors?.confirmPassword}>
        <PasswordInput
          id="confirmPassword"
          name="confirmPassword"
          autoComplete="new-password"
          aria-invalid={Boolean(state.fieldErrors?.confirmPassword)}
          aria-describedby="confirmPassword-message"
          className="h-10"
          required
        />
      </FormField>

      <SubmitButton pending={pending} pendingLabel="Enregistrement…">
        Enregistrer mon mot de passe
      </SubmitButton>

      {state.error && (
        <p className="text-center text-sm">
          <Link href="/forgot-password#acces" className="font-medium text-brand-text underline-offset-4 hover:underline">
            Demander un nouveau lien
          </Link>
        </p>
      )}
    </form>
  );
}
