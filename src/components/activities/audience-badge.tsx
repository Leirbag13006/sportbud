import { UsersRound } from "lucide-react";

import { getAudienceLabel } from "@/config/audience";
import type { Audience } from "@/db/schema";
import { cn } from "@/lib/utils";

/** Couleur des séances à public restreint : bleu entre hommes, rose entre femmes. */
export const AUDIENCE_BADGE_CLASSES: Record<Exclude<Audience, "all">, string> = {
  men: "bg-men-700 text-white",
  women: "bg-women-700 text-white",
};

/** Contour des cartes d'activité à public restreint. */
export const AUDIENCE_BORDER_CLASSES: Record<Audience, string> = {
  all: "",
  men: "border-2 border-men-500",
  women: "border-2 border-women-500",
};

/** Pastille « Entre femmes » (rose) / « Entre hommes » (bleu) ; rien pour une séance mixte. */
export function AudienceBadge({ audience, className }: { audience: Audience; className?: string }) {
  if (audience === "all") return null;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-display text-[11px] font-bold",
        AUDIENCE_BADGE_CLASSES[audience],
        className,
      )}
    >
      <UsersRound className="size-3" aria-hidden />
      {getAudienceLabel(audience)}
    </span>
  );
}
