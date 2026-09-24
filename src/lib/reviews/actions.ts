"use server";

import { and, eq, ne, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/db";
import { activities, applications, reviews } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/session";
import { reviewSchema } from "@/lib/validations/review";

export type ReviewActionResult =
  | { ok: true }
  | { ok: false; error?: string; fieldErrors?: Record<string, string[] | undefined> };

/**
 * Avis après une séance terminée, dans les deux sens :
 * l'organisateur note un participant accepté, un participant accepté note l'organisateur.
 * Un seul avis par auteur, membre noté et séance : un nouvel envoi remplace le précédent.
 */
export async function submitReview(input: {
  activityId: string;
  revieweeId: string;
  rating: number;
  comment: string;
}): Promise<ReviewActionResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Ta session a expiré, reconnecte-toi." };

  const parsed = reviewSchema.safeParse(input);
  if (!parsed.success) return { ok: false, fieldErrors: z.flattenError(parsed.error).fieldErrors };
  const { activityId, revieweeId, rating, comment } = parsed.data;

  const [activity] = await db
    .select({ creatorId: activities.creatorId })
    .from(activities)
    .where(
      and(
        eq(activities.id, activityId),
        ne(activities.status, "cancelled"),
        sql`${activities.startsAt} + ${activities.durationMinutes} * 60000 <= ${Date.now()}`,
      ),
    );

  /** Vrai si le membre a été accepté sur la séance. */
  const isAccepted = async (userId: string) => {
    const [row] = await db
      .select({ id: applications.id })
      .from(applications)
      .where(
        and(
          eq(applications.activityId, activityId),
          eq(applications.applicantId, userId),
          eq(applications.status, "accepted"),
        ),
      );
    return Boolean(row);
  };

  const allowed =
    activity !== undefined &&
    revieweeId !== user.id &&
    (activity.creatorId === user.id
      ? await isAccepted(revieweeId) // l'organisateur note un participant
      : revieweeId === activity.creatorId && (await isAccepted(user.id))); // un participant note l'organisateur
  if (!allowed) return { ok: false, error: "Tu ne peux noter que les membres de tes séances terminées." };

  await db
    .insert(reviews)
    .values({ activityId, reviewerId: user.id, revieweeId, rating, comment })
    .onConflictDoUpdate({
      target: [reviews.activityId, reviews.reviewerId, reviews.revieweeId],
      set: { rating, comment, updatedAt: new Date() },
    });

  revalidatePath("/", "layout");
  return { ok: true };
}
