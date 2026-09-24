"use client";

import {
  Backpack,
  CalendarDays,
  Check,
  Euro,
  Gauge,
  Loader2,
  Map as MapIcon,
  MapPin,
  MessageCircle,
  Navigation,
  Timer,
  Users,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useTransition, type ReactNode } from "react";
import { toast } from "sonner";

import { ApplicationStatusBadge } from "@/components/applications/application-status-badge";
import { ReceivedApplicationRow } from "@/components/applications/received-application-row";
import { UserAvatar } from "@/components/applications/user-avatar";
import { SportIcon } from "@/components/brand/sport-icon";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { getSportLevelLabel } from "@/config/sport-levels";
import { getActivityTitle, getSport } from "@/config/sports";
import { useMediaQuery } from "@/hooks/use-media-query";
import type { ExploreActivity } from "@/lib/activities/types";
import { BadgeRow } from "@/components/achievements/achievements-grid";
import { RatingSummaryBadge } from "@/components/reviews/rating-stars";
import { applyToActivity, withdrawApplication } from "@/lib/applications/actions";
import type { MyApplicationSummary, ReceivedApplication } from "@/lib/applications/types";
import { formatDay, formatDuration, formatPrice, formatTime, pluralize } from "@/lib/format";
import { cn } from "@/lib/utils";

interface ActivitySheetProps {
  activity: ExploreActivity | null;
  /** Pour distinguer ses propres activités (pas de candidature possible). */
  currentUserId: string;
  /** Candidature de l'utilisateur sur cette activité, s'il a postulé. */
  myApplication: MyApplicationSummary | null;
  /** Candidatures reçues (uniquement si l'utilisateur est le créateur). */
  receivedApplications: ReceivedApplication[];
  /** Affiche l'activité sur la carte (depuis la vue liste). */
  onShowOnMap?: () => void;
  onClose: () => void;
}

/**
 * Détail d'une activité sélectionnée sur la carte.
 * Mobile : tiroir glissant depuis le bas. Desktop : panneau latéral à droite, la carte reste utilisable.
 */
export function ActivitySheet({
  activity,
  currentUserId,
  myApplication,
  receivedApplications,
  onShowOnMap,
  onClose,
}: ActivitySheetProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  return (
    <Drawer
      open={activity !== null}
      onOpenChange={(open) => !open && onClose()}
      swipeDirection={isDesktop ? "right" : "down"}
      modal={!isDesktop}
      showSwipeHandle={!isDesktop}
    >
      <DrawerContent className="md:shadow-xl md:data-[swipe-axis=x]:top-16">
        {activity && (
          <ActivityDetails
            activity={activity}
            isOwn={activity.creatorId === currentUserId}
            myApplication={myApplication}
            receivedApplications={receivedApplications}
            onShowOnMap={onShowOnMap}
          />
        )}
      </DrawerContent>
    </Drawer>
  );
}

interface ActivityDetailsProps {
  activity: ExploreActivity;
  isOwn: boolean;
  myApplication: MyApplicationSummary | null;
  receivedApplications: ReceivedApplication[];
  onShowOnMap?: () => void;
}

