"use client";

import "leaflet/dist/leaflet.css";

import type { LatLngTuple, Map as LeafletMap } from "leaflet";
import { useMemo } from "react";
import { AttributionControl, MapContainer, Marker, TileLayer, ZoomControl } from "react-leaflet";

import { DEFAULT_CENTER, DEFAULT_ZOOM, TILE_LAYER } from "@/config/map";
import { getSport } from "@/config/sports";
import type { ActivityWithCreator } from "@/lib/activities/types";
import { formatDay, formatTime } from "@/lib/format";
import { createActivityIcon, userLocationIcon } from "./marker-icons";

interface ActivityMapProps {
  activities: ActivityWithCreator[];
  userPosition: LatLngTuple | null;
  selectedId: string | null;
  onSelect: (activity: ActivityWithCreator) => void;
  /** Transmet l'instance Leaflet au parent (recentrage, animations). */
  onReady: (map: LeafletMap) => void;
}

/**
 * Carte Leaflet : fond de carte, marqueur « Moi » et marqueurs d'activités.
 * Composant client uniquement (Leaflet manipule le DOM) : chargé via next/dynamic sans SSR.
 */
export default function ActivityMap({
  activities,
  userPosition,
  selectedId,
  onSelect,
  onReady,
}: ActivityMapProps) {
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

      {activities.map((activity) => (
        <ActivityMarker
          key={activity.id}
          activity={activity}
          selected={activity.id === selectedId}
          onSelect={onSelect}
        />
      ))}
    </MapContainer>
  );
}

interface ActivityMarkerProps {
  activity: ActivityWithCreator;
  selected: boolean;
  onSelect: (activity: ActivityWithCreator) => void;
}

function ActivityMarker({ activity, selected, onSelect }: ActivityMarkerProps) {
  // L'icône n'est recréée que si son apparence change.
  const icon = useMemo(
    () => createActivityIcon(activity, selected),
    [activity, selected],
  );
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
