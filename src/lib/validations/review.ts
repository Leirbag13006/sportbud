import { z } from "zod";

/** Avis laissé par un organisateur sur un participant. */
export const reviewSchema = z
  .object({
    activityId: z.string().min(1),
    revieweeId: z.string().min(1),
    rating: z.coerce.number().int().min(1, "Choisis une note.").max(5),
    comment: z
      .string()
      .trim()
      .max(500, "500 caractères maximum.")
      .transform((value) => value || null),
  })
  // Une note sévère doit être expliquée (ex. « Ne s'est pas présenté »).
  .refine((review) => review.rating > 2 || (review.comment?.length ?? 0) >= 3, {
    path: ["comment"],
    message: "Explique brièvement ta note (ex. « Ne s'est pas présenté »).",
  });

export type ReviewInput = z.infer<typeof reviewSchema>;
