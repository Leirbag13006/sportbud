"use client";

import { List, Map as MapIcon, SlidersHorizontal } from "lucide-react";

import { SPORTS } from "@/config/sports";
import type { SportType } from "@/db/schema";
import { cn } from "@/lib/utils";

export type ExploreViewMode = "list" | "map";

interface ExploreToolbarProps {
  view: ExploreViewMode;
  onViewChange: (view: ExploreViewMode) => void;
  sport: SportType | null;
  onSportChange: (sport: SportType | null) => void;
  activeFilterCount: number;
  onOpenFilters: () => void;
}

/** Barre d'outils Explorer : bascule Liste / Carte, filtres et pastilles de sports. */
export function ExploreToolbar({
  view,
  onViewChange,
  sport,
  onSportChange,
  activeFilterCount,
  onOpenFilters,
}: ExploreToolbarProps) {
  return (
    <div className="shrink-0 space-y-3 border-b bg-background/95 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3 backdrop-blur">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3 px-4 md:px-6">
        <h1 className="text-xl font-semibold tracking-tight md:text-2xl">Explorer</h1>

        <div role="group" aria-label="Affichage" className="flex rounded-full bg-muted p-1">
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
                "flex h-8 items-center gap-1.5 rounded-full px-3.5 text-sm font-medium transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                view === value ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="size-4" aria-hidden />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Pastilles défilantes : filtres + sports. */}
      <div className="mx-auto w-full max-w-5xl">
        <div className="flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] md:px-6 [&::-webkit-scrollbar]:hidden">
          <button
            type="button"
            onClick={onOpenFilters}
            className={cn(
              "flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-3.5 text-sm font-medium transition-colors outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50",
              activeFilterCount > 0 && "border-primary text-primary",
            )}
          >
            <SlidersHorizontal className="size-4" aria-hidden />
            Filtres
            {activeFilterCount > 0 && (
              <span className="flex size-5 items-center justify-center rounded-full bg-primary text-[11px] text-primary-foreground">
                {activeFilterCount}
              </span>
            )}
          </button>

          <span aria-hidden className="my-1.5 w-px shrink-0 bg-border" />

          <SportChip selected={sport === null} onClick={() => onSportChange(null)}>
            Tous
          </SportChip>
          {SPORTS.map((option) => (
            <SportChip
              key={option.value}
              selected={sport === option.value}
              onClick={() => onSportChange(sport === option.value ? null : option.value)}
            >
              <span aria-hidden>{option.emoji}</span> {option.label}
            </SportChip>
          ))}
        </div>
      </div>
    </div>
  );
}

function SportChip({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={cn(
        "flex h-9 shrink-0 items-center gap-1.5 rounded-full px-3.5 text-sm font-medium whitespace-nowrap transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
        selected ? "bg-foreground text-background" : "bg-muted text-foreground hover:bg-muted/70",
      )}
    >
      {children}
    </button>
  );
}
