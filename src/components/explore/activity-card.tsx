"use client";

import { Check, Clock, Loader2, MapPin, MessageCircle, Settings2, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useTransition } from "react";
import { toast } from "sonner";

import { AUDIENCE_BORDER_CLASSES, AudienceBadge } from "@/components/activities/audience-badge";
import { AchievementMedal } from "@/components/achievements/achievements-grid";
import { UserAvatar } from "@/components/applications/user-avatar";
import { Button } from "@/components/ui/button";
import { getSportLevelLabel } from "@/config/sport-levels";
import { getActivityTitle, getSport } from "@/config/sports";
import type { ExploreActivity } from "@/lib/activities/types";
import { applyToActivity } from "@/lib/applications/actions";
import type { MyApplicationSummary } from "@/lib/applications/types";
import { formatDay, formatPrice, formatTimeRange } from "@/lib/format";
import { formatDistance } from "@/lib/geo";
import { cn } from "@/lib/utils";

interface ActivityCardProps {
  activity: ExploreActivity;
  distanceKm: number | null;
  isOwn: boolean;
  myApplication: MyApplicationSummary | null;
  /** Candidatures en attente (activités de l'utilisateur). */
  pendingCount: number;
  onOpen: () => void;
  /** Charge l'image en priorité (premières cartes visibles). */
  priority?: boolean;
}

/** Nombre maximum d'avatars affichés avant « +N ». */
const MAX_AVATARS = 3;

/**
 * Carte d'activité de la liste Explorer : photo du sport, titre, niveau, date,
 * participants, distance et action principale (Rejoindre, Contacter…).
 * Toute la carte ouvre le détail ; le bouton d'action reste cliquable séparément.
 */
