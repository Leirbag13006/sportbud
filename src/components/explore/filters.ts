import type { Audience, Gender, SportLevel, SportType } from "@/db/schema";
import type { ExploreActivity } from "@/lib/activities/types";
import { canJoinAudience } from "@/config/audience";
import { distanceKm } from "@/lib/geo";

export type WhenFilter = "all" | "today" | "tomorrow" | "weekend" | "week";
export type SortOrder = "date" | "distance";
/** « Ouvert à » : toutes les séances, mixtes seulement, ou un public restreint. */
export type AudienceFilter = "any" | "mixed" | Exclude<Audience, "all">;

export interface ExploreFilters {
  /** null = tous les sports. */
  sport: SportType | null;
  /** Rayon maximal en km, null = sans limite (nécessite la position de l'utilisateur). */
  maxDistanceKm: number | null;
  when: WhenFilter;
  /** Activités accessibles à ce niveau (niveau requis identique ou « tous niveaux »). */
  level: SportLevel | null;
  onlyAvailable: boolean;
  onlyFree: boolean;
  audience: AudienceFilter;
  sort: SortOrder;
}

export const DEFAULT_FILTERS: ExploreFilters = {
  sport: null,
  maxDistanceKm: null,
  when: "all",
  level: null,
  onlyAvailable: false,
  onlyFree: false,
  audience: "any",
  sort: "date",
};

export const DISTANCE_OPTIONS = [2, 5, 10, 25] as const;

export const WHEN_OPTIONS: { value: WhenFilter; label: string }[] = [
  { value: "all", label: "Toutes les dates" },
  { value: "today", label: "Aujourd'hui" },
  { value: "tomorrow", label: "Demain" },
  { value: "weekend", label: "Ce week-end" },
  { value: "week", label: "7 prochains jours" },
];

/** Nombre de filtres actifs dans le panneau « Filtres » (le sport a ses propres pastilles). */
export function countActiveFilters(filters: ExploreFilters) {
  return [
    filters.maxDistanceKm !== null,
    filters.when !== "all",
    filters.level !== null,
    filters.onlyAvailable,
    filters.onlyFree,
    filters.audience !== "any",
  ].filter(Boolean).length;
}

function startOfDay(date: Date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

/** Vrai si la date correspond au créneau demandé (calculé en heure locale). */
function matchesWhen(date: Date, when: WhenFilter, now: Date) {
  if (when === "all") return true;
  const day = startOfDay(date).getTime();
  const today = startOfDay(now);
  const dayMs = 24 * 60 * 60 * 1000;

  switch (when) {
    case "today":
      return day === today.getTime();
    case "tomorrow":
      return day === today.getTime() + dayMs;
    case "week":
      return day < today.getTime() + 7 * dayMs;
    case "weekend": {
      // Samedi et dimanche à venir (ou en cours si on est déjà le week-end).
      const weekday = today.getDay(); // 0 = dimanche
      const daysToSaturday = weekday === 0 ? -1 : 6 - weekday;
      const saturday = today.getTime() + daysToSaturday * dayMs;
      return day >= saturday && day <= saturday + dayMs;
    }
  }
}

/** Préférences du membre (parcours d'accueil / profil) servant à personnaliser l'exploration. */
export interface ExplorePreferences {
  favoriteSports: SportType[];
  sportLevel: SportLevel;
  /** Genre déclaré (jamais affiché) : séances entre femmes / entre hommes. */
  gender: Gender | null;
  /** Ville choisie : position de repli si la géolocalisation n'est pas partagée. */
  home: { city: string | null; position: [number, number] } | null;
}

/** Nombre de séances mises en avant dans « Pour toi ». */
const RECOMMENDED_COUNT = 4;
/** Au-delà, une séance n'est pas recommandée (si la distance est connue). */
const RECOMMENDED_MAX_KM = 20;

/**
 * Séances « Pour toi » : ouvertes, dans un sport favori, accessibles au niveau du membre
 * et à moins de 20 km, les plus proches dans le temps d'abord. Exclut ses propres activités.
 */
export function pickRecommended(items: ExploreItem[], preferences: ExplorePreferences, currentUserId: string) {
  if (preferences.favoriteSports.length === 0) return [];
  return items
    .filter(
      ({ activity, distanceKm: distance }) =>
        activity.status === "open" &&
        activity.creatorId !== currentUserId &&
        preferences.favoriteSports.includes(activity.sportType) &&
        canJoinAudience(activity.audience, preferences.gender) &&
        (activity.requiredLevel === null || activity.requiredLevel === preferences.sportLevel) &&
        (distance === null || distance <= RECOMMENDED_MAX_KM),
    )
    .sort((a, b) => a.activity.startsAt.getTime() - b.activity.startsAt.getTime())
    .slice(0, RECOMMENDED_COUNT);
}

/** Vrai si aucun filtre n'est actif (la section « Pour toi » n'a de sens que sur la liste complète). */
export function isDefaultFilters(filters: ExploreFilters) {
  return JSON.stringify(filters) === JSON.stringify(DEFAULT_FILTERS);
}

export interface ExploreItem {
  activity: ExploreActivity;
  /** Distance depuis l'utilisateur, si sa position est connue. */
  distanceKm: number | null;
}

/** Applique filtres et tri ; calcule la distance de chaque activité. */
export function applyFilters(
  activities: ExploreActivity[],
  filters: ExploreFilters,
  userPosition: [number, number] | null,
  now = new Date(),
): ExploreItem[] {
  const items = activities
    .map((activity) => ({
      activity,
      distanceKm: userPosition ? distanceKm(userPosition, [activity.lat, activity.lng]) : null,
    }))
    .filter(({ activity, distanceKm: distance }) => {
      if (filters.sport && activity.sportType !== filters.sport) return false;
      if (filters.onlyAvailable && activity.status !== "open") return false;
      if (filters.onlyFree && activity.priceCents > 0) return false;
      if (filters.audience === "mixed" && activity.audience !== "all") return false;
      if ((filters.audience === "women" || filters.audience === "men") && activity.audience !== filters.audience) return false;
      if (filters.level && activity.requiredLevel && activity.requiredLevel !== filters.level) return false;
      if (filters.maxDistanceKm !== null && distance !== null && distance > filters.maxDistanceKm) return false;
      return matchesWhen(activity.startsAt, filters.when, now);
    });

  if (filters.sort === "distance" && userPosition) {
    return items.sort((a, b) => (a.distanceKm ?? 0) - (b.distanceKm ?? 0));
  }
  return items.sort((a, b) => a.activity.startsAt.getTime() - b.activity.startsAt.getTime());
}
