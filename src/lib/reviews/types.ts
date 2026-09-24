import type { PublicUser, Review, SportType } from "@/db/schema";

/** Réputation d'un membre : moyenne des notes reçues (null si aucun avis) et nombre d'avis. */
export interface RatingSummary {
  average: number | null;
  count: number;
}

/** Rôle d'un membre dans une séance. */
export type ActivityRole = "organizer" | "participant";

/** Avis reçu, tel qu'affiché sur un profil. */
export type ReviewItem = Pick<Review, "id" | "rating" | "comment" | "createdAt"> & {
  reviewer: Pick<PublicUser, "id" | "fullName" | "avatarUrl">;
  sportType: SportType;
  /** Rôle du membre noté dans la séance (« en tant qu'organisateur / participant »). */
  revieweeRole: ActivityRole;
};

/** Membre à noter après une séance, avec l'avis déjà laissé par l'utilisateur s'il existe. */
export interface ParticipantToReview {
  user: Pick<PublicUser, "id" | "fullName" | "avatarUrl" | "sportLevel">;
  review: Pick<Review, "rating" | "comment"> | null;
}

/**
 * Séance terminée à laquelle l'utilisateur a pris part :
 * - organisateur (`role: "organizer"`) : il note chacun de ses participants ;
 * - participant (`role: "participant"`) : il note l'organisateur (seul membre de `participants`).
 */
export interface ActivityToReview {
  id: string;
  sportType: SportType;
  startsAt: Date;
  role: ActivityRole;
  participants: ParticipantToReview[];
}

export const NO_RATING: RatingSummary = { average: null, count: 0 };
