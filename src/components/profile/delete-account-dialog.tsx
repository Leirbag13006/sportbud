"use client";

import { Loader2, Trash2 } from "lucide-react";
import { useActionState, useState } from "react";

import { deleteAccount, type AuthFormState } from "@/app/(auth)/actions";
import { FormField } from "@/components/forms/form-field";
import { PasswordInput } from "@/components/forms/password-input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

/** Suppression définitive du compte, confirmée par le mot de passe. */
export function DeleteAccountDialog() {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState<AuthFormState, FormData>(deleteAccount, {});

  return (
    <>
      <Button variant="outline" className="border-destructive/40 text-destructive hover:bg-destructive/5" onClick={() => setOpen(true)}>
        <Trash2 aria-hidden />
        Supprimer mon compte
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <form action={action} noValidate className="grid gap-4">
            <DialogHeader>
              <DialogTitle className="font-display text-lg font-extrabold">Supprimer ton compte ?</DialogTitle>
              <DialogDescription>Cette action est définitive. Seront supprimés :</DialogDescription>
            </DialogHeader>
            <ul className="list-disc space-y-1.5 pl-5 text-sm">
              <li>ton profil, ta photo, tes succès et les avis que tu as reçus ;</li>
              <li>les activités que tu organises (leurs participants perdent la conversation) ;</li>
              <li>tes candidatures et tes messages.</li>
            </ul>

            <FormField id="delete-password" label="Confirme avec ton mot de passe" errors={state.fieldErrors?.password}>
              <PasswordInput
                id="delete-password"
                name="password"
                autoComplete="current-password"
                aria-invalid={Boolean(state.fieldErrors?.password)}
                aria-describedby="delete-password-message"
                className="h-10"
                required
              />
            </FormField>

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setOpen(false)} disabled={pending}>
                Annuler
              </Button>
              <Button type="submit" variant="destructive" disabled={pending} aria-busy={pending}>
                {pending ? <Loader2 className="animate-spin" aria-hidden /> : <Trash2 aria-hidden />}
                {pending ? "Suppression…" : "Supprimer définitivement"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
