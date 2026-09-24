import type { SportLevel, SportType } from "@/db/schema";
import type { ExploreActivity } from "@/lib/activities/types";
import { distanceKm } from "@/lib/geo";

export type WhenFilter = "all" | "today" | "tomorrow" | "weekend" | "week";
export type SortOrder = "date" | "distance";

export interface ExploreFilters {
  /** null = tous les sports. */
  sport: SportType | null;
  /** Rayon maximal en km, null = sans limite (nécessite la position de l'utilisateur). */
  maxDistanceKm: number | null;
  when: WhenFilter;
  /** Activités accessibles à ce niveau (niveau requis identique ou « tous niveaux »). */
  level: SportLevel | null;
  onlyAvailable: boolean;
  sort: SortOrder;
}

export const DEFAULT_FILTERS: ExploreFilters = {
  sport: null,
  maxDistanceKm: null,
  when: "all",
  level: null,
  onlyAvailable: false,
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
      if (filters.level && activity.requiredLevel && activity.requiredLevel !== filters.level) return false;
      if (filters.maxDistanceKm !== null && distance !== null && distance > filters.maxDistanceKm) return false;
      return matchesWhen(activity.startsAt, filters.when, now);
    });

  if (filters.sort === "distance" && userPosition) {
    return items.sort((a, b) => (a.distanceKm ?? 0) - (b.distanceKm ?? 0));
  }
  return items.sort((a, b) => a.activity.startsAt.getTime() - b.activity.startsAt.getTime());
}
