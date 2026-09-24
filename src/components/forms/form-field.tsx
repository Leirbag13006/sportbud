import type { ReactNode } from "react";

import { Label } from "@/components/ui/label";

interface FormFieldProps {
  id: string;
  label: string;
  /** Messages d'erreur du champ (le premier est affiché). */
  errors?: string[];
  /** Aide affichée sous le champ quand il n'y a pas d'erreur. */
  hint?: string;
  /** Élément aligné à droite du libellé (ex. lien « Mot de passe oublié »). */
  labelAction?: ReactNode;
  children: ReactNode;
}

/**
 * Libellé + champ + message d'erreur accessible.
 * Le champ enfant doit porter `id`, et `aria-describedby={`${id}-message`}`.
 */
export function FormField({ id, label, errors, hint, labelAction, children }: FormFieldProps) {
  const error = errors?.[0];
  const message = error ?? hint;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor={id}>{label}</Label>
        {labelAction}
      </div>
      {children}
      {message && (
        <p
          id={`${id}-message`}
          className={error ? "text-sm text-destructive" : "text-sm text-muted-foreground"}
          role={error ? "alert" : undefined}
        >
          {message}
        </p>
      )}
    </div>
  );
}
