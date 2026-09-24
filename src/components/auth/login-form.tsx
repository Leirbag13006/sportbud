"use client";

import Link from "next/link";
import { useActionState } from "react";

import { login, type AuthFormState } from "@/app/(auth)/actions";
import { FormAlert } from "@/components/forms/form-alert";
import { FormField } from "@/components/forms/form-field";
import { PasswordInput } from "@/components/forms/password-input";
import { SubmitButton } from "@/components/forms/submit-button";
import { Input } from "@/components/ui/input";

interface LoginFormProps {
  /** Page à rouvrir après connexion (déjà validée côté serveur). */
  next?: string;
}

export function LoginForm({ next }: LoginFormProps) {
  const [state, action, pending] = useActionState<AuthFormState, FormData>(login, {});

  return (
    <form
      action={action}
      noValidate
      className="space-y-5"
      // React réinitialise le formulaire après chaque envoi : on remonte les champs
      // pour qu'ils repartent des valeurs renvoyées par le serveur (defaultValue).
      key={JSON.stringify(state.values ?? {})}
    >
      {next && <input type="hidden" name="next" value={next} />}
      <FormAlert message={state.error} />

      <FormField id="email" label="Email" errors={state.fieldErrors?.email}>
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

      <FormField id="password" label="Mot de passe" errors={state.fieldErrors?.password}>
        <PasswordInput
          id="password"
          name="password"
          autoComplete="current-password"
          aria-invalid={Boolean(state.fieldErrors?.password)}
          aria-describedby="password-message"
          className="h-10"
          required
        />
      </FormField>

      <SubmitButton pending={pending} pendingLabel="Connexion…">
        Se connecter
      </SubmitButton>

      <p className="text-center text-sm text-muted-foreground">
        Pas encore de compte ?{" "}
        <Link href="/register" className="font-medium text-primary underline-offset-4 hover:underline">
          Créer un compte
        </Link>
      </p>
    </form>
  );
}
