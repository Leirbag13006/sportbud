import "server-only";

import { and, asc, eq, gt, ne, sql } from "drizzle-orm";

import { db } from "@/db";
import { activities } from "@/db/schema";
import type { ActivityWithCreator } from "./types";

/** Colonnes publiques du créateur affichées avec une activité. */
const creatorColumns = { id: true, fullName: true, sportLevel: true, avatarUrl: true } as const;

/**
 * Activités à afficher sur la carte : non annulées, à venir ou en cours.
 * Les activités complètes restent visibles (marqueur grisé).
 */
export async function getMapActivities(): Promise<ActivityWithCreator[]> {
  const now = Date.now();

  return db.query.activities.findMany({
    columns: { createdAt: false, updatedAt: false },
    with: { creator: { columns: creatorColumns } },
    where: and(
      ne(activities.status, "cancelled"),
      // Fin de l'activité (début + durée) encore dans le futur.
      sql`${activities.startsAt} + ${activities.durationMinutes} * 60000 > ${now}`,
    ),
    orderBy: asc(activities.startsAt),
    limit: 300,
  });
}

/** Nombre d'activités à venir créées par un utilisateur (limite anti-abus). */
export async function countUpcomingActivitiesByCreator(creatorId: string) {
  const [row] = await db
    .select({ count: sql<number>`count(*)` })
    .from(activities)
    .where(
      and(
        eq(activities.creatorId, creatorId),
        ne(activities.status, "cancelled"),
        gt(activities.startsAt, new Date()),
      ),
    );
  return row?.count ?? 0;
}

/** Activités à venir ou en cours organisées par l'utilisateur (tableau de bord du profil). */
export async function getMyOrganizedActivities(creatorId: string): Promise<ActivityWithCreator[]> {
  return db.query.activities.findMany({
    columns: { createdAt: false, updatedAt: false },
    with: { creator: { columns: creatorColumns } },
    where: and(
      eq(activities.creatorId, creatorId),
      ne(activities.status, "cancelled"),
      sql`${activities.startsAt} + ${activities.durationMinutes} * 60000 > ${Date.now()}`,
    ),
    orderBy: asc(activities.startsAt),
  });
}
