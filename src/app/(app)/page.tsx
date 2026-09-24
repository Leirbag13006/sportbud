import { MapPin } from "lucide-react";

import { CreateActivityFab } from "@/components/activities/create-activity-fab";
import { EmptyState } from "@/components/layout/empty-state";

/** Écran principal : la carte interactive (intégrée à l'étape 3). */
export default function MapPage() {
  return (
    <div className="relative flex flex-1 flex-col bg-muted/40">
      <h1 className="sr-only">Carte des activités</h1>
      <EmptyState
        icon={MapPin}
        title="La carte arrive bientôt"
        description="Les activités sportives autour de toi s'afficheront ici."
      />
      <CreateActivityFab />
    </div>
  );
}
