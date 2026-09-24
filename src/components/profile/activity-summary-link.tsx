import { ChevronRight } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { getSport } from "@/config/sports";
import type { SportType } from "@/db/schema";
import { formatDay, formatTime } from "@/lib/format";

interface ActivitySummaryLinkProps {
  activity: { id: string; sportType: SportType; startsAt: Date };
  /** Informations complémentaires sous le titre. */
  details?: ReactNode;
  /** Élément aligné à droite (statut, compteur…). */
  aside?: ReactNode;
}

/** Ligne résumant une activité, cliquable pour l'ouvrir sur la carte. */
export function ActivitySummaryLink({ activity, details, aside }: ActivitySummaryLinkProps) {
  const sport = getSport(activity.sportType);

  return (
    <Link
      href={`/?activity=${activity.id}`}
      className="flex items-center gap-3 rounded-xl border p-3 transition-colors outline-none hover:bg-muted/60 focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <span aria-hidden className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-xl">
        {sport.emoji}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-medium">
          {sport.label} · {formatDay(activity.startsAt)} à {formatTime(activity.startsAt)}
        </span>
        {details && <span className="block truncate text-xs text-muted-foreground">{details}</span>}
      </span>
      {aside}
      <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden />
    </Link>
  );
}
