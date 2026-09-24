import { ChevronRight } from "lucide-react";
import Image from "next/image";
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
      className="flex items-center gap-3 rounded-card bg-card p-3 shadow-md transition-all duration-150 ease-brand outline-none hover:-translate-y-0.5 hover:shadow-lg focus-visible:ring-3 focus-visible:ring-ring"
    >
      <span className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-muted">
        <Image src={sport.image} alt="" fill sizes="48px" className="object-cover" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-display text-sm font-bold text-ink">
          {sport.label} · {formatDay(activity.startsAt)} à {formatTime(activity.startsAt)}
        </span>
        {details && <span className="block truncate text-xs text-gray-400">{details}</span>}
      </span>
      {aside}
      <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden />
    </Link>
  );
}
