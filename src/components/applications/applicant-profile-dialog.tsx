"use client";

import { CalendarDays } from "lucide-react";
import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getSportLevelLabel } from "@/config/sport-levels";
import { BadgeRow } from "@/components/achievements/achievements-grid";
import { SportIcon } from "@/components/brand/sport-icon";
import { RatingSummaryBadge } from "@/components/reviews/rating-stars";
import { getSport } from "@/config/sports";
import type { EarnedBadge } from "@/lib/achievements/definitions";
import { ReviewList } from "@/components/reviews/review-list";
import type { ApplicantProfile } from "@/lib/applications/types";
import type { RatingSummary, ReviewItem } from "@/lib/reviews/types";
import { UserAvatar } from "./user-avatar";

const memberSince = new Intl.DateTimeFormat("fr-FR", { month: "long", year: "numeric" });

interface ApplicantProfileDialogProps {
  applicant: ApplicantProfile | null;
  /** Réputation : moyenne et derniers avis des précédents organisateurs. */
  rating: RatingSummary;
  reviews: ReviewItem[];
  badges: EarnedBadge[];
  onClose: () => void;
  /** Boutons d'action affichés en bas (Accepter / Refuser). */
  actions?: ReactNode;
}

/** Profil public d'un candidat, consulté par le créateur avant de répondre. */
export function ApplicantProfileDialog({ applicant, rating, reviews, badges, onClose, actions }: ApplicantProfileDialogProps) {
  return (
    <Dialog open={applicant !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-sm">
        {applicant && (
          <>
            <DialogHeader className="items-center text-center">
              <UserAvatar user={applicant} className="size-20 text-xl" />
              <DialogTitle className="text-lg">{applicant.fullName}</DialogTitle>
              <DialogDescription className="flex flex-col items-center gap-2">
                <Badge variant="secondary">{getSportLevelLabel(applicant.sportLevel)}</Badge>
                <span className="flex items-center gap-1.5 text-xs">
                  <CalendarDays className="size-3.5" aria-hidden />
                  Membre depuis {memberSince.format(applicant.createdAt)}
                </span>
              </DialogDescription>
            </DialogHeader>

            <div className="flex justify-center">
              <RatingSummaryBadge rating={rating} />
            </div>

            <BadgeRow badges={badges} />

            {applicant.favoriteSports.length > 0 && (
              <ul className="flex flex-wrap justify-center gap-1.5" aria-label="Sports favoris">
                {applicant.favoriteSports.map((sport) => (
                  <li key={sport} className="flex items-center gap-1 rounded-full bg-muted py-0.5 pr-2.5 pl-1 text-xs font-medium text-ink">
                    <SportIcon sport={sport} className="size-5" />
                    {getSport(sport).label}
                  </li>
                ))}
              </ul>
            )}

            <div className="rounded-lg bg-muted/60 p-3">
              <p className="text-xs font-medium text-muted-foreground">Bio</p>
              <p className="mt-1 text-sm whitespace-pre-line">
                {applicant.bio || "Ce membre n'a pas encore écrit de bio."}
              </p>
            </div>

            {reviews.length > 0 && (
              <div className="max-h-56 space-y-2 overflow-y-auto">
                <p className="text-xs font-medium text-muted-foreground">Derniers avis</p>
                <ReviewList reviews={reviews} />
              </div>
            )}

            {actions && <DialogFooter className="gap-2 sm:justify-center">{actions}</DialogFooter>}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
