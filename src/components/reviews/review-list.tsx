import { UserAvatar } from "@/components/applications/user-avatar";
import { getSport } from "@/config/sports";
import type { ReviewItem } from "@/lib/reviews/types";
import { RatingStars } from "./rating-stars";

const dateFormatter = new Intl.DateTimeFormat("fr-FR", { timeZone: "Europe/Paris", day: "numeric", month: "long", year: "numeric" });

/** Liste d'avis reçus (auteur, note, sport, date, commentaire). */
export function ReviewList({ reviews, emptyMessage }: { reviews: ReviewItem[]; emptyMessage?: string }) {
  if (reviews.length === 0) {
    return emptyMessage ? <p className="text-sm text-gray-400">{emptyMessage}</p> : null;
  }

  return (
    <ul className="space-y-3">
      {reviews.map((review) => (
        <li key={review.id} className="flex gap-3">
          <UserAvatar user={review.reviewer} className="size-8 text-[11px]" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
              <span className="font-display text-sm font-bold text-ink">{review.reviewer.username}</span>
              <RatingStars value={review.rating} className="text-xs" />
              <span className="sr-only">{review.rating} sur 5</span>
            </div>
            <p className="text-xs text-gray-400">
              {getSport(review.sportType).label} · {review.revieweeRole === "organizer" ? "en tant qu'organisateur·rice" : "en tant que participant·e"} ·{" "}
              {dateFormatter.format(review.createdAt)}
            </p>
            {review.comment && <p className="mt-1 text-sm whitespace-pre-line">{review.comment}</p>}
          </div>
        </li>
      ))}
    </ul>
  );
}
