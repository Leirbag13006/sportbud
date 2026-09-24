import type { Activity, PublicUser } from "@/db/schema";

/** Créateur tel qu'affiché publiquement sur une activité. */
export type ActivityCreator = Pick<PublicUser, "id" | "fullName" | "sportLevel" | "avatarUrl">;

/** Activité enrichie de son créateur, telle qu'affichée sur la carte. */
export type ActivityWithCreator = Omit<Activity, "createdAt" | "updatedAt"> & {
  creator: ActivityCreator;
};
