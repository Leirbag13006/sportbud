"use client";

import { Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

/**
 * Bouton flottant de création d'activité, en bas à droite de la carte.
 * Mobile : FAB rond icône seule. Desktop : bouton étendu avec libellé.
 */
export function CreateActivityFab() {
  return (
    <Button
      aria-label="Créer une activité"
      className="absolute right-4 bottom-4 z-20 size-14 rounded-full shadow-lg shadow-primary/30 md:right-6 md:bottom-6 md:h-12 md:w-auto md:gap-2 md:px-5 md:text-base [&_svg:not([class*='size-'])]:size-6 md:[&_svg:not([class*='size-'])]:size-5"
      // TODO (étape 4) : ouvrir le formulaire de création.
      onClick={() => toast.info("La création d'activité arrive à l'étape 4.")}
    >
      <Plus strokeWidth={2.5} aria-hidden />
      <span className="hidden md:inline">Créer une activité</span>
    </Button>
  );
}
