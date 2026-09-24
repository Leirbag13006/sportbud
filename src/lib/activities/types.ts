import type { Activity, PublicUser } from "@/db/schema";
import type { EarnedBadge } from "@/lib/achievements/definitions";
import type { RatingSummary } from "@/lib/reviews/types";

/** Créateur tel qu'affiché publiquement sur une activité. */
export type ActivityCreator = Pick<PublicUser, "id" | "username" | "sportLevel" | "avatarUrl">;

/** Activité enrichie de son créateur, telle qu'affichée sur la carte. */
export type ActivityWithCreator = Omit<Activity, "createdAt" | "updatedAt"> & {
  creator: ActivityCreator;
};

/** Participant accepté, affiché en avatar sur les cartes d'activité. */
export type ActivityParticipant = Pick<PublicUser, "id" | "username" | "avatarUrl">;

/** Activité de l'écran Explorer : créateur (avec sa réputation et ses badges) + participants acceptés. */
export type ExploreActivity = ActivityWithCreator & {
  participants: ActivityParticipant[];
  creatorRating: RatingSummary;
  creatorBadges: EarnedBadge[];
};
