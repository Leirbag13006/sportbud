"use client";

import "leaflet/dist/leaflet.css";

import type { LatLngTuple, Map as LeafletMap, Marker as LeafletMarker } from "leaflet";
import { useMemo } from "react";
import {
  AttributionControl,
  MapContainer,
  Marker,
  TileLayer,
  ZoomControl,
  useMapEvents,
} from "react-leaflet";

import { DEFAULT_CENTER, DEFAULT_ZOOM, TILE_LAYER } from "@/config/map";
import { getSport } from "@/config/sports";
import type { ActivityWithCreator } from "@/lib/activities/types";
import { formatDay, formatTime } from "@/lib/format";
import { createActivityIcon, draftLocationIcon, userLocationIcon } from "./marker-icons";

interface ActivityMapProps {
  activities: ActivityWithCreator[];
  userPosition: LatLngTuple | null;
  selectedId: string | null;
  onSelect: (activity: ActivityWithCreator) => void;
  /** Lieu en cours de choix (création d'activité), ou null. */
  draftLocation: [number, number] | null;
  /** Si défini, le mode « choix du lieu » est actif : un clic sur la carte déplace l'épingle. */
  onDraftLocationChange?: (location: [number, number]) => void;
  /** Transmet l'instance Leaflet au parent (recentrage, animations). */
  onReady: (map: LeafletMap) => void;
}

/**
 * Carte Leaflet : fond de carte, marqueur « Moi », marqueurs d'activités et épingle de création.
 * Composant client uniquement (Leaflet manipule le DOM) : chargé via next/dynamic sans SSR.
 */
export default function ActivityMap({
  activities,
  userPosition,
  selectedId,
  onSelect,
  draftLocation,
  onDraftLocationChange,
  onReady,
}: ActivityMapProps) {
  const isPicking = Boolean(onDraftLocationChange);

  return (
    <MapContainer
      center={DEFAULT_CENTER}
      zoom={DEFAULT_ZOOM}
      zoomControl={false}
      attributionControl={false}
      className="size-full"
      ref={(map) => {
        if (map) onReady(map);
      }}
    >
      <TileLayer {...TILE_LAYER} />
      <ZoomControl position="topright" />
      <AttributionControl position="bottomleft" prefix={false} />

      {userPosition && (
        <Marker
          position={userPosition}
          icon={userLocationIcon}
          title="Ma position"
          keyboard={false}
          zIndexOffset={-100}
        />
      )}

      {/* Pendant le choix du lieu, les activités sont masquées pour éviter les clics involontaires. */}
      {!isPicking &&
        activities.map((activity) => (
          <ActivityMarker
            key={activity.id}
            activity={activity}
            selected={activity.id === selectedId}
            onSelect={onSelect}
          />
        ))}

      {onDraftLocationChange && <MapClickHandler onClick={onDraftLocationChange} />}

      {draftLocation && <DraftMarker position={draftLocation} onChange={onDraftLocationChange} />}
    </MapContainer>
  );
}

/** Place l'épingle là où l'utilisateur clique / touche la carte. */
function MapClickHandler({ onClick }: { onClick: (location: [number, number]) => void }) {
  useMapEvents({
    click: (event) => onClick([event.latlng.lat, event.latlng.lng]),
  });
  return null;
}

interface DraftMarkerProps {
  position: [number, number];
  /** Absent : épingle figée (formulaire ouvert). */
  onChange?: (location: [number, number]) => void;
}

/** Épingle du futur lieu d'activité, déplaçable par glisser-déposer. */
function DraftMarker({ position, onChange }: DraftMarkerProps) {
  const eventHandlers = useMemo(
    () => ({
      dragend: (event: { target: LeafletMarker }) => {
        const { lat, lng } = event.target.getLatLng();
        onChange?.([lat, lng]);
      },
    }),
    [onChange],
  );

  return (
    <Marker
      position={position}
      icon={draftLocationIcon}
      draggable={Boolean(onChange)}
      eventHandlers={eventHandlers}
      title="Lieu de l'activité"
      zIndexOffset={2000}
    />
  );
}

interface ActivityMarkerProps {
  activity: ActivityWithCreator;
  selected: boolean;
  onSelect: (activity: ActivityWithCreator) => void;
}

function ActivityMarker({ activity, selected, onSelect }: ActivityMarkerProps) {
  // L'icône n'est recréée que si son apparence change.
  const icon = useMemo(() => createActivityIcon(activity, selected), [activity, selected]);
  const { label } = getSport(activity.sportType);
  const spots = activity.status === "open" ? `${activity.spotsAvailable} place(s)` : "complet";

  const eventHandlers = useMemo(
    () => ({
      click: () => onSelect(activity),
      // Les marqueurs sont focusables (Tab) : Entrée ouvre le détail, comme un clic.
      keypress: (event: { originalEvent: KeyboardEvent }) => {
        if (event.originalEvent.key === "Enter") onSelect(activity);
      },
    }),
    [activity, onSelect],
  );

  return (
    <Marker
      position={[activity.lat, activity.lng]}
      icon={icon}
      // Libellé lu par les lecteurs d'écran et affiché au survol.
      title={`${label}, ${formatDay(activity.startsAt)} à ${formatTime(activity.startsAt)}, ${spots}`}
      // Les marqueurs sélectionnés et ouverts passent au premier plan.
      zIndexOffset={selected ? 1000 : activity.status === "open" ? 0 : -50}
      eventHandlers={eventHandlers}
    />
  );
}
