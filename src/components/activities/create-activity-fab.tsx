"use client";

import { Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

/** Bouton d'action flottant (FAB) pour créer une activité, placé au-dessus de la Bottom Bar. */
export function CreateActivityFab() {
  return (
    <Button
      aria-label="Créer une activité"
      className="absolute right-4 bottom-4 z-20 size-14 rounded-full shadow-lg shadow-primary/30 [&_svg:not([class*='size-'])]:size-6"
      // TODO (étape 4) : ouvrir le formulaire de création.
      onClick={() => toast.info("La création d'activité arrive à l'étape 4.")}
    >
      <Plus strokeWidth={2.5} />
    </Button>
  );
}
