import { divIcon } from "leaflet";

import { SPORT_ICON_MARKUP, SPORT_ICON_SVG_ATTRS } from "@/components/brand/sport-icon";

import type { ActivityWithCreator } from "@/lib/activities/types";
import { getInitials } from "@/lib/format";

/** Utilisateur représenté par le marqueur « Moi ». */
export interface MapUser {
  fullName: string;
  avatarUrl: string | null;
}

/** Échappe le texte injecté dans le HTML des icônes (nom saisi par l'utilisateur). */
function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);
}

/**
 * Icônes Leaflet en HTML (divIcon), stylées par les classes `.map-marker-*` de globals.css.
 * Le contenu injecté ne provient que de valeurs contrôlées (icônes statiques, nombres) ou échappées.
 */

/** Marqueur d'activité : pastille avec l'icône du sport et un badge du nombre de places restantes. */
export function createActivityIcon(activity: ActivityWithCreator, selected: boolean) {
  const icon = `<svg ${SPORT_ICON_SVG_ATTRS}>${SPORT_ICON_MARKUP[activity.sportType]}</svg>`;
  const isFull = activity.status !== "open";
  const badge = isFull ? "Complet" : String(activity.spotsAvailable);

  const classes = ["map-marker-activity", isFull && "is-full", selected && "is-selected"]
    .filter(Boolean)
    .join(" ");

  return divIcon({
    className: "", // supprime le style par défaut de Leaflet (carré blanc)
    html: `<div class="${classes}">
      <span class="map-marker-activity__icon">${icon}</span>
      <span class="map-marker-activity__badge">${badge}</span>
    </div>`,
    iconSize: [44, 52],
    iconAnchor: [22, 52], // pointe du marqueur sur la position exacte
  });
}

/**
 * Marqueur « Moi » : bulle avec la photo de profil (ou les initiales), pointe vers la position,
 * et halo pulsé au sol.
 */
export function createUserLocationIcon(user: MapUser) {
  const content = user.avatarUrl
    ? `<img src="${escapeHtml(user.avatarUrl)}" alt="" class="map-marker-user__photo" />`
    : `<span class="map-marker-user__initials">${escapeHtml(getInitials(user.fullName))}</span>`;

  return divIcon({
    className: "",
    html: `<div class="map-marker-user">
      <span class="map-marker-user__pulse"></span>
      <span class="map-marker-user__bubble">${content}</span>
      <span class="map-marker-user__label">Moi</span>
    </div>`,
    iconSize: [48, 64],
    iconAnchor: [24, 58], // centre du halo sur la position exacte
  });
}

/** Épingle du lieu en cours de choix (création d'activité), déplaçable. */
export const draftLocationIcon = divIcon({
  className: "",
  html: `<div class="map-marker-draft"><span class="map-marker-draft__head"></span><span class="map-marker-draft__shadow"></span></div>`,
  iconSize: [36, 48],
  iconAnchor: [18, 46],
});
