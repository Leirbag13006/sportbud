"use client";

import type { Map as LeafletMap } from "leaflet";
import { Check, LocateFixed, Loader2, MapPin, X } from "lucide-react";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";

import { CreateActivityFab } from "@/components/activities/create-activity-fab";
import {
  createDefaultFormValues,
  type ActivityFormValues,
} from "@/components/activities/create-activity-form";
import { CreateActivitySheet } from "@/components/activities/create-activity-sheet";
import { AddressSearch } from "@/components/map/address-search";
import { Button } from "@/components/ui/button";
import { USER_ZOOM } from "@/config/map";
import type { ActivityWithCreator } from "@/lib/activities/types";
import { reverseGeocode, type AddressSuggestion } from "@/lib/geocoding";
import { cn } from "@/lib/utils";
import type { MapUser } from "./marker-icons";

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
 * Modes de la carte :
 * - browse : consultation, clic sur un marqueur → détail ;
 * - pick   : choix du lieu d'une nouvelle activité (clic ou glisser l'épingle) ;
 * - form   : formulaire de création ouvert, épingle figée.
 */
type Mode = "browse" | "pick" | "form";

interface MapViewProps {
  activities: ActivityWithCreator[];
  currentUser: MapUser;
  userPosition: [number, number] | null;
  isLocating: boolean;
  /** Demande la position (fenêtre d'autorisation) quand elle est inconnue. */
  onRequestLocation: () => void;
  selectedId: string | null;
  onSelect: (activityId: string) => void;
  /** Activité sur laquelle centrer la carte à l'ouverture. */
  focusId?: string | null;
  /** Incrémenté par le parent pour lancer la création d'une activité (bouton + de la liste). */
  createRequest: number;
  onCreatingChange: (isCreating: boolean) => void;
  onCreated: (activityId: string) => void;
}

