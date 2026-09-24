"use client";

import { SearchX } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { MyApplicationSummary, ReceivedApplication } from "@/lib/applications/types";
import { pluralize } from "@/lib/format";
import { ActivityCard } from "./activity-card";
import type { ExploreItem } from "./filters";

interface ActivityListProps {
  items: ExploreItem[];
  totalCount: number;
  currentUserId: string;
  myApplications: Record<string, MyApplicationSummary>;
  receivedApplications: ReceivedApplication[];
  onOpen: (activityId: string) => void;
  onResetFilters: () => void;
  onCreate: () => void;
}

/** Liste des activités filtrées, en cartes (une colonne sur mobile, deux sur grand écran). */
export function ActivityList({
  items,
  totalCount,
  currentUserId,
  myApplications,
  receivedApplications,
  onOpen,
  onResetFilters,
  onCreate,
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

  return (
    <div className="mx-auto w-full max-w-5xl px-4 pt-4 pb-24 md:px-6">
      <div className="mb-5 flex items-end justify-between gap-4">
        <h2 className="sl-bar text-lg font-extrabold md:text-xl">
          Activités <span className="text-brand-text">près de toi</span>
        </h2>
        <p className="text-sm" aria-live="polite">
          {pluralize(items.length, "séance", "séances")}
        </p>
      </div>
      <ul className="grid gap-3 lg:grid-cols-2">
        {items.map(({ activity, distanceKm }, index) => (
          <li key={activity.id}>
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
              priority={index < 4}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
