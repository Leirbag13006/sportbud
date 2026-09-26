import { CalendarDays, MapPin, UsersRound } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { AUDIENCE_BORDER_CLASSES, AudienceBadge } from "@/components/activities/audience-badge";
import { UserAvatar } from "@/components/applications/user-avatar";
import { getSportLevelLabel } from "@/config/sport-levels";
import { getActivityTitle, getSport } from "@/config/sports";
import type { PublicActivity } from "@/lib/activities/types";
import { formatDayInParis, formatPrice, formatTimeRangeInParis, pluralize } from "@/lib/format";
import { cn } from "@/lib/utils";

/**
 * Carte d'une séance vue sans compte (liste publique, landing) : même allure que la carte de
 * l'Explorer, mais toute la carte mène à la page partageable de la séance.
 */
export function PublicActivityCard({ activity, priority }: { activity: PublicActivity; priority?: boolean }) {
  const sport = getSport(activity.sportType);
  const isFull = activity.status !== "open";
  const title = getActivityTitle(activity.sportType, isFull ? activity.spotsTotal : activity.spotsAvailable);

  return (
    <article
      className={cn(
        "group relative flex gap-3.5 rounded-card bg-card p-3 shadow-md transition-all duration-250 ease-brand hover:-translate-y-0.5 hover:shadow-lg motion-reduce:transition-none motion-reduce:hover:translate-y-0",
        "has-[a:focus-visible]:ring-3 has-[a:focus-visible]:ring-ring",
        AUDIENCE_BORDER_CLASSES[activity.audience],
      )}
    >
      <div className="relative size-24 shrink-0 overflow-hidden rounded-lg bg-muted sm:size-28">
        <Image
          src={sport.image}
          alt=""
          fill
          sizes="112px"
          priority={priority}
          className={cn("sl-photo object-cover transition-transform duration-300 group-hover:scale-105", isFull && "opacity-50")}
        />
        <span
          className={cn(
            "absolute top-1.5 left-1.5 rounded-md px-1.5 py-0.5 font-display text-[11px] font-extrabold shadow-sm",
            activity.priceCents > 0 ? "bg-night-950/85 text-white" : "bg-mint-500 text-night-950",
          )}
        >
          {formatPrice(activity.priceCents)}
        </span>
        {isFull && (
          <span className="absolute inset-x-0 bottom-0 bg-night-950/75 py-0.5 text-center font-display text-[11px] font-bold text-white">
            Complet
          </span>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <AudienceBadge audience={activity.audience} className="mb-1 self-start" />
        <h3 className="truncate text-[15px] leading-tight font-bold">
          {/* Lien étiré : toute la carte est cliquable. */}
          <Link href={`/seances/${activity.id}`} className="outline-none after:absolute after:inset-0 after:rounded-card">
            {title}
          </Link>
        </h3>
        <p className="mt-1 truncate text-xs text-gray-400">
          {sport.label} •{" "}
          {activity.requiredLevel ? `Niveau ${getSportLevelLabel(activity.requiredLevel).toLowerCase()}` : "Tous niveaux bienvenus"}
        </p>
        <p className="flex items-center gap-1 truncate text-xs text-gray-400">
          <CalendarDays className="size-3.5 shrink-0" aria-hidden />
          {formatDayInParis(activity.startsAt)} • {formatTimeRangeInParis(activity.startsAt, activity.durationMinutes)}
        </p>
        {activity.area && (
          <p className="flex items-center gap-1 truncate text-xs text-gray-400">
            <MapPin className="size-3.5 shrink-0" aria-hidden />
            {activity.area}
          </p>
        )}
        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
          <span className="flex min-w-0 items-center gap-1.5 text-xs text-gray-600">
            <UserAvatar user={activity.creator} className="size-6 text-[9px]" />
            <span className="truncate">Par {activity.creator.username}</span>
          </span>
          <span className="flex shrink-0 items-center gap-1 text-xs font-semibold text-ink">
            <UsersRound className="size-3.5 text-brand-text" aria-hidden />
            {isFull ? "Complet" : `${pluralize(activity.spotsAvailable, "place")} libre${activity.spotsAvailable > 1 ? "s" : ""}`}
          </span>
        </div>
      </div>
    </article>
  );
}
