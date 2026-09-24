"use client";

import Link from "next/link";
import { useActionState } from "react";

import { requestPasswordReset, type AuthFormState } from "@/app/(auth)/actions";
import { FormAlert } from "@/components/forms/form-alert";
import { FormField } from "@/components/forms/form-field";
import { FormSuccess } from "@/components/forms/form-success";
import { SubmitButton } from "@/components/forms/submit-button";
import { Input } from "@/components/ui/input";

/** Demande d'un lien de réinitialisation du mot de passe. */
export function ForgotPasswordForm() {
  const [state, action, pending] = useActionState<AuthFormState, FormData>(requestPasswordReset, {});

  return (
    <form action={action} noValidate className="space-y-5" key={JSON.stringify(state.values ?? {})}>
      <FormAlert message={state.error} />
      <FormSuccess
        message={
          state.success
            ? `Si un compte existe pour ${state.values?.email}, tu vas recevoir un e-mail avec un lien valable 1 heure. Pense à vérifier tes spams.`
            : undefined
        }
      />

      <FormField id="email" label="Email de ton compte" errors={state.fieldErrors?.email}>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          placeholder="toi@exemple.fr"
          defaultValue={state.values?.email}
          aria-invalid={Boolean(state.fieldErrors?.email)}
          aria-describedby="email-message"
          className="h-10"
          required
        />
      </FormField>

      <SubmitButton pending={pending} pendingLabel="Envoi…">
        {state.success ? "Renvoyer le lien" : "Recevoir un lien"}
      </SubmitButton>

      <p className="text-center text-sm text-muted-foreground">
        <Link href="/login#acces" className="font-medium text-brand-text underline-offset-4 hover:underline">
          ← Retour à la connexion
        </Link>
      </p>
    </form>
  );
}
