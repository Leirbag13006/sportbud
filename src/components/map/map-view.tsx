"use client";

import type { Map as LeafletMap } from "leaflet";
import { LocateFixed, Loader2 } from "lucide-react";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { ActivitySheet } from "@/components/activities/activity-sheet";
import { CreateActivityFab } from "@/components/activities/create-activity-fab";
import { Button } from "@/components/ui/button";
import { DEFAULT_CENTER, USER_ZOOM } from "@/config/map";
import { useGeolocation } from "@/hooks/use-geolocation";
import { getMockActivities } from "@/lib/activities/mock";
import type { ActivityWithCreator } from "@/lib/activities/types";

// Leaflet a besoin de `window` : la carte n'est rendue que dans le navigateur.
const ActivityMap = dynamic(() => import("./activity-map"), {
  ssr: false,
  loading: () => (
    <div className="flex size-full items-center justify-center bg-muted/40">
      <Loader2 className="size-6 animate-spin text-muted-foreground" aria-label="Chargement de la carte" />
    </div>
  ),
});

/** Écran carte : géolocalisation, marqueurs, détail de l'activité et actions flottantes. */
export function MapView() {
  const geolocation = useGeolocation();
  const [map, setMap] = useState<LeafletMap | null>(null);
  const [selected, setSelected] = useState<ActivityWithCreator | null>(null);
  const hasCenteredOnUser = useRef(false);

  const isLocating = geolocation.status === "locating";
  const userPosition = geolocation.position;

  // TODO (étape 4) : remplacer par les activités de la base.
  // Données fictives affichées tout de suite autour du centre par défaut, puis déplacées
  // une seule fois autour de l'utilisateur quand sa position est connue.
  const [mockAnchor, setMockAnchor] = useState<[number, number]>(DEFAULT_CENTER);
  const [hasAnchoredOnUser, setHasAnchoredOnUser] = useState(false);
  if (userPosition && !hasAnchoredOnUser) {
    setHasAnchoredOnUser(true);
    setMockAnchor(userPosition);
  }
  const activities = useMemo(() => getMockActivities(mockAnchor), [mockAnchor]);

  // Premier centrage automatique sur l'utilisateur dès que sa position est connue.
  useEffect(() => {
    if (!map || !userPosition || hasCenteredOnUser.current) return;
    hasCenteredOnUser.current = true;
    map.flyTo(userPosition, USER_ZOOM, { duration: 1 });
  }, [map, userPosition]);

  // Informe l'utilisateur si la géolocalisation n'est pas disponible.
  useEffect(() => {
    if (geolocation.status === "denied") {
      toast.info("Position non partagée : la carte est centrée sur Marseille.", {
        description: "Autorise la localisation dans ton navigateur pour voir les activités autour de toi.",
      });
    } else if (geolocation.status === "unavailable") {
      toast.warning("Impossible de déterminer ta position.");
    }
  }, [geolocation.status]);

  const handleRecenter = () => {
    if (!map) return;
    if (userPosition) {
      map.flyTo(userPosition, Math.max(map.getZoom(), USER_ZOOM), { duration: 0.8 });
    } else {
      toast.info("Ta position n'est pas disponible.", {
        description: "Autorise la localisation dans les réglages de ton navigateur.",
      });
    }
  };

  const handleSelect = useCallback(
    (activity: ActivityWithCreator) => {
      setSelected(activity);
      map?.panTo([activity.lat, activity.lng], { animate: true });
    },
    [map],
  );

  return (
    <div className="relative flex-1">
      <h1 className="sr-only">Carte des activités</h1>

      {/* isolate : contient les z-index internes de Leaflet sous les éléments flottants de l'app. */}
      <div className="absolute inset-0 isolate">
        <ActivityMap
          activities={activities}
          userPosition={userPosition}
          selectedId={selected?.id ?? null}
          onSelect={handleSelect}
          onReady={setMap}
        />
      </div>

      <Button
        variant="outline"
        size="icon-lg"
        onClick={handleRecenter}
        aria-label="Recentrer sur ma position"
        className="absolute right-4 bottom-22 z-10 size-11 rounded-full bg-background shadow-md md:right-6 md:bottom-22"
      >
        {isLocating ? <Loader2 className="animate-spin" /> : <LocateFixed />}
      </Button>

      <CreateActivityFab />

      <ActivitySheet activity={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
