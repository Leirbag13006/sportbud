import { Star } from "lucide-react";

import type { RatingSummary } from "@/lib/reviews/types";
import { cn } from "@/lib/utils";

const ratingFormatter = new Intl.NumberFormat("fr-FR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

/** Cinq étoiles en lecture seule (remplissage partiel pour les moyennes). */
export function RatingStars({ value, className }: { value: number; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-0.5", className)} aria-hidden>
      {[1, 2, 3, 4, 5].map((index) => {
        const fill = Math.max(0, Math.min(1, value - (index - 1)));
        return (
          <span key={index} className="relative inline-flex">
            <Star className="size-[1em] text-gray-400/40" fill="currentColor" strokeWidth={0} />
            <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
              <Star className="size-[1em] text-sunset-500" fill="currentColor" strokeWidth={0} />
            </span>
          </span>
        );
      })}
    </span>
  );
}

/** Résumé de réputation : « ★★★★★ 4,8 (12 avis) » ou « Nouveau membre ». */
export function RatingSummaryBadge({ rating, className }: { rating: RatingSummary; className?: string }) {
  if (rating.count === 0 || rating.average === null) {
    return <span className={cn("text-xs text-gray-400", className)}>Nouveau membre · pas encore d&apos;avis</span>;
  }
  const label = `Note moyenne ${ratingFormatter.format(rating.average)} sur 5, ${rating.count} avis`;
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-xs", className)} aria-label={label} title={label}>
      <RatingStars value={rating.average} className="text-sm" />
      <span className="font-semibold text-ink">{ratingFormatter.format(rating.average)}</span>
      <span className="text-gray-400">({rating.count} avis)</span>
    </span>
  );
}
