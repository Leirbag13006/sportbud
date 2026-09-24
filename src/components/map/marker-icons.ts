import { divIcon } from "leaflet";

import { getSport } from "@/config/sports";
import type { ActivityWithCreator } from "@/lib/activities/types";

/**
 * Icônes Leaflet en HTML (divIcon), stylées par les classes `.map-marker-*` de globals.css.
 * Le contenu injecté ne provient que de valeurs contrôlées (emoji de la config, nombres).
 */

/** Marqueur d'activité : pastille avec l'emoji du sport et un badge du nombre de places restantes. */
export function createActivityIcon(activity: ActivityWithCreator, selected: boolean) {
  const { emoji } = getSport(activity.sportType);
  const isFull = activity.status !== "open";
  const badge = isFull ? "Complet" : String(activity.spotsAvailable);

  const classes = ["map-marker-activity", isFull && "is-full", selected && "is-selected"]
    .filter(Boolean)
    .join(" ");

  return divIcon({
    className: "", // supprime le style par défaut de Leaflet (carré blanc)
    html: `<div class="${classes}">
      <span class="map-marker-activity__emoji" aria-hidden="true">${emoji}</span>
      <span class="map-marker-activity__badge">${badge}</span>
    </div>`,
    iconSize: [44, 52],
    iconAnchor: [22, 52], // pointe du marqueur sur la position exacte
  });
}

/** Marqueur « Moi » : point bleu avec halo pulsé. */
export const userLocationIcon = divIcon({
  className: "",
  html: `<div class="map-marker-user"><span class="map-marker-user__pulse"></span><span class="map-marker-user__dot"></span></div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

/** Épingle du lieu en cours de choix (création d'activité), déplaçable. */
export const draftLocationIcon = divIcon({
  className: "",
  html: `<div class="map-marker-draft"><span class="map-marker-draft__head"></span><span class="map-marker-draft__shadow"></span></div>`,
  iconSize: [36, 48],
  iconAnchor: [18, 46],
});
