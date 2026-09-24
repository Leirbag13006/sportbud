import type { Activity, PublicUser } from "@/db/schema";

/** Créateur tel qu'affiché publiquement sur une activité. */
export type ActivityCreator = Pick<PublicUser, "id" | "fullName" | "sportLevel" | "avatarUrl">;

/** Activité enrichie de son créateur, telle qu'affichée sur la carte. */
export type ActivityWithCreator = Omit<Activity, "createdAt" | "updatedAt"> & {
  creator: ActivityCreator;
};

/** Participant accepté, affiché en avatar sur les cartes d'activité. */
export type ActivityParticipant = Pick<PublicUser, "id" | "fullName" | "avatarUrl">;

/** Activité de l'écran Explorer : créateur + participants acceptés. */
export type ExploreActivity = ActivityWithCreator & { participants: ActivityParticipant[] };
