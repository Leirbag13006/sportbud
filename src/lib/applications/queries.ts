import "server-only";

import { and, asc, count, desc, eq, inArray, ne, sql } from "drizzle-orm";

import { db } from "@/db";
import { activities, applications } from "@/db/schema";
import { getEarnedBadges } from "@/lib/achievements/queries";
import { getRatingSummaries, getRecentReviewsByUser } from "@/lib/reviews/queries";
import { NO_RATING } from "@/lib/reviews/types";
import type { MyApplicationSummary, ReceivedApplication, SentApplication } from "./types";

const applicantColumns = {
  id: true,
  username: true,
  sportLevel: true,
  avatarUrl: true,
  bio: true,
  createdAt: true,
  favoriteSports: true,
} as const;

const creatorColumns = { id: true, username: true, sportLevel: true, avatarUrl: true } as const;

/** Condition SQL : l'activité n'est pas terminée (début + durée dans le futur). */
const activityNotEnded = () =>
  sql`${activities.startsAt} + ${activities.durationMinutes} * 60000 > ${Date.now()}`;

/** Identifiants des activités à venir ou en cours créées par l'utilisateur. */
function myActiveActivityIds(userId: string) {
  return db
    .select({ id: activities.id })
    .from(activities)
    .where(and(eq(activities.creatorId, userId), ne(activities.status, "cancelled"), activityNotEnded()));
}

/** Candidatures de l'utilisateur, indexées par activité (état du bouton « Postuler »). */
export async function getMyApplicationSummaries(userId: string): Promise<Record<string, MyApplicationSummary>> {
  const rows = await db
    .select({ id: applications.id, status: applications.status, activityId: applications.activityId })
    .from(applications)
    .where(eq(applications.applicantId, userId));

  return Object.fromEntries(rows.map(({ activityId, ...summary }) => [activityId, summary]));
}

/** Candidatures reçues sur les activités à venir de l'utilisateur (en attente d'abord). */
export async function getReceivedApplications(userId: string): Promise<ReceivedApplication[]> {
  const rows = await db.query.applications.findMany({
    columns: { id: true, activityId: true, status: true, message: true, createdAt: true },
    with: {
      applicant: { columns: applicantColumns },
      activity: { columns: { id: true, sportType: true, startsAt: true, status: true } },
    },
    where: inArray(applications.activityId, myActiveActivityIds(userId)),
    orderBy: [asc(applications.createdAt)],
  });

  const applicantIds = rows.map((row) => row.applicant.id);
  const [ratings, recentReviews, badges] = await Promise.all([
    getRatingSummaries(applicantIds),
    getRecentReviewsByUser(applicantIds),
    getEarnedBadges(applicantIds),
  ]);

  const order = { pending: 0, accepted: 1, rejected: 2 } as const;
  return rows
    .map((row) => ({
      ...row,
      applicantRating: ratings[row.applicant.id] ?? NO_RATING,
      applicantReviews: recentReviews[row.applicant.id] ?? [],
      applicantBadges: badges[row.applicant.id] ?? [],
    }))
    .sort((a, b) => order[a.status] - order[b.status]);
}

/** Nombre de candidatures en attente de réponse (badge de navigation). */
export async function countPendingReceivedApplications(userId: string) {
  const [row] = await db
    .select({ value: count() })
    .from(applications)
    .where(and(eq(applications.status, "pending"), inArray(applications.activityId, myActiveActivityIds(userId))));
  return row?.value ?? 0;
}

/** Candidatures envoyées par l'utilisateur sur des activités non terminées. */
export async function getSentApplications(userId: string): Promise<SentApplication[]> {
  const rows = await db.query.applications.findMany({
    columns: { id: true, activityId: true, status: true, createdAt: true },
    with: {
      activity: {
        columns: { createdAt: false, updatedAt: false },
        with: { creator: { columns: creatorColumns } },
      },
    },
    where: and(
      eq(applications.applicantId, userId),
      inArray(
        applications.activityId,
        db.select({ id: activities.id }).from(activities).where(activityNotEnded()),
      ),
    ),
    orderBy: [desc(applications.createdAt)],
  });
  return rows;
}
