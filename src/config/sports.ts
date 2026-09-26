import type { SportType } from "@/db/schema";
import { pluralize } from "@/lib/format";

/** Famille de sport : sert à formuler le titre d'une annonce. */
type SportKind = "team" | "racket" | "solo";

export interface SportOption {
  value: SportType;
  label: string;
  /** Photo d'illustration (CC0, voir public/sports/CREDITS.md). */
  image: string;
  kind: SportKind;
}

/** Sports proposés, dans l'ordre d'affichage des listes. */
export const SPORTS: SportOption[] = [
  { value: "football", label: "Football", image: "/sports/football.jpg", kind: "team" },
  { value: "basketball", label: "Basket", image: "/sports/basketball.jpg", kind: "team" },
  { value: "tennis", label: "Tennis", image: "/sports/tennis.jpg", kind: "racket" },
  { value: "padel", label: "Padel", image: "/sports/padel.jpg", kind: "racket" },
  { value: "badminton", label: "Badminton", image: "/sports/badminton.jpg", kind: "racket" },
  { value: "volleyball", label: "Volley", image: "/sports/volleyball.jpg", kind: "team" },
  { value: "handball", label: "Handball", image: "/sports/handball.jpg", kind: "team" },
  { value: "rugby", label: "Rugby", image: "/sports/rugby.jpg", kind: "team" },
  { value: "table_tennis", label: "Ping-pong", image: "/sports/table_tennis.jpg", kind: "racket" },
  { value: "petanque", label: "Pétanque", image: "/sports/petanque.jpg", kind: "team" },
  { value: "running", label: "Running", image: "/sports/running.jpg", kind: "solo" },
  { value: "cycling", label: "Vélo", image: "/sports/cycling.jpg", kind: "solo" },
  { value: "swimming", label: "Natation", image: "/sports/swimming.jpg", kind: "solo" },
  { value: "climbing", label: "Escalade", image: "/sports/climbing.jpg", kind: "solo" },
  { value: "hiking", label: "Randonnée", image: "/sports/hiking.jpg", kind: "solo" },
  { value: "fitness", label: "Fitness", image: "/sports/fitness.jpg", kind: "solo" },
  { value: "yoga", label: "Yoga", image: "/sports/yoga.jpg", kind: "solo" },
  { value: "other", label: "Autre", image: "/sports/other.jpg", kind: "solo" },
];

/** Nombre de sports proposés (hors « Autre »), affiché sur la landing. */
export const SPORT_COUNT = SPORTS.filter((sport) => sport.value !== "other").length;

const SPORTS_BY_VALUE = new Map(SPORTS.map((sport) => [sport.value, sport]));

export function getSport(value: SportType): SportOption {
  return SPORTS_BY_VALUE.get(value) ?? SPORTS[SPORTS.length - 1]!;
}

/**
 * Titre d'annonce lisible selon le sport et le nombre de personnes recherchées :
 * « Recherche 2 joueurs », « Partenaire de tennis », « Sortie running »…
 */
export function getActivityTitle(sportType: SportType, spots: number) {
  const sport = getSport(sportType);
  switch (sport.kind) {
    case "team":
      return `Recherche ${pluralize(spots, "joueur")}`;
    case "racket":
      return spots === 1 ? `Partenaire de ${sport.label.toLowerCase()}` : `${sport.label} : recherche ${spots} joueurs`;
    default:
      if (sportType === "other") return spots === 1 ? "Recherche un partenaire" : `Recherche ${spots} partenaires`;
      if (sportType === "fitness" || sportType === "yoga") return `Séance de ${sport.label.toLowerCase()}`;
      return `Sortie ${sport.label.toLowerCase()}`;
  }
}
