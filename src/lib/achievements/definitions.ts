import type { EmojiName } from "@/components/brand/sport-icon";

/** Statistiques d'activité d'un membre, calculées à partir des séances terminées. */
export interface MemberStats {
  /** Séances terminées auxquelles le membre a participé (candidature acceptée). */
  sessionsPlayed: number;
  /** Séances terminées organisées avec au moins un participant. */
  sessionsOrganized: number;
  /** Sports différents pratiqués (joués ou organisés). */
  distinctSports: number;
  /** Partenaires différents rencontrés. */
  distinctPartners: number;
  /** Plus grand nombre de séances sur 7 jours glissants. */
  bestWeek: number;
  ratingAverage: number | null;
  ratingCount: number;
  profileComplete: boolean;
}

export interface AchievementDefinition {
  id: string;
  title: string;
  description: string;
  emoji: EmojiName;
  goal: number;
  /** Progression actuelle (plafonnée à `goal` à l'affichage). */
  progress: (stats: MemberStats) => number;
}

/** Succès à débloquer (gamification) : encouragent à jouer, organiser, être fiable. */
export const ACHIEVEMENTS: AchievementDefinition[] = [
  {
    id: "premiers-pas",
    title: "Premier pas",
    description: "Participe à ta première séance.",
    emoji: "party",
    goal: 1,
    progress: (s) => s.sessionsPlayed,
  },
  {
    id: "habitue",
    title: "Habitué·e",
    description: "Participe à 10 séances.",
    emoji: "shoe",
    goal: 10,
    progress: (s) => s.sessionsPlayed,
  },
  {
    id: "organisateur",
    title: "Organisateur",
    description: "Organise une séance avec au moins un participant.",
    emoji: "calendar",
    goal: 1,
    progress: (s) => s.sessionsOrganized,
  },
  {
    id: "meneur",
    title: "Meneur de jeu",
    description: "Organise 10 séances.",
    emoji: "trophy",
    goal: 10,
    progress: (s) => s.sessionsOrganized,
  },
  {
    id: "touche-a-tout",
    title: "Touche-à-tout",
    description: "Pratique 3 sports différents.",
    emoji: "compass",
    goal: 3,
    progress: (s) => s.distinctSports,
  },
  {
    id: "sociable",
    title: "Sociable",
    description: "Rencontre 10 partenaires différents.",
    emoji: "people",
    goal: 10,
    progress: (s) => s.distinctPartners,
  },
  {
    id: "fiable",
    title: "Fiable",
    description: "Obtiens une moyenne d'au moins 4,5 sur 3 avis ou plus.",
    emoji: "star",
    goal: 3,
    progress: (s) => ((s.ratingAverage ?? 0) >= 4.5 ? s.ratingCount : 0),
  },
  {
    id: "en-feu",
    title: "En feu",
    description: "Enchaîne 3 séances en 7 jours.",
    emoji: "fire",
    goal: 3,
    progress: (s) => s.bestWeek,
  },
  {
    id: "profil-complet",
    title: "Profil au top",
    description: "Ajoute une photo, une bio et tes sports favoris.",
    emoji: "camera",
    goal: 1,
    progress: (s) => (s.profileComplete ? 1 : 0),
  },
];

export interface AchievementState {
  id: string;
  title: string;
  description: string;
  emoji: EmojiName;
  goal: number;
  progress: number;
  unlocked: boolean;
}

export function evaluateAchievements(stats: MemberStats): AchievementState[] {
  return ACHIEVEMENTS.map(({ progress, ...definition }) => {
    const value = Math.min(progress(stats), definition.goal);
    return { ...definition, progress: value, unlocked: value >= definition.goal };
  });
}
