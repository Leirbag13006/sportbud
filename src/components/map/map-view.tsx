"use client";

import type { Map as LeafletMap } from "leaflet";
import { Check, LocateFixed, Loader2, MapPin, X } from "lucide-react";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { ActivitySheet } from "@/components/activities/activity-sheet";
import { CreateActivityFab } from "@/components/activities/create-activity-fab";
import {
  createDefaultFormValues,
  type ActivityFormValues,
} from "@/components/activities/create-activity-form";
import { CreateActivitySheet } from "@/components/activities/create-activity-sheet";
import { Button } from "@/components/ui/button";
import { USER_ZOOM } from "@/config/map";
import { useGeolocation } from "@/hooks/use-geolocation";
import type { ActivityWithCreator } from "@/lib/activities/types";
import { cn } from "@/lib/utils";

// Leaflet a besoin de `window` : la carte n'est rendue que dans le navigateur.
const ActivityMap = dynamic(() => import("./activity-map"), {
  ssr: false,
  loading: () => (
    <div className="flex size-full items-center justify-center bg-muted/40">
      <Loader2 className="size-6 animate-spin text-muted-foreground" aria-label="Chargement de la carte" />
    </div>
  ),
});

/**
 * Modes de l'écran carte :
 * - browse : consultation, clic sur un marqueur → détail ;
 * - pick   : choix du lieu d'une nouvelle activité (clic ou glisser l'épingle) ;
 * - form   : formulaire de création ouvert, épingle figée.
 */
type Mode = "browse" | "pick" | "form";

interface MapViewProps {
  activities: ActivityWithCreator[];
  currentUserId: string;
}

/** Écran carte : géolocalisation, marqueurs, détail d'activité et création. */
export function MapView({ activities, currentUserId }: MapViewProps) {
  const geolocation = useGeolocation();
  const [map, setMap] = useState<LeafletMap | null>(null);
  const [mode, setMode] = useState<Mode>("browse");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draftLocation, setDraftLocation] = useState<[number, number] | null>(null);
  const [formValues, setFormValues] = useState<ActivityFormValues>(createDefaultFormValues);
  const hasCenteredOnUser = useRef(false);

  const userPosition = geolocation.position;
  // Dérivé des données serveur : se met à jour quand la carte est rafraîchie.
  const selected = activities.find((activity) => activity.id === selectedId) ?? null;

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
      setSelectedId(activity.id);
      map?.panTo([activity.lat, activity.lng], { animate: true });
    },
    [map],
  );

  /** FAB « + » : passe en mode choix du lieu, épingle pré-placée au centre de la carte. */
  const startCreation = () => {
    setSelectedId(null);
    if (!draftLocation && map) {
      const center = map.getCenter();
      setDraftLocation([center.lat, center.lng]);
    }
    setMode("pick");
  };

  const cancelCreation = () => {
    setMode("browse");
    setDraftLocation(null);
  };

  const handleCreated = (activityId: string) => {
    // La carte est rafraîchie par le serveur (revalidatePath) : on sélectionne la nouvelle activité.
    setMode("browse");
    setSelectedId(activityId);
    setDraftLocation(null);
    setFormValues(createDefaultFormValues());
  };

  return (
    <div className={cn("relative flex-1", mode === "pick" && "map-picking")}>
      <h1 className="sr-only">Carte des activités</h1>

      {/* isolate : contient les z-index internes de Leaflet sous les éléments flottants de l'app. */}
      <div className="absolute inset-0 isolate">
        <ActivityMap
          activities={activities}
          userPosition={userPosition}
          selectedId={selectedId}
          onSelect={handleSelect}
          draftLocation={mode === "browse" ? null : draftLocation}
          onDraftLocationChange={mode === "pick" ? setDraftLocation : undefined}
          onReady={setMap}
        />
      </div>

      {mode === "browse" && activities.length === 0 && (
        <p className="absolute top-4 left-1/2 z-10 w-max max-w-[calc(100%-6rem)] -translate-x-1/2 rounded-full border bg-background/95 px-4 py-2 text-center text-sm shadow-md">
          Aucune activité pour l&apos;instant : crée la première avec le bouton +
        </p>
      )}

      {mode === "pick" && (
        <>
          <div
            role="status"
            className="absolute inset-x-4 top-4 z-10 mx-auto flex max-w-md items-center gap-3 rounded-xl border bg-background/95 p-3 shadow-lg backdrop-blur"
          >
            <MapPin className="size-5 shrink-0 text-primary" aria-hidden />
            <p className="flex-1 text-sm">
              <span className="font-medium">Où se passe l&apos;activité ?</span>
              <br />
              <span className="text-muted-foreground">Touche la carte ou déplace l&apos;épingle.</span>
            </p>
            <Button variant="ghost" size="icon-sm" onClick={cancelCreation} aria-label="Annuler la création">
              <X />
            </Button>
          </div>

          <div className="absolute inset-x-4 bottom-4 z-10 mx-auto max-w-md md:bottom-6">
            <Button
              className="h-12 w-full text-base shadow-lg shadow-primary/30"
              disabled={!draftLocation}
              onClick={() => setMode("form")}
            >
              <Check aria-hidden />
              Valider ce lieu
            </Button>
          </div>
        </>
      )}

      {mode === "browse" && (
        <>
          <Button
            variant="outline"
            size="icon-lg"
            onClick={handleRecenter}
            aria-label="Recentrer sur ma position"
            className="absolute right-4 bottom-22 z-10 size-11 rounded-full bg-background shadow-md md:right-6"
          >
            {geolocation.status === "locating" ? <Loader2 className="animate-spin" /> : <LocateFixed />}
          </Button>
          <CreateActivityFab onClick={startCreation} />
        </>
      )}

      <ActivitySheet
        activity={mode === "browse" ? selected : null}
        currentUserId={currentUserId}
        onClose={() => setSelectedId(null)}
      />

      <CreateActivitySheet
        open={mode === "form"}
        location={draftLocation}
        values={formValues}
        onValuesChange={setFormValues}
        onClose={cancelCreation}
        onEditLocation={() => setMode("pick")}
        onCreated={handleCreated}
      />
    </div>
  );
}
