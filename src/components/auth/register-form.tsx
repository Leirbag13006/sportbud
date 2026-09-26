"use client";

import Link from "next/link";
import { useActionState } from "react";

import { register, type AuthFormState } from "@/app/(auth)/actions";
import { FormAlert } from "@/components/forms/form-alert";
import { FormField } from "@/components/forms/form-field";
import { PasswordInput } from "@/components/forms/password-input";
import { SubmitButton } from "@/components/forms/submit-button";
import { Input } from "@/components/ui/input";

/** next : page à ouvrir après le parcours d'accueil (ex. la séance partagée qui a amené le visiteur). */
export function RegisterForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState<AuthFormState, FormData>(register, {});
  const errors = state.fieldErrors;

  return (
    <form
      action={action}
      noValidate
      className="space-y-5"
      // React réinitialise le formulaire après chaque envoi : on remonte les champs
      // pour qu'ils repartent des valeurs renvoyées par le serveur (defaultValue).
      key={JSON.stringify(state.values ?? {})}
    >
      <FormAlert message={state.error} />
      {next && <input type="hidden" name="next" value={next} />}

      <FormField id="username" label="Pseudo" errors={errors?.username} hint="Visible par les autres membres.">
        <Input
          id="username"
          name="username"
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          maxLength={20}
          placeholder="camille_run"
          defaultValue={state.values?.username}
          aria-invalid={Boolean(errors?.username)}
          aria-describedby="username-message"
          className="h-10"
          required
        />
      </FormField>

      <FormField id="email" label="Email" errors={errors?.email}>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          placeholder="toi@exemple.fr"
          defaultValue={state.values?.email}
          aria-invalid={Boolean(errors?.email)}
          aria-describedby="email-message"
          className="h-10"
          required
        />
      </FormField>

      <FormField
        id="password"
        label="Mot de passe"
        errors={errors?.password}
        hint="8 caractères minimum, avec au moins une lettre et un chiffre."
      >
        <PasswordInput
          id="password"
          name="password"
          autoComplete="new-password"
          aria-invalid={Boolean(errors?.password)}
          aria-describedby="password-message"
          className="h-10"
          required
        />
      </FormField>

      <SubmitButton pending={pending} pendingLabel="Création du compte…">
        Créer mon compte
      </SubmitButton>

      <p className="text-center text-sm text-muted-foreground">
        Déjà inscrit ?{" "}
        <Link href={next ? `/login?next=${encodeURIComponent(next)}` : "/login"} className="font-medium text-brand-text underline-offset-4 hover:underline">
          Se connecter
        </Link>
      </p>
    </form>
  );
}
