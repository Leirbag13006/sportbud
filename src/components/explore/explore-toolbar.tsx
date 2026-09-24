"use client";

import { List, Loader2, Map as MapIcon, MapPin, SlidersHorizontal } from "lucide-react";
import type { ReactNode } from "react";

import { PhotoBackdrop } from "@/components/brand/photo-backdrop";
import { Emoji, SportIcon } from "@/components/brand/sport-icon";
import { Logo } from "@/components/layout/logo";
import { getSport, SPORTS } from "@/config/sports";
import type { SportType } from "@/db/schema";
import { cn } from "@/lib/utils";

export type ExploreViewMode = "list" | "map";

interface ExploreToolbarProps {
  view: ExploreViewMode;
  onViewChange: (view: ExploreViewMode) => void;
  /** Masqué dans la vue côte à côte (grand écran), où liste et carte sont toutes deux visibles. */
  showViewToggle?: boolean;
  sport: SportType | null;
  onSportChange: (sport: SportType | null) => void;
  activeFilterCount: number;
  onOpenFilters: () => void;
  /** Ville de l'utilisateur (null si inconnue). */
  city: string | null;
  hasPosition: boolean;
  isLocating: boolean;
  onRequestLocation: () => void;
}

/**
 * En-tête sombre de l'Explorer (design system) : localisation, bascule Liste / Carte,
 * filtres et rangée de pastilles de sports rondes à contour menthe.
 */
export function ExploreToolbar({
  view,
  onViewChange,
  showViewToggle = true,
  sport,
  onSportChange,
  activeFilterCount,
  onOpenFilters,
  city,
  hasPosition,
  isLocating,
  onRequestLocation,
}: ExploreToolbarProps) {
  return (
    <div className="sl-dark relative shrink-0 overflow-hidden pt-[max(0.75rem,env(safe-area-inset-top))] pb-4">
      {/* Photo N&B du sport sélectionné (fondu à chaque changement), groupe d'amis pour « Tous ». */}
      <PhotoBackdrop
        key={sport ?? "all"}
        src={sport ? getSport(sport).image : "/images/silhouettes-sunset.jpg"}
        blur="sm"
        veil="left"
        position="center 40%"
        priority
        className="animate-in duration-700 fade-in motion-reduce:animate-none"
      />
      <div className="relative mx-auto w-full max-w-5xl space-y-4">
        {/* Logo sur mobile (sur desktop, il est dans l'en-tête du site). */}
        <div className="flex items-center justify-between px-4 md:hidden">
          <Logo variant="dark" size="sm" />
        </div>

        <div className="flex items-center justify-between gap-3 px-4 md:px-6 md:pt-2">
          <h1 className="sr-only">Explorer les activités</h1>
          {/* Localisation (« 📍 Aix-en-Provence ») : invite à l'activer si elle est inconnue. */}
          {hasPosition ? (
            <p className="flex min-w-0 items-center gap-2 font-display text-lg font-bold text-white md:text-xl">
              <MapPin className="size-5 shrink-0 text-mint-500" aria-hidden />
              <span className="truncate">{city ?? "Autour de toi"}</span>
            </p>
          ) : (
            <button
              type="button"
              onClick={onRequestLocation}
              className="flex min-w-0 items-center gap-2 rounded-lg font-display text-lg font-bold text-white outline-none focus-visible:ring-3 focus-visible:ring-ring md:text-xl"
            >
              {isLocating ? (
                <Loader2 className="size-5 shrink-0 animate-spin text-mint-500" aria-hidden />
              ) : (
                <MapPin className="size-5 shrink-0 text-mint-500" aria-hidden />
              )}
              <span className="truncate underline decoration-mint-500 decoration-2 underline-offset-4">
                {isLocating ? "Localisation…" : "Active ta localisation"}
              </span>
            </button>
          )}

          <div className="flex shrink-0 items-center gap-2">
            {showViewToggle && (
              <div role="group" aria-label="Affichage" className="flex rounded-lg border border-night-700 bg-night-950/60 p-1">
                {(
                  [
                    ["list", "Liste", List],
                    ["map", "Carte", MapIcon],
                  ] as const
                ).map(([value, label, Icon]) => (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={view === value}
                    onClick={() => onViewChange(value)}
                    className={cn(
                      "flex h-8 items-center gap-1.5 rounded-md px-3 font-display text-xs font-bold transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring",
                      view === value ? "bg-mint-500 text-night-950" : "text-white/75 hover:text-white",
                  )}
                >
                  <Icon className="size-4" aria-hidden />
                  <span className="hidden sm:inline">{label}</span>
                  <span className="sr-only sm:hidden">{label}</span>
                </button>
              ))}
            </div>
            )}

            <button
              type="button"
              onClick={onOpenFilters}
              aria-label={activeFilterCount > 0 ? `Filtres (${activeFilterCount} actifs)` : "Filtres"}
              className={cn(
                "relative flex size-10 items-center justify-center rounded-lg border border-night-700 bg-night-950/60 text-white transition-colors outline-none hover:border-mint-500 focus-visible:ring-3 focus-visible:ring-ring",
                activeFilterCount > 0 && "border-mint-500 text-mint-500",
              )}
            >
              <SlidersHorizontal className="size-5" aria-hidden />
              {activeFilterCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex size-5 items-center justify-center rounded-full bg-mint-500 font-display text-[11px] font-bold text-night-950">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Pastilles de sports : pictogramme 3D dans un cercle translucide, contour menthe + halo si actif. */}
        <div
          role="group"
          aria-label="Filtrer par sport"
          className="flex gap-4 overflow-x-auto px-4 pt-1 pb-1 [scrollbar-width:none] md:px-6 [&::-webkit-scrollbar]:hidden"
        >
          <SportChip label="Tous" selected={sport === null} onClick={() => onSportChange(null)}>
            <Emoji name="sparkles" className="size-7" />
          </SportChip>
          {SPORTS.map((option) => (
            <SportChip
              key={option.value}
              label={option.label}
              selected={sport === option.value}
              onClick={() => onSportChange(sport === option.value ? null : option.value)}
            >
              <SportIcon sport={option.value} className="size-7" />
            </SportChip>
          ))}
        </div>
      </div>
    </div>
  );
}

interface SportChipProps {
  label: string;
  selected: boolean;
  onClick: () => void;
  children: ReactNode;
}

function SportChip({ label, selected, onClick, children }: SportChipProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className="group flex w-16 shrink-0 flex-col items-center gap-1.5 outline-none"
    >
      <span
        className={cn(
          "flex size-14 items-center justify-center rounded-full border-2 backdrop-blur-sm transition-all duration-150 ease-brand group-focus-visible:ring-3 group-focus-visible:ring-ring [&>img]:transition-transform [&>img]:duration-150",
          selected
            ? "border-mint-500 bg-mint-500/20 shadow-glow [&>img]:scale-110"
            : "border-white/15 bg-white/[0.06] group-hover:border-white/35 group-hover:[&>img]:scale-110",
        )}
      >
        {children}
      </span>
      <span
        className={cn(
          "font-display text-[11px] font-semibold whitespace-nowrap",
          selected ? "text-mint-500" : "text-white/80",
        )}
      >
        {label}
      </span>
    </button>
  );
}
