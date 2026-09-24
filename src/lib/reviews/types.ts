import type { PublicUser, Review, SportType } from "@/db/schema";

/** Réputation d'un membre : moyenne des notes reçues (null si aucun avis) et nombre d'avis. */
export interface RatingSummary {
  average: number | null;
  count: number;
}

/** Avis reçu, tel qu'affiché sur un profil. */
export type ReviewItem = Pick<Review, "id" | "rating" | "comment" | "createdAt"> & {
  reviewer: Pick<PublicUser, "id" | "fullName" | "avatarUrl">;
  sportType: SportType;
};

/** Participant d'une séance passée, avec l'avis déjà laissé par l'organisateur s'il existe. */
export interface ParticipantToReview {
  user: Pick<PublicUser, "id" | "fullName" | "avatarUrl" | "sportLevel">;
  review: Pick<Review, "rating" | "comment"> | null;
}

/** Séance terminée organisée par l'utilisateur, avec ses participants à noter. */
export interface ActivityToReview {
  id: string;
  sportType: SportType;
  startsAt: Date;
  participants: ParticipantToReview[];
}

export const NO_RATING: RatingSummary = { average: null, count: 0 };
