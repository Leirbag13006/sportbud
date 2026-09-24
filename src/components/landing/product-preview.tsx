"use client";

import { Lock } from "lucide-react";

import { ActivityCard } from "@/components/explore/activity-card";
import { ExploreToolbar } from "@/components/explore/explore-toolbar";
import type { Audience, SportLevel, SportType } from "@/db/schema";
import { toEarnedBadge, type EarnedBadge } from "@/lib/achievements/definitions";
import type { ExploreActivity } from "@/lib/activities/types";
import type { RatingSummary } from "@/lib/reviews/types";

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
  participants: string[];
  priceCents: number;
  equipmentRequired: boolean;
  audience?: Audience;
  rating: RatingSummary;
  badges: EarnedBadge[];
};

/** Annonces d'exemple (illustration de l'interface, pas des données réelles). */
const SEEDS: DemoSeed[] = [
  { sportType: "football", spots: 2, level: "intermediate", day: 0, hour: 19, distanceKm: 1.2, organizer: "karim_five", participants: ["lea.m", "hugo13"], priceCents: 800, equipmentRequired: false, rating: { average: 4.8, count: 12 }, badges: [badge("organisateur", 3), badge("fiable", 2)] },
  { sportType: "tennis", spots: 1, level: "beginner", day: 1, hour: 18, distanceKm: 2.8, organizer: "juju.tennis", participants: [], priceCents: 0, equipmentRequired: true, audience: "women", rating: { average: 4.6, count: 5 }, badges: [badge("joueur", 2)] },
  { sportType: "running", spots: 4, level: null, day: 3, hour: 9, distanceKm: 3.5, organizer: "thomas_run", participants: ["ines.f", "nora_k", "samdu13", "lou.p"], priceCents: 0, equipmentRequired: false, rating: { average: 5, count: 21 }, badges: [badge("sociable", 3), badge("en-feu", 2)] },
  { sportType: "padel", spots: 2, level: "intermediate", day: 2, hour: 20, distanceKm: 4.1, organizer: "lucas.padel", participants: ["emma_t"], priceCents: 1000, equipmentRequired: false, rating: { average: null, count: 0 }, badges: [badge("organisateur", 1)] },
];

function toActivity(seed: DemoSeed, index: number): ExploreActivity {
  const person = (username: string, i: number) => ({ id: `demo-${index}-${i}`, username, avatarUrl: null });
  return {
    id: `demo-${index}`,
    creatorId: `demo-${index}-0`,
    creator: { ...person(seed.organizer, 0), sportLevel: "intermediate" },
    participants: seed.participants.map((name, i) => person(name, i + 1)),
    creatorRating: seed.rating,
    creatorBadges: seed.badges,
    sportType: seed.sportType,
    description: null,
    locationName: null,
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

/**
 * Aperçu fidèle de l'écran Explorer : ce sont les vrais composants de l'app, affichés avec des
 * annonces d'exemple dans un cadre de navigateur. `inert` : non interactif et ignoré au clavier.
 */
export function ProductPreview() {
  return (
    <div
      role="img"
      aria-label="Aperçu de SportMates : liste d'activités près de chez toi avec photo, niveau, horaire, distance et bouton Rejoindre"
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
          sportmates.vercel.app
        </span>
        <span className="w-12" />
      </div>

      <div inert aria-hidden className="pointer-events-none select-none">
        <ExploreToolbar
          view="list"
          onViewChange={noop}
          sport={null}
          onSportChange={noop}
          activeFilterCount={0}
          onOpenFilters={noop}
          city="Autour de toi"
          hasPosition
          isLocating={false}
          onRequestLocation={noop}
        />
        <div className="bg-sand-50 px-4 py-5 md:px-6">
          <ul className="grid gap-3 lg:grid-cols-2">
            {SEEDS.map((seed, index) => (
              <li key={index} className="min-w-0">
                <ActivityCard
                  activity={toActivity(seed, index)}
                  distanceKm={seed.distanceKm}
                  isOwn={false}
                  myApplication={index === 1 ? { id: "demo", status: "accepted" } : null}
                  pendingCount={0}
                  onOpen={noop}
                />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
