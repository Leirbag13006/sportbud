"use client";

import { LocateFixed, Lock, MapPin, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface LocationPermissionDialogProps {
  /**
   * - prompt : explique l'intérêt avant la demande native du navigateur ;
   * - denied : la localisation est bloquée, explique comment la réactiver.
   */
  variant: "prompt" | "denied" | null;
  onAllow: () => void;
  onClose: () => void;
}

/** Fenêtre d'explication avant (ou après refus de) la demande de localisation du navigateur. */
export function LocationPermissionDialog({ variant, onAllow, onClose }: LocationPermissionDialogProps) {
  return (
    <Dialog open={variant !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-sm" showCloseButton={false}>
        {variant === "denied" ? (
          <>
            <DialogHeader className="items-center text-center">
              <span className="flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <Lock className="size-7" aria-hidden />
              </span>
              <DialogTitle className="text-lg">Localisation bloquée</DialogTitle>
              <DialogDescription>
                Ton navigateur empêche SportLink d&apos;accéder à ta position. Pour la réactiver :
              </DialogDescription>
            </DialogHeader>
            <ol className="list-decimal space-y-1.5 rounded-lg bg-muted/60 py-3 pr-3 pl-8 text-sm">
              <li>
                Clique sur l&apos;icône <Lock className="inline size-3.5 align-[-2px]" aria-label="cadenas" /> ou
                réglages, à gauche de l&apos;adresse du site ;
              </li>
              <li>
                Dans <strong>Localisation</strong>, choisis <strong>Autoriser</strong> ;
              </li>
              <li>Recharge la page.</li>
            </ol>
            <DialogFooter>
              <Button className="h-10 w-full" onClick={onClose}>
                Compris
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader className="items-center text-center">
              <span className="flex size-14 items-center justify-center rounded-full bg-brand-soft text-brand-text">
                <MapPin className="size-7" aria-hidden />
              </span>
              <DialogTitle className="text-lg">Trouve des partenaires près de toi</DialogTitle>
              <DialogDescription>
                SportLink utilise ta position pour centrer la carte sur toi et t&apos;afficher les activités à
                proximité.
              </DialogDescription>
            </DialogHeader>
            <p className="flex items-start gap-2 rounded-lg bg-muted/60 p-3 text-xs text-muted-foreground">
              <ShieldCheck className="mt-0.5 size-4 shrink-0 text-brand-text" aria-hidden />
              Ta position reste sur ton appareil : elle n&apos;est jamais enregistrée ni partagée avec les
              autres membres.
            </p>
            <DialogFooter className="flex-col gap-2 sm:flex-col">
              <Button className="h-10 w-full" onClick={onAllow}>
                <LocateFixed aria-hidden />
                Autoriser la localisation
              </Button>
              <Button variant="ghost" className="h-10 w-full" onClick={onClose}>
                Plus tard
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
