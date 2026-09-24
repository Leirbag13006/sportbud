"use client";

import { CalendarDays, Gauge, MapPin, Timer, Users, X } from "lucide-react";
import type { ReactNode } from "react";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { getSport } from "@/config/sports";
import { useMediaQuery } from "@/hooks/use-media-query";
import type { ActivityWithCreator } from "@/lib/activities/types";
import { formatDay, formatDuration, formatTime, getInitials, pluralize } from "@/lib/format";
import { cn } from "@/lib/utils";

interface ActivitySheetProps {
  activity: ActivityWithCreator | null;
  onClose: () => void;
}

/**
 * Détail d'une activité sélectionnée sur la carte.
 * Mobile : tiroir glissant depuis le bas. Desktop : panneau latéral à droite, la carte reste utilisable.
 */
export function ActivitySheet({ activity, onClose }: ActivitySheetProps) {
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
        {activity && <ActivityDetails activity={activity} />}
      </DrawerContent>
    </Drawer>
  );
}

function ActivityDetails({ activity }: { activity: ActivityWithCreator }) {
  const sport = getSport(activity.sportType);
  const isOpen = activity.status === "open";
  const takenSpots = activity.spotsTotal - activity.spotsAvailable;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <DrawerHeader className="flex-row items-start gap-3 pb-4 text-left">
        <span
          aria-hidden
          className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-2xl"
        >
          {sport.emoji}
        </span>
        <div className="min-w-0 flex-1 space-y-1 text-left">
          <DrawerTitle className="text-lg font-semibold">{sport.label}</DrawerTitle>
          <DrawerDescription className="truncate text-left">
            {activity.locationName ?? "Lieu indiqué sur la carte"}
          </DrawerDescription>
        </div>
        <Badge variant={isOpen ? "default" : "secondary"} className="shrink-0">
          {activity.status === "cancelled" ? "Annulée" : isOpen ? "Ouvert" : "Complet"}
        </Badge>
        <DrawerClose
          render={<Button variant="ghost" size="icon-sm" aria-label="Fermer" className="-mt-1 -mr-2 hidden md:inline-flex" />}
        >
          <X />
        </DrawerClose>
      </DrawerHeader>

      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-4 pb-4">
        {/* Créateur */}
        <div className="flex items-center gap-3 rounded-xl border p-3">
          <Avatar className="size-10">
            {activity.creator.avatarUrl && <AvatarImage src={activity.creator.avatarUrl} alt="" />}
            <AvatarFallback className="bg-brand-soft text-sm font-semibold text-primary">
              {getInitials(activity.creator.fullName)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate font-medium">{activity.creator.fullName}</p>
            <p className="text-xs text-muted-foreground">
              Organisateur · {getSportLevelLabel(activity.creator.sportLevel)}
            </p>
          </div>
        </div>

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
            className={cn("h-full rounded-full", isOpen ? "bg-primary" : "bg-muted-foreground/40")}
            style={{ width: `${(takenSpots / activity.spotsTotal) * 100}%` }}
          />
        </div>

        {activity.description && (
          <div className="space-y-1">
            <h3 className="text-sm font-medium">Le mot de l&apos;organisateur</h3>
            <p className="text-sm whitespace-pre-line text-muted-foreground">{activity.description}</p>
          </div>
        )}

        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <MapPin className="size-3.5" aria-hidden />
          Le lieu exact est indiqué par le marqueur sur la carte.
        </p>
      </div>

      <DrawerFooter className="border-t pt-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <Button
          className="h-11 w-full text-base"
          disabled={!isOpen}
          // TODO (étape 5) : créer la candidature.
          onClick={() => toast.info("La candidature arrive à l'étape 5.")}
        >
          {isOpen ? "Postuler" : "Plus de place disponible"}
        </Button>
      </DrawerFooter>
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
      <Icon className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
      <div className="min-w-0">
        <dt className="text-xs text-muted-foreground">{label}</dt>
        <dd className="text-sm font-medium">{children}</dd>
      </div>
    </div>
  );
}
