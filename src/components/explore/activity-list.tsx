"use client";

import { SearchX, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { MyApplicationSummary, ReceivedApplication } from "@/lib/applications/types";
import { pluralize } from "@/lib/format";
import { cn } from "@/lib/utils";
import { ActivityCard } from "./activity-card";
import type { ExploreItem } from "./filters";

interface ActivityListProps {
  items: ExploreItem[];
  /** Séances mises en avant (« Pour toi »), affichées avant les autres. */
  recommended?: ExploreItem[];
  totalCount: number;
  currentUserId: string;
  myApplications: Record<string, MyApplicationSummary>;
  receivedApplications: ReceivedApplication[];
  onOpen: (activityId: string) => void;
  onResetFilters: () => void;
  onCreate: () => void;
  /** grid : pleine largeur (2 colonnes sur grand écran) ; column : colonne unique à côté de la carte. */
  layout?: "grid" | "column";
  /** Survol d'une carte (vue côte à côte : met en avant son marqueur). */
  onHover?: (activityId: string | null) => void;
}

/** Liste des activités filtrées, en cartes (une colonne sur mobile, deux sur grand écran, une à côté de la carte). */
export function ActivityList({
  items,
  recommended = [],
  totalCount,
  currentUserId,
  myApplications,
  receivedApplications,
  onOpen,
  onResetFilters,
  onCreate,
  layout = "grid",
  onHover,
}: ActivityListProps) {
  if (items.length === 0) {
    const isFiltered = totalCount > 0;
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-8 py-16 text-center">
        <div className="flex size-14 items-center justify-center rounded-full bg-brand-soft text-brand-text">
          <SearchX className="size-7" aria-hidden />
        </div>
        <h2 className="text-lg font-extrabold">{isFiltered ? "Aucune activité ne correspond" : "Aucune activité pour l'instant"}</h2>
        <p className="max-w-xs text-sm text-muted-foreground">
          {isFiltered
            ? "Essaie d'élargir tes filtres, ou propose toi-même une séance."
            : "Sois le premier à proposer une séance près de chez toi !"}
        </p>
        <div className="flex gap-2">
          {isFiltered && (
            <Button variant="outline" onClick={onResetFilters}>
              Réinitialiser les filtres
            </Button>
          )}
          <Button onClick={onCreate}>Créer une activité</Button>
        </div>
      </div>
    );
  }

  const recommendedIds = new Set(recommended.map(({ activity }) => activity.id));
  const others = items.filter(({ activity }) => !recommendedIds.has(activity.id));

  const renderCards = (list: ExploreItem[], priorityCount: number) => (
    <ul className={cn("grid gap-3", layout === "grid" && "lg:grid-cols-2")}>
      {list.map(({ activity, distanceKm }, index) => (
        <li
          key={activity.id}
          className="min-w-0"
          onMouseEnter={onHover && (() => onHover(activity.id))}
          onMouseLeave={onHover && (() => onHover(null))}
        >
          <ActivityCard
            activity={activity}
            distanceKm={distanceKm}
            isOwn={activity.creatorId === currentUserId}
            myApplication={myApplications[activity.id] ?? null}
            pendingCount={
              receivedApplications.filter(
                (application) => application.activityId === activity.id && application.status === "pending",
              ).length
            }
            onOpen={() => onOpen(activity.id)}
            priority={index < priorityCount}
          />
        </li>
      ))}
    </ul>
  );

  return (
    <div
      className={cn(
        "w-full space-y-10 px-4",
        layout === "grid" ? "mx-auto max-w-5xl pt-4 pb-24 md:px-6" : "pt-5 pb-8",
      )}
    >
      {recommended.length > 0 && (
        <section aria-labelledby="for-you-title">
          <div className="mb-5 flex items-end justify-between gap-4">
            <h2 id="for-you-title" className="sl-bar text-lg font-extrabold md:text-xl">
              <Sparkles className="mr-2 inline size-5 align-[-3px] text-brand-text" aria-hidden />
              Pour <span className="text-brand-text">toi</span>
            </h2>
            <p className="text-sm">Tes sports, à ton niveau</p>
          </div>
          {renderCards(recommended, 4)}
        </section>
      )}

      {others.length > 0 && (
        <section aria-labelledby="all-activities-title">
          <div className="mb-5 flex items-end justify-between gap-4">
            <h2 id="all-activities-title" className="sl-bar text-lg font-extrabold md:text-xl">
              {recommended.length > 0 ? (
                <>
                  Toutes les <span className="text-brand-text">activités</span>
                </>
              ) : (
                <>
                  Activités <span className="text-brand-text">près de toi</span>
                </>
              )}
            </h2>
            <p className="text-sm" aria-live="polite">
              {pluralize(items.length, "séance", "séances")}
            </p>
          </div>
          {renderCards(others, recommended.length > 0 ? 0 : 4)}
        </section>
      )}
    </div>
  );
}
