import type { SportType } from "@/db/schema";

export interface SportOption {
  value: SportType;
  label: string;
  /** Pictogramme affiché dans les marqueurs et les listes. */
  emoji: string;
}

/** Sports proposés, dans l'ordre d'affichage des listes. */
export const SPORTS: SportOption[] = [
  { value: "football", label: "Football", emoji: "⚽" },
  { value: "basketball", label: "Basket", emoji: "🏀" },
  { value: "tennis", label: "Tennis", emoji: "🎾" },
  { value: "padel", label: "Padel", emoji: "🏓" },
  { value: "badminton", label: "Badminton", emoji: "🏸" },
  { value: "volleyball", label: "Volley", emoji: "🏐" },
  { value: "running", label: "Running", emoji: "🏃" },
  { value: "cycling", label: "Vélo", emoji: "🚴" },
  { value: "swimming", label: "Natation", emoji: "🏊" },
  { value: "climbing", label: "Escalade", emoji: "🧗" },
  { value: "fitness", label: "Fitness", emoji: "🏋️" },
  { value: "other", label: "Autre", emoji: "🏅" },
];

const SPORTS_BY_VALUE = new Map(SPORTS.map((sport) => [sport.value, sport]));

export function getSport(value: SportType): SportOption {
  return SPORTS_BY_VALUE.get(value) ?? SPORTS[SPORTS.length - 1]!;
}
