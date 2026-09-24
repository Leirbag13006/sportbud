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
import { AddressSearch } from "@/components/map/address-search";
import { LocationPermissionDialog } from "@/components/map/location-permission-dialog";
import { Button } from "@/components/ui/button";
import { USER_ZOOM } from "@/config/map";
import { useGeolocation } from "@/hooks/use-geolocation";
import type { ActivityWithCreator } from "@/lib/activities/types";
import type { MyApplicationSummary, ReceivedApplication } from "@/lib/applications/types";
import { reverseGeocode, type AddressSuggestion } from "@/lib/geocoding";
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
  /** Candidatures de l'utilisateur, par activité. */
  myApplications: Record<string, MyApplicationSummary>;
  /** Candidatures reçues sur les activités de l'utilisateur. */
  receivedApplications: ReceivedApplication[];
  /** Activité à ouvrir au chargement (lien « Voir sur la carte »). */
  initialSelectedId?: string;
}

/** Écran carte : géolocalisation, marqueurs, détail d'activité et création. */
export function MapView({
  activities,
  currentUserId,
  myApplications,
  receivedApplications,
  initialSelectedId,
}: MapViewProps) {
  const { state: geolocation, permission, request: requestLocation } = useGeolocation();
  // Fenêtre d'explication : proposée une fois par session, puis rouverte via le bouton de recentrage.
  const [promptDismissed, setPromptDismissed] = useState(readPromptDismissed);
  const [manualDialog, setManualDialog] = useState<"prompt" | "denied" | null>(null);
  const [map, setMap] = useState<LeafletMap | null>(null);
  const [mode, setMode] = useState<Mode>("browse");
  const [selectedId, setSelectedId] = useState<string | null>(initialSelectedId ?? null);
  const [draftLocation, setDraftLocation] = useState<[number, number] | null>(null);
  const [formValues, setFormValues] = useState<ActivityFormValues>(createDefaultFormValues);
  const [isResolvingAddress, setIsResolvingAddress] = useState(false);
  const hasCenteredOnUser = useRef(false);
  const geocodeAbortRef = useRef<AbortController | null>(null);

  const userPosition = geolocation.position;
  // Dérivé des données serveur : se met à jour quand la carte est rafraîchie.
  const selected = activities.find((activity) => activity.id === selectedId) ?? null;

  // Activité demandée dans l'URL : la carte s'ouvre dessus plutôt que sur l'utilisateur.
  useEffect(() => {
    if (!map || !initialSelectedId || hasCenteredOnUser.current) return;
    const target = activities.find((activity) => activity.id === initialSelectedId);
    if (!target) return;
    hasCenteredOnUser.current = true;
    map.setView([target.lat, target.lng], 15);
  }, [map, initialSelectedId, activities]);

  // Premier centrage automatique sur l'utilisateur dès que sa position est connue.
  useEffect(() => {
    if (!map || !userPosition || hasCenteredOnUser.current) return;
    hasCenteredOnUser.current = true;
    map.flyTo(userPosition, USER_ZOOM, { duration: 1 });
  }, [map, userPosition]);

  // Informe l'utilisateur si la localisation échoue après avoir été demandée.
  useEffect(() => {
    if (geolocation.status === "denied") {
      toast.info("Position non partagée : la carte est centrée sur Marseille.", {
        description: "Tu peux l'activer à tout moment avec le bouton de localisation.",
      });
    } else if (geolocation.status === "unavailable") {
      toast.warning("Impossible de déterminer ta position.");
    }
  }, [geolocation.status]);

  // Proposée automatiquement si le navigateur n'a encore ni autorisé ni refusé la localisation.
  const autoPrompt = permission === "prompt" && geolocation.status === "idle" && !promptDismissed;
  const permissionDialog = manualDialog ?? (autoPrompt ? "prompt" : null);

  const closePermissionDialog = () => {
    setManualDialog(null);
    setPromptDismissed(true);
    try {
      sessionStorage.setItem(PROMPT_DISMISSED_KEY, "1");
    } catch {
      // Stockage indisponible (navigation privée…) : la fenêtre pourra réapparaître, sans gravité.
    }
  };

  const handleRecenter = () => {
    if (!map) return;
    if (userPosition) {
      map.flyTo(userPosition, Math.max(map.getZoom(), USER_ZOOM), { duration: 0.8 });
    } else if (permission === "denied") {
      setManualDialog("denied");
    } else if (permission === "unsupported") {
      toast.warning("Ton navigateur ne permet pas la localisation.");
    } else if (geolocation.status !== "locating") {
      setManualDialog("prompt");
    }
  };

  const handleSelect = useCallback(
    (activity: ActivityWithCreator) => {
      setSelectedId(activity.id);
      map?.panTo([activity.lat, activity.lng], { animate: true });
    },
    [map],
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

  /** FAB « + » : passe en mode choix du lieu, épingle pré-placée au centre de la carte. */
  const startCreation = () => {
    setSelectedId(null);
    if (!draftLocation && map) {
      const center = map.getCenter();
      moveDraftTo([center.lat, center.lng]);
    }
    setMode("pick");
  };

  const cancelCreation = () => {
    geocodeAbortRef.current?.abort();
    setIsResolvingAddress(false);
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
          onDraftLocationChange={mode === "pick" ? moveDraftTo : undefined}
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
            {geolocation.status === "locating" ? <Loader2 className="animate-spin" /> : <LocateFixed />}
          </Button>
          <CreateActivityFab onClick={startCreation} />
        </>
      )}

      <ActivitySheet
        activity={mode === "browse" ? selected : null}
        currentUserId={currentUserId}
        myApplication={selected ? (myApplications[selected.id] ?? null) : null}
        receivedApplications={
          selected ? receivedApplications.filter((application) => application.activityId === selected.id) : []
        }
        onClose={() => setSelectedId(null)}
      />

      <LocationPermissionDialog
        variant={permissionDialog}
        onAllow={() => {
          closePermissionDialog();
          // Déclenche la demande native du navigateur.
          requestLocation();
        }}
        onClose={closePermissionDialog}
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

const PROMPT_DISMISSED_KEY = "sportbud:location-prompt-dismissed";

/** La fenêtre de localisation a-t-elle déjà été fermée pendant cette session ? */
function readPromptDismissed() {
  try {
    return typeof window !== "undefined" && sessionStorage.getItem(PROMPT_DISMISSED_KEY) === "1";
  } catch {
    return false;
  }
}
