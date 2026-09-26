"use client";

import { Lock, Plus } from "lucide-react";
import Image from "next/image";

import { ActivityList } from "@/components/explore/activity-list";
import { ExploreToolbar } from "@/components/explore/explore-toolbar";
import { Logo } from "@/components/layout/logo";
import { NAV_ITEMS } from "@/config/navigation";
import type { Audience, SportLevel, SportType } from "@/db/schema";
import { toEarnedBadge, type EarnedBadge } from "@/lib/achievements/definitions";
import type { ExploreActivity } from "@/lib/activities/types";
import type { RatingSummary } from "@/lib/reviews/types";
import { cn } from "@/lib/utils";

const badge = (id: string, tier: number) => toEarnedBadge(id, tier)!;

/** Crée une date du jour (ou de J+n) à l'heure donnée, en heure locale. */
function at(daysFromToday: number, hour: number) {
  const date = new Date();
  date.setDate(date.getDate() + daysFromToday);
  date.setHours(hour, 0, 0, 0);
  return date;
}

type DemoSeed = {
  sportType: SportType;
  spots: number;
  level: SportLevel | null;
  day: number;
  hour: number;
  distanceKm: number;
  organizer: string;
  /** Participants : pseudo et photo (portraits CC0 de public/avatars). */
  participants: string[];
  place: string;
  priceCents: number;
  equipmentRequired: boolean;
  audience?: Audience;
  rating: RatingSummary;
  badges: EarnedBadge[];
};

/** Annonces d'exemple (illustration de l'interface, pas des données réelles). */
const SEEDS: DemoSeed[] = [
  { sportType: "football", spots: 2, level: "intermediate", day: 0, hour: 19, distanceKm: 1.2, place: "City stade du Jas", organizer: "thomas.five", participants: ["lina.foot", "antoine.football", "jules.run"], priceCents: 800, equipmentRequired: false, rating: { average: 4.8, count: 12 }, badges: [badge("organisateur", 3), badge("fiable", 2)] },
  { sportType: "tennis", spots: 1, level: "beginner", day: 1, hour: 18, distanceKm: 2.8, place: "Tennis des Milles", organizer: "manon.tennis", participants: ["emma.padel"], priceCents: 0, equipmentRequired: true, audience: "women", rating: { average: 4.6, count: 5 }, badges: [badge("joueur", 2)] },
  { sportType: "running", spots: 4, level: null, day: 3, hour: 9, distanceKm: 3.5, place: "Bords de l'Arc", organizer: "jules.run", participants: ["camille.run", "nora.fitness", "zoe.cycling", "baptiste.cycling"], priceCents: 0, equipmentRequired: false, rating: { average: 5, count: 21 }, badges: [badge("sociable", 3), badge("en-feu", 2)] },
];

function toActivity(seed: DemoSeed, index: number): ExploreActivity {
  const person = (username: string, i: number) => ({ id: `demo-${index}-${i}`, username, avatarUrl: `/avatars/${username}.webp` });
  return {
    id: `demo-${index}`,
    creatorId: `demo-${index}-0`,
    creator: { ...person(seed.organizer, 0), sportLevel: "intermediate" },
    participants: seed.participants.map((name, i) => person(name, i + 1)),
    creatorRating: seed.rating,
    creatorBadges: seed.badges,
    sportType: seed.sportType,
    description: null,
    locationName: seed.place,
    address: null,
    priceCents: seed.priceCents,
    equipmentRequired: seed.equipmentRequired,
    audience: seed.audience ?? "all",
    equipmentNote: null,
    lat: 0,
    lng: 0,
    startsAt: at(seed.day, seed.hour),
    durationMinutes: 60,
    requiredLevel: seed.level,
    spotsTotal: seed.spots + seed.participants.length,
    spotsAvailable: seed.spots,
    status: "open",
  };
}

const noop = () => {};
const ITEMS = SEEDS.map((seed, index) => ({ activity: toActivity(seed, index), distanceKm: seed.distanceKm }));

/**
 * Aperçu fidèle de l'écran Explorer (grand écran : en-tête, liste « Pour toi » et carte côte à côte) :
 * ce sont les vrais composants de l'app, affichés avec des annonces d'exemple, et une capture de la
 * vraie carte. `inert` : non interactif et ignoré au clavier.
 */
export function ProductPreview() {
  return (
    <div
      role="img"
      aria-label="Aperçu de SportMates : séances près de chez toi en liste et sur la carte, avec niveau, horaire, distance et bouton Rejoindre"
      className="overflow-hidden rounded-block bg-night-950 shadow-lg ring-1 ring-white/10"
    >
      {/* Barre de navigateur */}
      <div aria-hidden className="flex items-center gap-3 border-b border-night-700 px-4 py-3">
        <span className="flex gap-1.5">
          <span className="size-3 rounded-full bg-white/15" />
          <span className="size-3 rounded-full bg-white/15" />
          <span className="size-3 rounded-full bg-white/15" />
        </span>
        <span className="mx-auto flex h-7 w-full max-w-xs items-center justify-center gap-1.5 rounded-md bg-night-800 text-xs text-white/60">
          <Lock className="size-3" />
          sport-mates.vercel.app
        </span>
        <span className="w-12" />
      </div>

      <div inert aria-hidden className="pointer-events-none select-none">
        {/* En-tête du site (reproduit : le vrai dépend de la route et de la session). */}
        <div className="hidden h-14 items-center justify-between gap-6 border-b border-night-700 px-6 md:flex">
          <Logo variant="dark" size="sm" href={null} />
          <div className="flex items-center gap-1">
            {NAV_ITEMS.map(({ href, label, icon: Icon }, index) => (
              <span
                key={href}
                className={cn(
                  "flex h-9 items-center gap-2 rounded-lg px-3 font-display text-sm font-semibold",
                  index === 0 ? "bg-night-800 text-mint-500" : "text-white/70",
                )}
              >
                <Icon className="size-4" />
                {label}
              </span>
            ))}
            <span className="ml-2 flex h-9 items-center gap-1.5 rounded-lg bg-mint-500 px-3.5 font-display text-sm font-bold text-night-950">
              <Plus className="size-4" />
              Créer une activité
            </span>
          </div>
        </div>

        <ExploreToolbar
          view="list"
          onViewChange={noop}
          showViewToggle={false}
          sport={null}
          onSportChange={noop}
          activeFilterCount={0}
          onOpenFilters={noop}
          city="Aix-en-Provence"
          hasPosition
          isLocating={false}
          onRequestLocation={noop}
        />
        <div className="flex h-[460px] bg-sand-50 md:h-[520px]">
          <div className="w-full shrink-0 overflow-hidden lg:w-[420px] lg:border-r">
            <ActivityList
              items={ITEMS}
              recommended={ITEMS}
              totalCount={ITEMS.length}
              currentUserId=""
              myApplications={{ "demo-1": { id: "demo", status: "accepted" } }}
              receivedApplications={[]}
              onOpen={noop}
              onResetFilters={noop}
              onCreate={noop}
              layout="column"
            />
          </div>
          <div className="relative hidden flex-1 lg:block">
            <Image
              src="/images/app-map.webp"
              alt=""
              fill
              sizes="(min-width: 1024px) 560px, 0px"
              className="object-cover object-[35%_center]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
