import type { Activity, Application, PublicUser } from "@/db/schema";
import type { ActivityWithCreator } from "@/lib/activities/types";
import type { AchievementState } from "@/lib/achievements/definitions";
import type { RatingSummary, ReviewItem } from "@/lib/reviews/types";

/** Profil public d'un candidat, consultable par le créateur de l'activité. */
export type ApplicantProfile = Pick<
  PublicUser,
  "id" | "fullName" | "sportLevel" | "avatarUrl" | "bio" | "createdAt" | "favoriteSports"
>;

/** Résumé de l'activité concernée par une candidature reçue. */
export type ActivitySummary = Pick<Activity, "id" | "sportType" | "startsAt" | "status">;

/** Candidature reçue par un créateur, avec le profil du candidat. */
export type ReceivedApplication = Pick<
  Application,
  "id" | "activityId" | "status" | "message" | "createdAt"
> & {
  applicant: ApplicantProfile;
  activity: ActivitySummary;
  /** Réputation du candidat (avis laissés par ses précédents organisateurs). */
  applicantRating: RatingSummary;
  applicantReviews: ReviewItem[];
  /** Badges débloqués par le candidat. */
  applicantBadges: AchievementState[];
};

/** Candidature envoyée par l'utilisateur, avec l'activité concernée. */
export type SentApplication = Pick<Application, "id" | "activityId" | "status" | "createdAt"> & {
  activity: ActivityWithCreator;
};

/** Statut de la candidature de l'utilisateur sur une activité (affichage de la carte). */
export type MyApplicationSummary = Pick<Application, "id" | "status">;
