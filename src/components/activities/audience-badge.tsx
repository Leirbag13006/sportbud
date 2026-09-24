import { UsersRound } from "lucide-react";

import { getAudienceLabel } from "@/config/audience";
import type { Audience } from "@/db/schema";
import { cn } from "@/lib/utils";

/** Pastille « Entre femmes » / « Entre hommes » (rien pour une séance mixte). */
export function AudienceBadge({ audience, className }: { audience: Audience; className?: string }) {
  if (audience === "all") return null;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-night-900 px-2 py-0.5 font-display text-[11px] font-bold text-mint-400",
        className,
      )}
    >
      <UsersRound className="size-3" aria-hidden />
      {getAudienceLabel(audience)}
    </span>
  );
}
