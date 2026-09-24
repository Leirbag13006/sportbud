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

/** Colonnes communes des avis affichés sur un profil. */
const REVIEW_ITEM_QUERY = {
  columns: { id: true, rating: true, comment: true, createdAt: true, revieweeId: true },
  with: {
    reviewer: { columns: { id: true, username: true, avatarUrl: true } },
    activity: { columns: { sportType: true, creatorId: true } },
  },
} as const;

type ReviewRow = {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: Date;
  revieweeId: string;
  reviewer: ReviewItem["reviewer"];
  activity: { sportType: ReviewItem["sportType"]; creatorId: string };
};

function toReviewItem({ activity, revieweeId, ...review }: ReviewRow): ReviewItem {
  return {
    ...review,
    sportType: activity.sportType,
    revieweeRole: activity.creatorId === revieweeId ? "organizer" : "participant",
  };
}

/** Derniers avis reçus par un membre (en tant qu'organisateur ou participant). */
export async function getUserReviews(userId: string, limit = 10): Promise<ReviewItem[]> {
  const rows = await db.query.reviews.findMany({
    ...REVIEW_ITEM_QUERY,
    where: eq(reviews.revieweeId, userId),
    orderBy: [desc(reviews.createdAt)],
    limit,
  });
  return rows.map(toReviewItem);
}

/** Derniers avis de plusieurs membres (fiches candidats), indexés par membre. */
export async function getRecentReviewsByUser(userIds: string[], perUser = 3): Promise<Record<string, ReviewItem[]>> {
  if (userIds.length === 0) return {};
  const rows = await db.query.reviews.findMany({
    ...REVIEW_ITEM_QUERY,
    where: inArray(reviews.revieweeId, [...new Set(userIds)]),
    orderBy: [desc(reviews.createdAt)],
  });

  const byUser: Record<string, ReviewItem[]> = {};
  for (const row of rows) {
    const list = (byUser[row.revieweeId] ??= []);
    if (list.length < perUser) list.push(toReviewItem(row));
  }
  return byUser;
}

/**
 * Séances terminées (30 derniers jours) à noter :
 * celles que l'utilisateur a organisées (il note ses participants) et celles
 * auxquelles il a participé (il note l'organisateur). Les plus récentes d'abord.
 */
export async function getActivitiesToReview(userId: string): Promise<ActivityToReview[]> {
  const [organized, joined] = await Promise.all([
    db.query.activities.findMany({
      columns: { id: true, sportType: true, startsAt: true },
      with: {
        applications: {
          columns: {},
          where: eq(applications.status, "accepted"),
          with: { applicant: { columns: { id: true, username: true, avatarUrl: true, sportLevel: true } } },
        },
        reviews: { columns: { revieweeId: true, rating: true, comment: true }, where: eq(reviews.reviewerId, userId) },
      },
      where: and(eq(activities.creatorId, userId), ne(activities.status, "cancelled"), activityEnded(), withinReviewWindow()),
    }),
    db.query.activities.findMany({
      columns: { id: true, sportType: true, startsAt: true },
      with: {
        creator: { columns: { id: true, username: true, avatarUrl: true, sportLevel: true } },
        reviews: { columns: { revieweeId: true, rating: true, comment: true }, where: eq(reviews.reviewerId, userId) },
      },
      where: and(
        ne(activities.status, "cancelled"),
        activityEnded(),
        withinReviewWindow(),
        inArray(
          activities.id,
          db
            .select({ id: applications.activityId })
            .from(applications)
            .where(and(eq(applications.applicantId, userId), eq(applications.status, "accepted"))),
        ),
      ),
    }),
  ]);

  const findReview = (written: { revieweeId: string; rating: number; comment: string | null }[], revieweeId: string) => {
    const review = written.find((item) => item.revieweeId === revieweeId);
    return review ? { rating: review.rating, comment: review.comment } : null;
  };

  const asOrganizer: ActivityToReview[] = organized
    .filter((activity) => activity.applications.length > 0)
    .map(({ applications: accepted, reviews: written, ...activity }) => ({
      ...activity,
      role: "organizer",
      participants: accepted.map(({ applicant }) => ({ user: applicant, review: findReview(written, applicant.id) })),
    }));

  const asParticipant: ActivityToReview[] = joined.map(({ creator, reviews: written, ...activity }) => ({
    ...activity,
    role: "participant",
    participants: [{ user: creator, review: findReview(written, creator.id) }],
  }));

  return [...asOrganizer, ...asParticipant].sort((a, b) => b.startsAt.getTime() - a.startsAt.getTime());
}

/** Nombre d'avis encore à écrire (badge « Activités ») : participants à noter + organisateurs à noter. */
export async function countReviewsToWrite(userId: string) {
  const [[asOrganizer], [asParticipant]] = await Promise.all([
    db
      .select({ value: count() })
      .from(applications)
      .innerJoin(activities, eq(applications.activityId, activities.id))
      .leftJoin(
        reviews,
        and(
          eq(reviews.activityId, applications.activityId),
          eq(reviews.reviewerId, userId),
          eq(reviews.revieweeId, applications.applicantId),
        ),
      )
      .where(
        and(
          eq(activities.creatorId, userId),
          eq(applications.status, "accepted"),
          ne(activities.status, "cancelled"),
          activityEnded(),
          withinReviewWindow(),
          sql`${reviews.id} is null`,
        ),
      ),
    db
      .select({ value: count() })
      .from(applications)
      .innerJoin(activities, eq(applications.activityId, activities.id))
      .leftJoin(
        reviews,
        and(
          eq(reviews.activityId, applications.activityId),
          eq(reviews.reviewerId, userId),
          eq(reviews.revieweeId, activities.creatorId),
        ),
      )
      .where(
        and(
          eq(applications.applicantId, userId),
          eq(applications.status, "accepted"),
          ne(activities.status, "cancelled"),
          activityEnded(),
          withinReviewWindow(),
          sql`${reviews.id} is null`,
        ),
      ),
  ]);
  return (asOrganizer?.value ?? 0) + (asParticipant?.value ?? 0);
}
