"use client";

import { LocateFixed, X } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { SPORT_LEVELS } from "@/config/sport-levels";
import type { SportLevel } from "@/db/schema";
import { useMediaQuery } from "@/hooks/use-media-query";
import { pluralize } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  DEFAULT_FILTERS,
  DISTANCE_OPTIONS,
  WHEN_OPTIONS,
  type ExploreFilters,
  type SortOrder,
} from "./filters";

interface FiltersSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: ExploreFilters;
  onChange: (filters: ExploreFilters) => void;
  /** Nombre de résultats avec les filtres actuels. */
  resultCount: number;
  hasPosition: boolean;
  onRequestLocation: () => void;
}

/** Panneau des filtres avancés : tri, distance, date, niveau, places disponibles. */
export function FiltersSheet({
  open,
  onOpenChange,
  filters,
  onChange,
  resultCount,
  hasPosition,
  onRequestLocation,
}: FiltersSheetProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const set = <K extends keyof ExploreFilters>(key: K, value: ExploreFilters[K]) => onChange({ ...filters, [key]: value });

  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      swipeDirection={isDesktop ? "right" : "down"}
      showSwipeHandle={!isDesktop}
    >
      <DrawerContent className="md:shadow-xl md:data-[swipe-axis=x]:top-16">
        <DrawerHeader className="flex-row items-center justify-between text-left">
          <DrawerTitle className="text-lg font-semibold">Filtres</DrawerTitle>
          <DrawerClose render={<Button variant="ghost" size="icon-sm" aria-label="Fermer" />}>
            <X />
          </DrawerClose>
        </DrawerHeader>

        <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-4 py-4">
          {!hasPosition && (
            <button
              type="button"
              onClick={onRequestLocation}
              className="flex w-full items-center gap-3 rounded-xl border border-dashed p-3 text-left text-sm transition-colors hover:bg-muted"
            >
              <LocateFixed className="size-5 shrink-0 text-brand-text" aria-hidden />
              <span>
                <span className="font-medium">Active ta localisation</span>
                <span className="block text-muted-foreground">pour trier et filtrer par distance.</span>
              </span>
            </button>
          )}

          <FilterGroup legend="Trier par">
            {(
              [
                ["date", "Date la plus proche"],
                ["distance", "Distance"],
              ] as [SortOrder, string][]
            ).map(([value, label]) => (
              <Chip
                key={value}
                name="sort"
                checked={filters.sort === value}
                disabled={value === "distance" && !hasPosition}
                onChange={() => set("sort", value)}
              >
                {label}
              </Chip>
            ))}
          </FilterGroup>

          <FilterGroup legend="Distance">
            <Chip name="distance" checked={filters.maxDistanceKm === null} onChange={() => set("maxDistanceKm", null)}>
              Partout
            </Chip>
            {DISTANCE_OPTIONS.map((km) => (
              <Chip
                key={km}
                name="distance"
                checked={filters.maxDistanceKm === km}
                disabled={!hasPosition}
                onChange={() => set("maxDistanceKm", km)}
              >
                &lt; {km} km
              </Chip>
            ))}
          </FilterGroup>

          <FilterGroup legend="Quand ?">
            {WHEN_OPTIONS.map((option) => (
              <Chip
                key={option.value}
                name="when"
                checked={filters.when === option.value}
                onChange={() => set("when", option.value)}
              >
                {option.label}
              </Chip>
            ))}
          </FilterGroup>

          <FilterGroup legend="Mon niveau">
            <Chip name="level" checked={filters.level === null} onChange={() => set("level", null)}>
              Tous
            </Chip>
            {SPORT_LEVELS.map((level) => (
              <Chip
                key={level.value}
                name="level"
                checked={filters.level === level.value}
                onChange={() => set("level", level.value as SportLevel)}
              >
                {level.label}
              </Chip>
            ))}
          </FilterGroup>

          <ToggleRow
            title="Places disponibles uniquement"
            description="Masquer les activités complètes"
            checked={filters.onlyAvailable}
            onChange={(checked) => set("onlyAvailable", checked)}
          />
          <ToggleRow
            title="Gratuites uniquement"
            description="Masquer les séances payantes (terrain, court…)"
            checked={filters.onlyFree}
            onChange={(checked) => set("onlyFree", checked)}
          />
        </div>

        <DrawerFooter className="flex-row gap-2 border-t pt-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <Button variant="outline" className="h-11 flex-1" onClick={() => onChange({ ...DEFAULT_FILTERS, sport: filters.sport })}>
            Réinitialiser
          </Button>
          <Button className="h-11 flex-[2]" onClick={() => onOpenChange(false)}>
            Voir {pluralize(resultCount, "activité")}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

function FilterGroup({ legend, children }: { legend: string; children: ReactNode }) {
  return (
    <fieldset className="space-y-2.5">
      <legend className="text-sm font-semibold">{legend}</legend>
      <div className="flex flex-wrap gap-2">{children}</div>
    </fieldset>
  );
}

interface ChipProps {
  name: string;
  checked: boolean;
  disabled?: boolean;
  onChange: () => void;
  children: ReactNode;
}

/** Pastille de choix unique (bouton radio natif stylé). */
function Chip({ name, checked, disabled, onChange, children }: ChipProps) {
  return (
    <label
      className={cn(
        "cursor-pointer rounded-full border px-3.5 py-1.5 text-sm transition-colors hover:bg-muted has-focus-visible:ring-3 has-focus-visible:ring-ring/50",
        checked && "border-primary bg-brand-soft font-medium text-brand-text hover:bg-brand-soft",
        disabled && "cursor-not-allowed opacity-50 hover:bg-transparent",
      )}
    >
      <input type="radio" name={name} checked={checked} disabled={disabled} onChange={onChange} className="sr-only" />
      {children}
    </label>
  );
}

interface ToggleRowProps {
  title: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

/** Interrupteur on / off piloté par une case à cocher native (accessible au clavier). */
function ToggleRow({ title, description, checked, onChange }: ToggleRowProps) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 rounded-card border p-3">
      <span className="text-sm">
        <span className="font-medium text-ink">{title}</span>
        <span className="block">{description}</span>
      </span>
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="peer sr-only" />
      <span
        aria-hidden
        className="relative h-6 w-11 shrink-0 rounded-full bg-gray-400/40 transition-colors peer-checked:bg-mint-500 peer-focus-visible:ring-3 peer-focus-visible:ring-ring after:absolute after:top-0.5 after:left-0.5 after:size-5 after:rounded-full after:bg-white after:shadow after:transition-transform peer-checked:after:translate-x-5"
      />
    </label>
  );
}
