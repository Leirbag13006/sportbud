"use server";

import { and, eq, sql } from "drizzle-orm";
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
 * L'organisateur note un participant accepté d'une séance terminée.
 * Un seul avis par participant et par séance : un nouvel envoi remplace le précédent.
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

  // Séance de l'utilisateur, terminée, et participant réellement accepté.
  const [eligible] = await db
    .select({ id: applications.id })
    .from(applications)
    .innerJoin(activities, eq(applications.activityId, activities.id))
    .where(
      and(
        eq(activities.id, activityId),
        eq(activities.creatorId, user.id),
        sql`${activities.startsAt} + ${activities.durationMinutes} * 60000 <= ${Date.now()}`,
        eq(applications.applicantId, revieweeId),
        eq(applications.status, "accepted"),
      ),
    );
  if (!eligible) return { ok: false, error: "Tu ne peux noter que les participants de tes séances terminées." };

  await db
    .insert(reviews)
    .values({ activityId, reviewerId: user.id, revieweeId, rating, comment })
    .onConflictDoUpdate({
      target: [reviews.activityId, reviews.revieweeId],
      set: { rating, comment, updatedAt: new Date() },
    });

  revalidatePath("/", "layout");
  return { ok: true };
}
