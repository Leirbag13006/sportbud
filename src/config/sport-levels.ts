import type { SportLevel } from "@/db/schema";

export interface SportLevelOption {
  value: SportLevel;
  label: string;
  description: string;
}

/** Niveaux sportifs, dans l'ordre croissant. */
export const SPORT_LEVELS: SportLevelOption[] = [
  { value: "beginner", label: "Débutant", description: "Je découvre ou je reprends" },
  { value: "intermediate", label: "Intermédiaire", description: "Je pratique régulièrement" },
  { value: "pro", label: "Confirmé", description: "Je joue en club ou en compétition" },
];

export function getSportLevelLabel(level: SportLevel) {
  return SPORT_LEVELS.find((option) => option.value === level)?.label ?? level;
}
