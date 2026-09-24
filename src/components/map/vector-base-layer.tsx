"use client";

import { maplibreGL } from "@maplibre/maplibre-gl-leaflet";
import { useEffect } from "react";
import { useMap } from "react-leaflet";

import { MAP_ATTRIBUTION, SPORTMATES_MAP_STYLE } from "@/config/map-style";

/**
 * Fond de carte vectoriel SportMates, rendu par MapLibre sous les marqueurs Leaflet.
 * Leaflet garde la main sur les interactions (déplacement, zoom, clics) ; MapLibre ne fait que dessiner.
 */
export function VectorBaseLayer() {
  const map = useMap();

  useEffect(() => {
    const layer = maplibreGL({
      style: SPORTMATES_MAP_STYLE,
      // Crédits affichés par le contrôle d'attribution Leaflet (obligatoires pour OSM / OpenFreeMap).
      attributionControl: { customAttribution: MAP_ATTRIBUTION },
    });
    layer.addTo(map);
    return () => {
      layer.remove();
    };
  }, [map]);

  return null;
}
