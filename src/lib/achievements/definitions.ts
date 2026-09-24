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

/** Paliers : 1 = bronze, 2 = argent, 3 = or. */
export type Tier = 1 | 2 | 3;

export const TIERS: Record<Tier, { label: string; emoji: EmojiName }> = {
  1: { label: "Bronze", emoji: "medal-bronze" },
  2: { label: "Argent", emoji: "medal-silver" },
  3: { label: "Or", emoji: "medal-gold" },
};

export interface AchievementDefinition {
  id: string;
  title: string;
  emoji: EmojiName;
  /** Objectifs croissants de chaque palier (1 seul objectif = succès sans palier). */
  goals: number[];
  /** Objectif à atteindre, en toutes lettres. */
  describe: (goal: number) => string;
  /** Valeur mesurée pour ce succès. */
  metric: (stats: MemberStats) => number;
}

/** Succès à débloquer (gamification) : encouragent à jouer, organiser, être fiable. */
export const ACHIEVEMENTS: AchievementDefinition[] = [
  {
    id: "joueur",
    title: "Joueur·se",
    emoji: "shoe",
    goals: [1, 10, 25],
    describe: (goal) => (goal === 1 ? "Participe à ta première séance." : `Participe à ${goal} séances.`),
    metric: (s) => s.sessionsPlayed,
  },
  {
    id: "organisateur",
    title: "Organisateur",
    emoji: "calendar",
    goals: [1, 5, 15],
    describe: (goal) =>
      goal === 1 ? "Organise une séance avec au moins un participant." : `Organise ${goal} séances avec des participants.`,
    metric: (s) => s.sessionsOrganized,
  },
  {
    id: "touche-a-tout",
    title: "Touche-à-tout",
    emoji: "compass",
    goals: [2, 3, 5],
    describe: (goal) => `Pratique ${goal} sports différents.`,
    metric: (s) => s.distinctSports,
  },
  {
    id: "sociable",
    title: "Sociable",
    emoji: "people",
    goals: [3, 10, 25],
    describe: (goal) => `Rencontre ${goal} partenaires différents.`,
    metric: (s) => s.distinctPartners,
  },
  {
    id: "fiable",
    title: "Fiable",
    emoji: "star",
    goals: [3, 10, 25],
    describe: (goal) => `Garde une moyenne d'au moins 4,5 sur ${goal} avis.`,
    metric: (s) => ((s.ratingAverage ?? 0) >= 4.5 ? s.ratingCount : 0),
  },
  {
    id: "en-feu",
    title: "En feu",
    emoji: "fire",
    goals: [2, 3, 5],
    describe: (goal) => `Enchaîne ${goal} séances en 7 jours.`,
    metric: (s) => s.bestWeek,
  },
  {
    id: "profil-complet",
    title: "Profil au top",
    emoji: "camera",
    goals: [1],
    describe: () => "Ajoute une photo, une bio et tes sports favoris.",
    metric: (s) => (s.profileComplete ? 1 : 0),
  },
];

const ACHIEVEMENTS_BY_ID = new Map(ACHIEVEMENTS.map((achievement) => [achievement.id, achievement]));

export function getAchievementDefinition(id: string) {
  return ACHIEVEMENTS_BY_ID.get(id);
}

/** Succès sans paliers (un seul objectif) : affiché comme simplement « débloqué ». */
export function hasTiers(definition: Pick<AchievementDefinition, "goals">) {
  return definition.goals.length > 1;
}

export interface AchievementState {
  id: string;
  title: string;
  emoji: EmojiName;
  /** Palier atteint (0 = pas encore débloqué). */
  tier: number;
  maxTier: number;
  /** Valeur actuelle et objectif du palier suivant (null si tout est débloqué). */
  value: number;
  nextGoal: number | null;
  /** Description de l'objectif en cours (ou du dernier palier atteint). */
  description: string;
  unlocked: boolean;
}

export function evaluateAchievements(stats: MemberStats): AchievementState[] {
  return ACHIEVEMENTS.map((definition) => {
    const value = definition.metric(stats);
    const tier = definition.goals.filter((goal) => value >= goal).length;
    const nextGoal = definition.goals[tier] ?? null;
    return {
      id: definition.id,
      title: definition.title,
      emoji: definition.emoji,
      tier,
      maxTier: definition.goals.length,
      value,
      nextGoal,
      description: definition.describe(nextGoal ?? definition.goals[definition.goals.length - 1]!),
      unlocked: tier > 0,
    };
  });
}

/** Badge affiché sur une fiche ou une carte : succès et palier atteint. */
export interface EarnedBadge {
  id: string;
  title: string;
  emoji: EmojiName;
  tier: number;
  /** Libellé du palier (« Or ») ou null pour un succès sans palier. */
  tierLabel: string | null;
}

export function toEarnedBadge(achievementId: string, tier: number): EarnedBadge | null {
  const definition = getAchievementDefinition(achievementId);
  if (!definition) return null;
  return {
    id: definition.id,
    title: definition.title,
    emoji: definition.emoji,
    tier,
    tierLabel: hasTiers(definition) ? TIERS[tier as Tier].label : null,
  };
}
