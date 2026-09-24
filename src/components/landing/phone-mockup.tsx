import { CalendarCheck, House, MapPin, MessageCircle, Plus, SlidersHorizontal, User } from "lucide-react";
import Image from "next/image";

import { SportIcon } from "@/components/brand/sport-icon";
import { Logo } from "@/components/layout/logo";
import type { SportType } from "@/db/schema";

/** Annonces d'exemple affichées dans la maquette (illustration, pas des données réelles). */
const SAMPLE_ACTIVITIES: {
  sport: SportType;
  image: string;
  title: string;
  meta: string;
  when: string;
  distance: string;
  action: "join" | "contact";
}[] = [
  {
    sport: "football",
    image: "/sports/football.jpg",
    title: "Recherche 2 joueurs",
    meta: "Foot • Niveau intermédiaire",
    when: "Aujourd'hui • 19h",
    distance: "1,2 km",
    action: "join",
  },
  {
    sport: "tennis",
    image: "/sports/tennis.jpg",
    title: "Partenaire de tennis",
    meta: "Débutant à intermédiaire",
    when: "Demain • 18h",
    distance: "2,8 km",
    action: "contact",
  },
  {
    sport: "running",
    image: "/sports/running.jpg",
    title: "Sortie running",
    meta: "Tous niveaux bienvenus !",
    when: "Dimanche • 9h",
    distance: "3,5 km",
    action: "join",
  },
];

const CHIPS: { sport: SportType | null; label: string }[] = [
  { sport: null, label: "Tous" },
  { sport: "football", label: "Foot" },
  { sport: "basketball", label: "Basket" },
  { sport: "tennis", label: "Tennis" },
  { sport: "running", label: "Running" },
];

/**
 * Maquette de téléphone reproduisant l'écran Explorer de l'app (image décorative :
 * masquée aux lecteurs d'écran, le texte voisin décrit le fonctionnement).
 */
export function PhoneMockup({ className }: { className?: string }) {
  return (
    <div aria-hidden className={className}>
      <div className="relative w-[280px] rounded-[44px] border-[10px] border-night-950 bg-night-950 shadow-lg ring-1 ring-white/10">
        {/* Encoche */}
        <div className="absolute top-0 left-1/2 z-10 h-6 w-28 -translate-x-1/2 rounded-b-2xl bg-night-950" />

        <div className="overflow-hidden rounded-[34px] bg-sand-50">
          {/* En-tête sombre */}
          <div className="sl-dark px-4 pt-8 pb-3">
            <div className="flex items-center justify-between text-[10px] font-semibold text-white">
              <span className="absolute top-2 left-7">9:41</span>
            </div>
            <Logo variant="dark" size="sm" href={null} className="mx-auto [&_svg]:size-6 [&>span>span]:text-base" />
            <div className="mt-3 flex items-center justify-between">
              <p className="flex items-center gap-1.5 font-display text-xs font-bold text-white">
                <MapPin className="size-3.5 text-mint-500" />
                Aix-en-Provence
              </p>
              <span className="flex size-6 items-center justify-center rounded-md border border-night-700 text-white">
                <SlidersHorizontal className="size-3" />
              </span>
            </div>
            <div className="mt-3 flex justify-between">
              {CHIPS.map(({ sport, label }, index) => (
                <div key={label} className="flex flex-col items-center gap-1">
                  <span
                    className={
                      index === 0
                        ? "flex size-8 items-center justify-center rounded-full border-[1.5px] border-mint-500 bg-mint-500 text-night-950"
                        : "flex size-8 items-center justify-center rounded-full border-[1.5px] border-mint-500 text-white"
                    }
                  >
                    {sport ? <SportIcon sport={sport} className="size-3.5" /> : <SportIcon sport="basketball" className="size-3.5" />}
                  </span>
                  <span className={index === 0 ? "text-[8px] font-semibold text-mint-500" : "text-[8px] font-semibold text-white/80"}>
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Liste d'annonces */}
          <div className="space-y-2 px-2.5 py-2.5">
            {SAMPLE_ACTIVITIES.map((activity) => (
              <div key={activity.title} className="flex gap-2.5 rounded-xl bg-white p-2 shadow-md">
                <div className="relative size-14 shrink-0 overflow-hidden rounded-md">
                  <Image src={activity.image} alt="" fill sizes="56px" className="object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-display text-[11px] font-bold text-ink">{activity.title}</p>
                  <p className="truncate text-[8.5px] text-gray-400">{activity.meta}</p>
                  <p className="text-[8.5px] text-gray-400">{activity.when}</p>
                  <div className="mt-1 flex items-center justify-between">
                    <span className="flex items-center gap-0.5 text-[8.5px] text-gray-400">
                      <MapPin className="size-2.5" />
                      {activity.distance}
                    </span>
                    <span
                      className={
                        activity.action === "join"
                          ? "rounded-[5px] bg-mint-500 px-2 py-0.5 font-display text-[8.5px] font-bold text-night-950"
                          : "rounded-[5px] border border-mint-500 px-2 py-0.5 font-display text-[8.5px] font-bold text-mint-700"
                      }
                    >
                      {activity.action === "join" ? "Rejoindre" : "Contacter"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Barre de navigation */}
          <div className="grid grid-cols-5 items-center bg-night-950 px-1 pt-1.5 pb-3 text-[7.5px] font-semibold text-white/65">
            <span className="flex flex-col items-center gap-0.5 text-mint-500">
              <House className="size-3.5" />
              Explorer
            </span>
            <span className="flex flex-col items-center gap-0.5">
              <MessageCircle className="size-3.5" />
              Messages
            </span>
            <span className="flex justify-center">
              <span className="-mt-4 flex size-8 items-center justify-center rounded-full bg-mint-500 text-night-950 ring-2 ring-night-950">
                <Plus className="size-4" strokeWidth={2.5} />
              </span>
            </span>
            <span className="flex flex-col items-center gap-0.5">
              <CalendarCheck className="size-3.5" />
              Activités
            </span>
            <span className="flex flex-col items-center gap-0.5">
              <User className="size-3.5" />
              Profil
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
