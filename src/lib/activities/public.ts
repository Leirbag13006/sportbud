import "server-only";

import { and, asc, count, eq, gt, inArray, ne, type SQL } from "drizzle-orm";
import { cache } from "react";

import { db } from "@/db";
import { activities, applications, type SportType } from "@/db/schema";
import { getRatingSummaries } from "@/lib/reviews/queries";
import { NO_RATING } from "@/lib/reviews/types";
import type { PublicActivity } from "./types";

/**
 * Séances visibles sans compte (liste publique, page partageable, landing).
 * Seules des informations non sensibles sortent d'ici : la ville au lieu de l'adresse et du lieu
 * exact, le nombre de participants au lieu de leur identité, pas de description (texte libre de
 * l'organisateur, qui peut contenir un lieu de rendez-vous précis).
 */

const columns = {
  id: true,
  sportType: true,
  startsAt: true,
  durationMinutes: true,
  requiredLevel: true,
  spotsTotal: true,
  spotsAvailable: true,
  status: true,
  priceCents: true,
  equipmentRequired: true,
  audience: true,
  address: true,
  creatorId: true,
} as const;

const creatorColumns = { username: true, avatarUrl: true } as const;

type Row = Awaited<ReturnType<typeof findRows>>[number];

function findRows(where: SQL | undefined, limit: number) {
  return db.query.activities.findMany({
    columns,
    with: { creator: { columns: creatorColumns } },
    where,
    orderBy: asc(activities.startsAt),
    limit,
  });
}

/** Ville d'une adresse « …, 13100 Aix-en-Provence » (format de la Géoplateforme) ; null sinon. */
export function getApproximateArea(address: string | null) {
  const match = address?.match(/\b\d{5}\s+([^,\d][^,]*)$/);
  return match ? match[1]!.trim() : null;
}

async function toPublicActivities(rows: Row[]): Promise<PublicActivity[]> {
  if (rows.length === 0) return [];
  const ids = rows.map((row) => row.id);
  const [participantCounts, ratings] = await Promise.all([
    db
      .select({ activityId: applications.activityId, value: count() })
      .from(applications)
      .where(and(inArray(applications.activityId, ids), eq(applications.status, "accepted")))
      .groupBy(applications.activityId),
    getRatingSummaries(rows.map((row) => row.creatorId)),
  ]);
  const countByActivity = new Map(participantCounts.map((row) => [row.activityId, row.value]));
  const now = Date.now();

  return rows.map(({ address, creatorId, ...activity }) => ({
    ...activity,
    area: getApproximateArea(address),
    creatorRating: ratings[creatorId] ?? NO_RATING,
    participantCount: countByActivity.get(activity.id) ?? 0,
    ended: activity.startsAt.getTime() + activity.durationMinutes * 60_000 <= now,
  }));
}

/** Séances à venir (pas encore commencées, non annulées), les plus proches dans le temps d'abord. */
export async function getPublicActivities({ sport, limit = 60 }: { sport?: SportType; limit?: number } = {}) {
  const rows = await findRows(
    and(
      ne(activities.status, "cancelled"),
      gt(activities.startsAt, new Date()),
      sport ? eq(activities.sportType, sport) : undefined,
    ),
    limit,
  );
  return toPublicActivities(rows);
}

/**
 * Une séance, quel que soit son état (la page indique si elle est terminée, complète ou annulée).
 * Mise en cache le temps d'une requête : page, métadonnées et image de partage la demandent.
 */
export const getPublicActivity = cache(async (id: string) => {
  const [activity] = await toPublicActivities(await findRows(eq(activities.id, id), 1));
  return activity ?? null;
});
