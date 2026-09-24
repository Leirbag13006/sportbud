"use client";

import { MailCheck } from "lucide-react";
import Link from "next/link";
import { useActionState } from "react";

import { register, type AuthFormState } from "@/app/(auth)/actions";
import { SportLevelPicker } from "@/components/auth/sport-level-picker";
import { FormAlert } from "@/components/forms/form-alert";
import { FormField } from "@/components/forms/form-field";
import { PasswordInput } from "@/components/forms/password-input";
import { SubmitButton } from "@/components/forms/submit-button";
import { Input } from "@/components/ui/input";

export function RegisterForm() {
  const [state, action, pending] = useActionState<AuthFormState, FormData>(register, {});

  // Confirmation d'email activée : on remplace le formulaire par un message clair.
  if (state.confirmationSentTo) {
    return (
      <div className="space-y-4 text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-brand-soft text-primary">
          <MailCheck className="size-7" aria-hidden />
        </div>
        <h2 className="text-lg font-semibold">Vérifie ta boîte mail</h2>
        <p className="text-sm text-muted-foreground">
          Un lien de confirmation a été envoyé à{" "}
          <span className="font-medium text-foreground">{state.confirmationSentTo}</span>. Clique
          dessus pour activer ton compte.
        </p>
        <Link href="/login" className="inline-block text-sm font-medium text-primary hover:underline">
          Retour à la connexion
        </Link>
      </div>
    );
  }

  const errors = state.fieldErrors;

  return (
    <form action={action} noValidate className="space-y-5">
      <FormAlert message={state.error} />

      <FormField id="fullName" label="Prénom et nom" errors={errors?.fullName}>
        <Input
          id="fullName"
          name="fullName"
          autoComplete="name"
          placeholder="Camille Martin"
          defaultValue={state.values?.fullName}
          aria-invalid={Boolean(errors?.fullName)}
          aria-describedby="fullName-message"
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

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium">Ton niveau sportif</legend>
        <SportLevelPicker
          name="sportLevel"
          defaultValue={state.values?.sportLevel}
          invalid={Boolean(errors?.sportLevel)}
          describedBy="sportLevel-message"
        />
        {errors?.sportLevel && (
          <p id="sportLevel-message" role="alert" className="text-sm text-destructive">
            {errors.sportLevel[0]}
          </p>
        )}
      </fieldset>

      <SubmitButton pending={pending} pendingLabel="Création du compte…">
        Créer mon compte
      </SubmitButton>

      <p className="text-center text-sm text-muted-foreground">
        Déjà inscrit ?{" "}
        <Link href="/login" className="font-medium text-primary underline-offset-4 hover:underline">
          Se connecter
        </Link>
      </p>
    </form>
  );
}
