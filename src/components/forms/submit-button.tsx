import { Loader2 } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";

interface SubmitButtonProps {
  pending: boolean;
  pendingLabel: string;
  children: ReactNode;
}

/** Bouton d'envoi pleine largeur, désactivé avec indicateur pendant l'envoi. */
export function SubmitButton({ pending, pendingLabel, children }: SubmitButtonProps) {
  return (
    <Button type="submit" disabled={pending} aria-busy={pending} className="h-10 w-full text-sm">
      {pending ? (
        <>
          <Loader2 className="animate-spin" aria-hidden />
          {pendingLabel}
        </>
      ) : (
        children
      )}
    </Button>
  );
}