/** Vue carte de l'écran Explorer : marqueurs, recentrage et création d'activité. */
export function MapView({
  activities,
  currentUser,
  userPosition,
  isLocating,
  onRequestLocation,
  selectedId,
  onSelect,
  focusId,
  createRequest,
  onCreatingChange,
  onCreated,
}: MapViewProps) {
  const [map, setMap] = useState<LeafletMap | null>(null);
  const [mode, setMode] = useState<Mode>("browse");
  const [draftLocation, setDraftLocation] = useState<[number, number] | null>(null);
  const [formValues, setFormValues] = useState<ActivityFormValues>(createDefaultFormValues);
  const [isResolvingAddress, setIsResolvingAddress] = useState(false);
  const hasCentered = useRef(false);
  const handledCreateRequest = useRef(0);
  const geocodeAbortRef = useRef<AbortController | null>(null);

  useEffect(() => onCreatingChange(mode !== "browse"), [mode, onCreatingChange]);

  // Activité demandée (lien « Voir sur la carte », carte de la liste) : la carte s'ouvre dessus.
  useEffect(() => {
    if (!map || !focusId || hasCentered.current) return;
    const target = activities.find((activity) => activity.id === focusId);
    if (!target) return;
    hasCentered.current = true;
    map.setView([target.lat, target.lng], 15);
  }, [map, focusId, activities]);

  // Sinon, premier centrage automatique sur l'utilisateur dès que sa position est connue.
  useEffect(() => {
    if (!map || !userPosition || hasCentered.current) return;
    hasCentered.current = true;
    map.flyTo(userPosition, USER_ZOOM, { duration: 1 });
  }, [map, userPosition]);

  const handleRecenter = () => {
    if (!map) return;
    if (userPosition) map.flyTo(userPosition, Math.max(map.getZoom(), USER_ZOOM), { duration: 0.8 });
    else onRequestLocation();
  };

  const handleSelect = useCallback(
    (activity: ActivityWithCreator) => {
      onSelect(activity.id);
      map?.panTo([activity.lat, activity.lng], { animate: true });
    },
    [map, onSelect],
  );

  /**
   * Déplace l'épingle et retrouve l'adresse correspondante (géocodage inverse).
   * Une nouvelle position annule la recherche précédente encore en cours.
   */
  const moveDraftTo = useCallback((location: [number, number]) => {
    setDraftLocation(location);
    geocodeAbortRef.current?.abort();
    const controller = new AbortController();
    geocodeAbortRef.current = controller;
    setIsResolvingAddress(true);

    reverseGeocode(location, { signal: controller.signal })
      .then((address) => {
        if (!controller.signal.aborted) setFormValues((values) => ({ ...values, address: address ?? "" }));
      })
      .catch(() => {
        // Service indisponible : l'utilisateur pourra saisir l'adresse lui-même dans le formulaire.
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsResolvingAddress(false);
      });
  }, []);

  /** Adresse choisie dans la recherche : épingle posée dessus, adresse reprise telle quelle. */
  const handleAddressSelect = (suggestion: AddressSuggestion) => {
    geocodeAbortRef.current?.abort();
    setIsResolvingAddress(false);
    setDraftLocation(suggestion.position);
    setFormValues((values) => ({ ...values, address: suggestion.label }));
    map?.flyTo(suggestion.position, Math.max(map.getZoom(), 17), { duration: 0.8 });
  };

  /** Bouton « + » : passe en mode choix du lieu, épingle pré-placée (position de l'utilisateur ou centre). */
  const startCreation = useCallback(() => {
    if (!map) return;
    if (!draftLocation) {
      const center = map.getCenter();
      moveDraftTo(userPosition ?? [center.lat, center.lng]);
      if (userPosition) map.setView(userPosition, Math.max(map.getZoom(), USER_ZOOM));
    }
    setMode("pick");
  }, [map, draftLocation, moveDraftTo, userPosition]);

  // Création demandée depuis la liste : lancée dès que la carte est prête.
  useEffect(() => {
    if (!map || createRequest === 0 || handledCreateRequest.current === createRequest) return;
    handledCreateRequest.current = createRequest;
    startCreation();
  }, [map, createRequest, startCreation]);

  const cancelCreation = () => {
    geocodeAbortRef.current?.abort();
    setIsResolvingAddress(false);
    setMode("browse");
    setDraftLocation(null);
  };

  const handleCreated = (activityId: string) => {
    setMode("browse");
    setDraftLocation(null);
    setFormValues(createDefaultFormValues());
    // Les données sont rafraîchies par le serveur (revalidatePath) : le parent sélectionne la nouvelle activité.
    onCreated(activityId);
  };

  return (
    <div className={cn("relative flex-1", mode === "pick" && "map-picking")}>
      <h2 className="sr-only">Carte des activités</h2>

      {/* isolate : contient les z-index internes de Leaflet sous les éléments flottants de l'app. */}
      <div className="absolute inset-0 isolate">
        <ActivityMap
          activities={activities}
          currentUser={currentUser}
          userPosition={userPosition}
          selectedId={selectedId}
          onSelect={handleSelect}
          draftLocation={mode === "browse" ? null : draftLocation}
          onDraftLocationChange={mode === "pick" ? moveDraftTo : undefined}
          onReady={setMap}
        />
      </div>

      {mode === "browse" && activities.length === 0 && (
        <p className="absolute top-4 left-1/2 z-10 w-max max-w-[calc(100%-6rem)] -translate-x-1/2 rounded-full border bg-background/95 px-4 py-2 text-center text-sm shadow-md">
          Aucune activité ne correspond à tes filtres
        </p>
      )}

      {mode === "pick" && (
        <>
          <div className="absolute inset-x-4 top-4 z-10 mx-auto max-w-md space-y-2.5 rounded-xl border bg-background/95 p-3 shadow-lg backdrop-blur">
            <div className="flex items-center gap-3">
              <MapPin className="size-5 shrink-0 text-primary" aria-hidden />
              <p className="flex-1 text-sm">
                <span className="font-medium">Où se passe l&apos;activité ?</span>
                <br />
                <span className="text-muted-foreground">
                  Cherche une adresse, touche la carte ou déplace l&apos;épingle.
                </span>
              </p>
              <Button variant="ghost" size="icon-sm" onClick={cancelCreation} aria-label="Annuler la création">
                <X />
              </Button>
            </div>
            <AddressSearch
              near={() => {
                const center = map?.getCenter();
                return center ? [center.lat, center.lng] : undefined;
              }}
              onSelect={handleAddressSelect}
            />
          </div>

          <div className="absolute inset-x-4 bottom-4 z-10 mx-auto max-w-md space-y-2 md:bottom-6">
            <p
              role="status"
              aria-live="polite"
              className="flex items-center gap-2 rounded-lg border bg-background/95 px-3 py-2 text-sm shadow-md backdrop-blur"
            >
              {isResolvingAddress ? (
                <>
                  <Loader2 className="size-4 shrink-0 animate-spin text-muted-foreground" aria-hidden />
                  <span className="text-muted-foreground">Recherche de l&apos;adresse…</span>
                </>
              ) : (
                <>
                  <MapPin className="size-4 shrink-0 text-primary" aria-hidden />
                  <span className="truncate">{formValues.address || "Adresse inconnue : tu pourras la saisir"}</span>
                </>
              )}
            </p>
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
            {isLocating ? <Loader2 className="animate-spin" /> : <LocateFixed />}
          </Button>
          <CreateActivityFab onClick={startCreation} />
        </>
      )}

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