function ActivityDetails({ activity, isOwn, myApplication, receivedApplications, onShowOnMap }: ActivityDetailsProps) {
  const sport = getSport(activity.sportType);
  const isOpen = activity.status === "open";
  const takenSpots = activity.spotsTotal - activity.spotsAvailable;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Bandeau photo du sport */}
      <div className="relative h-36 shrink-0 overflow-hidden rounded-t-[inherit] md:h-44">
        <Image
          src={sport.image}
          alt=""
          fill
          sizes="(min-width: 768px) 384px, 100vw"
          className={cn("object-cover", !isOpen && "grayscale")}
        />
        <div aria-hidden className="absolute inset-0 bg-linear-to-t from-black/50 to-transparent" />
        <span className="absolute bottom-3 left-4 flex items-center gap-1.5 rounded-full bg-night-950/80 px-3 py-1 font-display text-sm font-bold text-white backdrop-blur-sm">
          <SportIcon sport={activity.sportType} className="size-5" />
          {sport.label}
        </span>
      </div>

      <DrawerHeader className="flex-row items-start gap-3 pt-4 pb-4 text-left">
        <div className="min-w-0 flex-1 space-y-1 text-left">
          <DrawerTitle className="text-lg font-semibold">
            {getActivityTitle(activity.sportType, isOpen ? activity.spotsAvailable : activity.spotsTotal)}
          </DrawerTitle>
          <DrawerDescription className="truncate text-left">
            {activity.locationName ?? activity.address ?? "Lieu indiqué sur la carte"}
          </DrawerDescription>
        </div>
        <Badge variant={isOpen ? "default" : "secondary"} className="shrink-0">
          {activity.status === "cancelled" ? "Annulée" : isOpen ? "Ouvert" : "Complet"}
        </Badge>
        <DrawerClose
          render={
            <Button variant="ghost" size="icon-sm" aria-label="Fermer" className="-mt-1 -mr-2 hidden md:inline-flex" />
          }
        >
          <X />
        </DrawerClose>
      </DrawerHeader>

      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-4 pb-4">
        {/* Créateur */}
        <div className="flex items-center gap-3 rounded-xl border p-3">
          <UserAvatar user={activity.creator} />
          <div className="min-w-0">
            <p className="truncate font-medium">
              {activity.creator.fullName}
              {isOwn && <span className="font-normal text-muted-foreground"> (toi)</span>}
            </p>
            <p className="text-xs text-muted-foreground">
              Organisateur · {getSportLevelLabel(activity.creator.sportLevel)}
            </p>
            <RatingSummaryBadge rating={activity.creatorRating} className="mt-1" />
          </div>
        </div>
        {activity.creatorBadges.length > 0 && <BadgeRow badges={activity.creatorBadges} className="-mt-2 justify-start" />}

        {/* Informations pratiques */}
        <dl className="grid grid-cols-2 gap-3">
          <DetailItem icon={CalendarDays} label="Date">
            {formatDay(activity.startsAt)}
          </DetailItem>
          <DetailItem icon={Timer} label="Horaire">
            {formatTime(activity.startsAt)} · {formatDuration(activity.durationMinutes)}
          </DetailItem>
          <DetailItem icon={Gauge} label="Niveau requis">
            {activity.requiredLevel ? getSportLevelLabel(activity.requiredLevel) : "Tous niveaux"}
          </DetailItem>
          <DetailItem icon={Users} label="Places">
            {isOpen ? `${pluralize(activity.spotsAvailable, "restante")} / ${activity.spotsTotal}` : "Complet"}
          </DetailItem>
          <DetailItem icon={Euro} label="Prix par personne">
            {activity.priceCents > 0 ? (
              <>
                {formatPrice(activity.priceCents)}
                <span className="block text-xs font-normal text-gray-400">À régler sur place</span>
              </>
            ) : (
              "Gratuit"
            )}
          </DetailItem>
          <DetailItem icon={Backpack} label="Matériel">
            {activity.equipmentRequired ? (
              <>
                À apporter
                {activity.equipmentNote && (
                  <span className="block text-xs font-normal text-gray-400">{activity.equipmentNote}</span>
                )}
              </>
            ) : (
              "Fourni / rien à apporter"
            )}
          </DetailItem>
        </dl>

        {/* Jauge de remplissage */}
        <div
          role="meter"
          aria-label="Places occupées"
          aria-valuemin={0}
          aria-valuemax={activity.spotsTotal}
          aria-valuenow={takenSpots}
          className="h-2 overflow-hidden rounded-full bg-muted"
        >
          <div
            className={cn("h-full rounded-full transition-[width]", isOpen ? "bg-primary" : "bg-muted-foreground/40")}
            style={{ width: `${(takenSpots / activity.spotsTotal) * 100}%` }}
          />
        </div>

        {/* Adresse + itinéraire */}
        <div className="flex items-center gap-3 rounded-xl border p-3">
          <MapPin className="size-5 shrink-0 text-brand-text" aria-hidden />
          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted-foreground">Adresse</p>
            <p className="text-sm font-medium">{activity.address ?? "Indiquée par le marqueur sur la carte"}</p>
          </div>
          <div className="flex shrink-0 flex-col gap-1.5">
            <Button
              variant="outline"
              size="sm"
              nativeButton={false}
              render={
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${activity.lat},${activity.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                />
              }
            >
              <Navigation aria-hidden />
              Itinéraire
            </Button>
            {onShowOnMap && (
              <Button variant="ghost" size="sm" onClick={onShowOnMap}>
                <MapIcon aria-hidden />
                Sur la carte
              </Button>
            )}
          </div>
        </div>

        {activity.description && (
          <div className="space-y-1">
            <h3 className="text-sm font-medium">Le mot de l&apos;organisateur</h3>
            <p className="text-sm whitespace-pre-line text-muted-foreground">{activity.description}</p>
          </div>
        )}

        {isOwn && <ReceivedApplicationsSection applications={receivedApplications} isFull={!isOpen} />}
      </div>

      {!isOwn && (
        <DrawerFooter className="border-t pt-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <ApplicantActions activity={activity} myApplication={myApplication} />
        </DrawerFooter>
      )}
    </div>
  );
}

