import "server-only";

import { and, avg, count, desc, eq, gt, inArray, ne, sql } from "drizzle-orm";

import { db } from "@/db";
import { activities, applications, reviews } from "@/db/schema";
import { NO_RATING, type ActivityToReview, type RatingSummary, type ReviewItem } from "./types";

/** Délai pendant lequel une séance terminée peut encore être notée. */
const REVIEW_WINDOW_DAYS = 30;

/** Condition SQL : la séance est terminée (début + durée dans le passé). */
const activityEnded = () => sql`${activities.startsAt} + ${activities.durationMinutes} * 60000 <= ${Date.now()}`;
const withinReviewWindow = () => gt(activities.startsAt, new Date(Date.now() - REVIEW_WINDOW_DAYS * 24 * 3600 * 1000));

/** Réputation (moyenne, nombre d'avis) de plusieurs membres. */
export async function getRatingSummaries(userIds: string[]): Promise<Record<string, RatingSummary>> {
  if (userIds.length === 0) return {};
  const rows = await db
    .select({ userId: reviews.revieweeId, average: avg(reviews.rating), total: count() })
    .from(reviews)
    .where(inArray(reviews.revieweeId, [...new Set(userIds)]))
    .groupBy(reviews.revieweeId);

  return Object.fromEntries(
    rows.map((row) => [row.userId, { average: row.average === null ? null : Number(row.average), count: row.total }]),
  );
}

export async function getRatingSummary(userId: string): Promise<RatingSummary> {
  return (await getRatingSummaries([userId]))[userId] ?? NO_RATING;
}

/** Derniers avis reçus par un membre. */
export async function getUserReviews(userId: string, limit = 10): Promise<ReviewItem[]> {
  const rows = await db.query.reviews.findMany({
    columns: { id: true, rating: true, comment: true, createdAt: true },
    with: {
      reviewer: { columns: { id: true, fullName: true, avatarUrl: true } },
      activity: { columns: { sportType: true } },
    },
    where: eq(reviews.revieweeId, userId),
    orderBy: [desc(reviews.createdAt)],
    limit,
  });
  return rows.map(({ activity, ...review }) => ({ ...review, sportType: activity.sportType }));
}

/** Derniers avis de plusieurs membres (fiches candidats), indexés par membre. */
export async function getRecentReviewsByUser(userIds: string[], perUser = 3): Promise<Record<string, ReviewItem[]>> {
  if (userIds.length === 0) return {};
  const rows = await db.query.reviews.findMany({
    columns: { id: true, rating: true, comment: true, createdAt: true, revieweeId: true },
    with: {
      reviewer: { columns: { id: true, fullName: true, avatarUrl: true } },
      activity: { columns: { sportType: true } },
    },
    where: inArray(reviews.revieweeId, [...new Set(userIds)]),
    orderBy: [desc(reviews.createdAt)],
  });

  const byUser: Record<string, ReviewItem[]> = {};
  for (const { revieweeId, activity, ...review } of rows) {
    const list = (byUser[revieweeId] ??= []);
    if (list.length < perUser) list.push({ ...review, sportType: activity.sportType });
  }
  return byUser;
}

/** Séances terminées (30 derniers jours) organisées par l'utilisateur, avec leurs participants et avis. */
export async function getActivitiesToReview(organizerId: string): Promise<ActivityToReview[]> {
  const rows = await db.query.activities.findMany({
    columns: { id: true, sportType: true, startsAt: true },
    with: {
      applications: {
        columns: {},
        where: eq(applications.status, "accepted"),
        with: { applicant: { columns: { id: true, fullName: true, avatarUrl: true, sportLevel: true } } },
      },
      reviews: { columns: { revieweeId: true, rating: true, comment: true } },
    },
    where: and(
      eq(activities.creatorId, organizerId),
      ne(activities.status, "cancelled"),
      activityEnded(),
      withinReviewWindow(),
    ),
    orderBy: [desc(activities.startsAt)],
  });

  return rows
    .filter((activity) => activity.applications.length > 0)
    .map(({ applications: accepted, reviews: written, ...activity }) => ({
      ...activity,
      participants: accepted.map(({ applicant }) => {
        const review = written.find((item) => item.revieweeId === applicant.id);
        return { user: applicant, review: review ? { rating: review.rating, comment: review.comment } : null };
      }),
    }));
}

/** Nombre de participants encore à noter (badge « Activités »). */
export async function countReviewsToWrite(organizerId: string) {
  const [row] = await db
    .select({ value: count() })
    .from(applications)
    .innerJoin(activities, eq(applications.activityId, activities.id))
    .leftJoin(
      reviews,
      and(eq(reviews.activityId, applications.activityId), eq(reviews.revieweeId, applications.applicantId)),
    )
    .where(
      and(
        eq(activities.creatorId, organizerId),
        eq(applications.status, "accepted"),
        ne(activities.status, "cancelled"),
        activityEnded(),
        withinReviewWindow(),
        sql`${reviews.id} is null`,
      ),
    );
  return row?.value ?? 0;
}