export function ActivityCard({
  activity,
  distanceKm,
  isOwn,
  myApplication,
  pendingCount,
  onOpen,
  priority,
}: ActivityCardProps) {
  const sport = getSport(activity.sportType);
  const isFull = activity.status !== "open";
  const title = getActivityTitle(activity.sportType, isFull ? activity.spotsTotal : activity.spotsAvailable);
  const place = activity.locationName ?? activity.address;
  const people = [activity.creator, ...activity.participants];

  return (
    <article
      className={cn(
        // Carte du design system : blanche, 16 px, ombre md ; au survol elle s'élève.
        "group relative flex gap-3.5 rounded-card bg-card p-3 shadow-md transition-all duration-250 ease-brand hover:-translate-y-0.5 hover:shadow-lg motion-reduce:transition-none motion-reduce:hover:translate-y-0",
        "has-[[data-card-link]:focus-visible]:ring-3 has-[[data-card-link]:focus-visible]:ring-ring",
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
        {/* Prix par personne, lisible d'un coup d'œil */}
        <span
          className={cn(
            "absolute top-1.5 left-1.5 rounded-md px-1.5 py-0.5 font-display text-[11px] font-extrabold shadow-sm",
            activity.priceCents > 0 ? "bg-night-950/85 text-white" : "bg-mint-500 text-night-950",
          )}
        >
          {formatPrice(activity.priceCents)}
          {activity.priceCents > 0 && <span className="sr-only"> par personne, à régler sur place</span>}
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
          {/* Lien étiré : rend toute la carte cliquable sans imbriquer de boutons. */}
          <button type="button" onClick={onOpen} data-card-link className="text-left outline-none after:absolute after:inset-0 after:rounded-card">
            {title}
          </button>
        </h3>
        <p className="mt-1 truncate text-xs text-gray-400">
          {sport.label} •{" "}
          {activity.requiredLevel ? `Niveau ${getSportLevelLabel(activity.requiredLevel).toLowerCase()}` : "Tous niveaux bienvenus"}
        </p>
        <p className="truncate text-xs text-gray-400">
          {formatDay(activity.startsAt)} • {formatTimeRange(activity.startsAt, activity.durationMinutes)}
        </p>
        <p className="flex min-w-0 items-center gap-1 text-xs text-gray-400">
          <MapPin className="size-3.5 shrink-0" aria-hidden />
          <span className="truncate">
            {distanceKm !== null && <span className="font-semibold text-gray-600">{formatDistance(distanceKm)}</span>}
            {distanceKm !== null && place && " • "}
            {place ?? (distanceKm === null ? "Voir la carte" : null)}
          </span>
        </p>
        <OrganizerLine activity={activity} />

        <div className="mt-auto flex items-end justify-between gap-2 pt-2">
          <div className="flex min-w-0 items-center gap-2">
            <div className="flex -space-x-2" aria-label={`${people.length} personne(s) inscrite(s)`}>
              {people.slice(0, MAX_AVATARS).map((person) => (
                <UserAvatar key={person.id} user={person} className="size-7 text-[10px] ring-2 ring-card" />
              ))}
              {people.length > MAX_AVATARS && (
                <span className="flex size-7 items-center justify-center rounded-full bg-sand-100 text-[10px] font-semibold text-ink ring-2 ring-card">
                  +{people.length - MAX_AVATARS}
                </span>
              )}
            </div>
          </div>

          <div className="relative z-10 shrink-0">
            <CardAction
              activity={activity}
              isOwn={isOwn}
              myApplication={myApplication}
              pendingCount={pendingCount}
              onOpen={onOpen}
            />
          </div>
        </div>
      </div>
    </article>
  );
}

/** Action principale selon la relation de l'utilisateur à l'activité. */
function CardAction({
  activity,
  isOwn,
  myApplication,
  pendingCount,
  onOpen,
}: Pick<ActivityCardProps, "activity" | "isOwn" | "myApplication" | "pendingCount" | "onOpen">) {
  const [isPending, startTransition] = useTransition();
  const buttonClass = "px-3.5";

  if (isOwn) {
    return (
      <Button variant="outline" size="sm" className={buttonClass} onClick={onOpen}>
        <Settings2 aria-hidden />
        Gérer
        {pendingCount > 0 && (
          <span className="ml-0.5 rounded-full bg-destructive px-1.5 text-[10px] leading-4 text-white">{pendingCount}</span>
        )}
      </Button>
    );
  }

  if (myApplication?.status === "accepted") {
    return (
      <Button
        variant="outline"
        size="sm"
        className={buttonClass}
        nativeButton={false}
        render={<Link href={`/messages/${myApplication.id}`} />}
      >
        <MessageCircle aria-hidden />
        Contacter
      </Button>
    );
  }

  if (myApplication?.status === "pending") {
    return (
      <Button variant="secondary" size="sm" className={buttonClass} onClick={onOpen}>
        <Clock aria-hidden />
        En attente
      </Button>
    );
  }

  if (myApplication?.status === "rejected") {
    return <span className="text-xs text-muted-foreground">Non retenu</span>;
  }

  if (activity.status !== "open") {
    return (
      <Button variant="secondary" size="sm" className={buttonClass} disabled>
        Complet
      </Button>
    );
  }

  return (
    <Button
      size="sm"
      className={buttonClass}
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          const result = await applyToActivity(activity.id);
          if (result.ok) toast.success("Candidature envoyée ! L'organisateur va te répondre.");
          else toast.error(result.error);
        })
      }
    >
      {isPending ? <Loader2 className="animate-spin" aria-hidden /> : <Check aria-hidden />}
      Rejoindre
    </Button>
  );
}

const ratingFormatter = new Intl.NumberFormat("fr-FR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

/** Organisateur, sa note moyenne et ses meilleurs badges : de quoi donner confiance d'un coup d'œil. */
function OrganizerLine({ activity }: { activity: ExploreActivity }) {
  const { creatorRating: rating, creatorBadges: badges } = activity;
  const firstName = activity.creator.username;

  return (
    <p className="mt-0.5 flex min-w-0 items-center gap-1.5 text-xs text-gray-400">
      <span className="truncate">Par {firstName}</span>
      {rating.average !== null && (
        <span
          className="flex shrink-0 items-center gap-0.5 font-semibold text-ink"
          aria-label={`note ${ratingFormatter.format(rating.average)} sur 5, ${rating.count} avis`}
        >
          <Star className="size-3 text-sunset-500" fill="currentColor" strokeWidth={0} aria-hidden />
          {ratingFormatter.format(rating.average)}
        </span>
      )}
      {badges.length > 0 && (
        <span className="flex shrink-0 items-center gap-0.5">
          {badges.map((badge) => (
            <span key={badge.id} title={badge.tierLabel ? `${badge.title} · ${badge.tierLabel}` : badge.title}>
              <AchievementMedal emoji={badge.emoji} tier={badge.tier} hasTiers={badge.tierLabel !== null} size="xs" />
              <span className="sr-only">
                Badge {badge.title}
                {badge.tierLabel && ` ${badge.tierLabel}`}
              </span>
            </span>
          ))}
        </span>
      )}
    </p>
  );
}