/** Liste des candidatures reçues, visible uniquement par le créateur. */
function ReceivedApplicationsSection({
  applications,
  isFull,
}: {
  applications: ReceivedApplication[];
  isFull: boolean;
}) {
  const pendingCount = applications.filter((application) => application.status === "pending").length;

  return (
    <section aria-labelledby="applications-title" className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 id="applications-title" className="text-sm font-medium">
          Candidatures
        </h3>
        {pendingCount > 0 && (
          <span className="text-xs text-muted-foreground">{pluralize(pendingCount, "en attente", "en attente")}</span>
        )}
      </div>

      {applications.length === 0 ? (
        <p className="rounded-lg bg-muted/60 px-3 py-4 text-center text-sm text-muted-foreground">
          Aucune candidature pour l&apos;instant. Tu seras prévenu dès que quelqu&apos;un postule.
        </p>
      ) : (
        <ul className="space-y-2">
          {applications.map((application) => (
            <ReceivedApplicationRow key={application.id} application={application} isFull={isFull} />
          ))}
        </ul>
      )}
    </section>
  );
}

/** Actions du visiteur selon l'état de sa candidature. */
function ApplicantActions({
  activity,
  myApplication,
}: {
  activity: ExploreActivity;
  myApplication: MyApplicationSummary | null;
}) {
  const [isPending, startTransition] = useTransition();
  const isOpen = activity.status === "open";

  const run = (action: () => Promise<{ ok: true } | { ok: false; error: string }>, successMessage: string) => {
    startTransition(async () => {
      const result = await action();
      if (result.ok) toast.success(successMessage);
      else toast.error(result.error);
    });
  };

  if (!myApplication) {
    return (
      <Button
        className="h-11 w-full text-base"
        disabled={!isOpen || isPending}
        onClick={() =>
          run(() => applyToActivity(activity.id), "Candidature envoyée ! L'organisateur va te répondre.")
        }
      >
        {isPending && <Loader2 className="animate-spin" aria-hidden />}
        {isOpen ? "Postuler" : "Plus de place disponible"}
      </Button>
    );
  }

  const status = {
    pending: {
      text: "Candidature envoyée : l'organisateur doit encore te répondre.",
      action: "Retirer ma candidature",
      success: "Candidature retirée.",
    },
    accepted: {
      text: "Tu participes à cette activité !",
      action: "Me désister",
      success: "Tu t'es désisté, ta place a été libérée.",
    },
    rejected: {
      text: "L'organisateur n'a pas retenu ta candidature.",
      action: null,
      success: "",
    },
  }[myApplication.status];

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 rounded-lg bg-muted/60 px-3 py-2.5">
        {myApplication.status === "accepted" ? (
          <Check className="size-5 shrink-0 text-brand-text" aria-hidden />
        ) : (
          <ApplicationStatusBadge status={myApplication.status} />
        )}
        <p className="text-sm">{status.text}</p>
      </div>
      {myApplication.status === "accepted" && (
        <Button className="h-11 w-full text-base" nativeButton={false} render={<Link href={`/messages/${myApplication.id}`} />}>
          <MessageCircle aria-hidden />
          Discuter avec l&apos;organisateur
        </Button>
      )}
      {status.action && (
        <Button
          variant={myApplication.status === "accepted" ? "ghost" : "outline"}
          className="h-10 w-full"
          disabled={isPending}
          onClick={() => run(() => withdrawApplication(myApplication.id), status.success)}
        >
          {isPending && <Loader2 className="animate-spin" aria-hidden />}
          {status.action}
        </Button>
      )}
    </div>
  );
}

interface DetailItemProps {
  icon: typeof CalendarDays;
  label: string;
  children: ReactNode;
}

function DetailItem({ icon: Icon, label, children }: DetailItemProps) {
  return (
    <div className="flex items-start gap-2 rounded-lg bg-muted/60 p-3">
      <Icon className="mt-0.5 size-4 shrink-0 text-brand-text" aria-hidden />
      <div className="min-w-0">
        <dt className="text-xs text-muted-foreground">{label}</dt>
        <dd className="text-sm font-medium">{children}</dd>
      </div>
    </div>
  );
}
