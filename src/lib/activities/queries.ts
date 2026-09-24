import "server-only";

import { and, asc, eq, gt, ne, sql } from "drizzle-orm";

import { db } from "@/db";
import { activities, applications } from "@/db/schema";
import { getEarnedBadges } from "@/lib/achievements/queries";
import { getRatingSummaries } from "@/lib/reviews/queries";
import { NO_RATING } from "@/lib/reviews/types";
import type { ActivityWithCreator, ExploreActivity } from "./types";

/** Colonnes publiques du créateur affichées avec une activité. */
const creatorColumns = { id: true, fullName: true, sportLevel: true, avatarUrl: true } as const;

/**
 * Activités de l'écran Explorer (liste et carte) : non annulées, à venir ou en cours,
 * avec leurs participants acceptés. Les activités complètes restent visibles (grisées).
 */
export async function getExploreActivities(): Promise<ExploreActivity[]> {
  const now = Date.now();

  const rows = await db.query.activities.findMany({
    columns: { createdAt: false, updatedAt: false },
    with: {
      creator: { columns: creatorColumns },
      applications: {
        columns: {},
        where: eq(applications.status, "accepted"),
        with: { applicant: { columns: { id: true, fullName: true, avatarUrl: true } } },
      },
    },
    where: and(
      ne(activities.status, "cancelled"),
      // Fin de l'activité (début + durée) encore dans le futur.
      sql`${activities.startsAt} + ${activities.durationMinutes} * 60000 > ${now}`,
    ),
    orderBy: asc(activities.startsAt),
    limit: 300,
  });

  const creatorIds = rows.map((row) => row.creatorId);
  const [ratings, badges] = await Promise.all([getRatingSummaries(creatorIds), getEarnedBadges(creatorIds, 2)]);

  return rows.map(({ applications: accepted, ...activity }) => ({
    ...activity,
    participants: accepted.map(({ applicant }) => applicant),
    creatorRating: ratings[activity.creatorId] ?? NO_RATING,
    creatorBadges: badges[activity.creatorId] ?? [],
  }));
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
