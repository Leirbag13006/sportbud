"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { ActivitySheet } from "@/components/activities/activity-sheet";
import { LocationPermissionDialog } from "@/components/map/location-permission-dialog";
import type { MapUser } from "@/components/map/marker-icons";
import { MapView } from "@/components/map/map-view";
import { useCityName } from "@/hooks/use-city-name";
import { useLocationAccess } from "@/hooks/use-location-access";
import type { ExploreActivity } from "@/lib/activities/types";
import type { MyApplicationSummary, ReceivedApplication } from "@/lib/applications/types";
import { ActivityList } from "./activity-list";
import { ExploreToolbar, type ExploreViewMode } from "./explore-toolbar";
import { applyFilters, countActiveFilters, DEFAULT_FILTERS, type ExploreFilters } from "./filters";
import { FiltersSheet } from "./filters-sheet";

interface ExploreViewProps {
  activities: ExploreActivity[];
  currentUser: MapUser & { id: string };
  myApplications: Record<string, MyApplicationSummary>;
  receivedApplications: ReceivedApplication[];
  initialView: ExploreViewMode;
  /** Activité à ouvrir au chargement (lien « Voir sur la carte »). */
  initialSelectedId?: string;
  /** Jeton de création (bouton « + » de la navigation) : chaque nouvelle valeur lance une création. */
  createToken?: string;
}

/**
 * Écran d'accueil « Explorer » : liste de cartes (par défaut) ou carte interactive,
 * avec filtres partagés, détail d'activité et création.
 */
export function ExploreView({
  activities,
  currentUser,
  myApplications,
  receivedApplications,
  initialView,
  initialSelectedId,
  createToken,
}: ExploreViewProps) {
  const location = useLocationAccess();
  const city = useCityName(location.position);
  const [view, setView] = useState<ExploreViewMode>(initialView);
  const [filters, setFilters] = useState<ExploreFilters>(DEFAULT_FILTERS);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(initialSelectedId ?? null);
  const [focusId, setFocusId] = useState<string | null>(initialSelectedId ?? null);
  const [createRequest, setCreateRequest] = useState(0);
  const [isCreating, setIsCreating] = useState(false);

  const items = useMemo(
    () => applyFilters(activities, filters, location.position),
    [activities, filters, location.position],
  );
  // Le détail s'ouvre même si l'activité est masquée par un filtre (ex. lien depuis le profil).
  const selected = activities.find((activity) => activity.id === selectedId) ?? null;

  const changeView = (next: ExploreViewMode) => {
    setView(next);
    // Mémorise la vue dans l'URL sans recharger la page (retour arrière, partage de lien).
    const url = new URL(window.location.href);
    url.searchParams.delete("activity");
    if (next === "map") url.searchParams.set("view", "map");
    else url.searchParams.delete("view");
    window.history.replaceState(null, "", url);
  };

  /** Création depuis la liste : bascule sur la carte, qui lance le choix du lieu. */
  const startCreation = () => {
    setSelectedId(null);
    changeView("map");
    setCreateRequest((count) => count + 1);
  };

  // Bouton « + » de la navigation : /?create=<jeton>. On lance la création puis on nettoie l'URL.
  // (ajustement d'état pendant le rendu, cf. « You might not need an effect »).
  const [handledCreateToken, setHandledCreateToken] = useState<string | undefined>();
  if (createToken && createToken !== handledCreateToken) {
    setHandledCreateToken(createToken);
    setSelectedId(null);
    setView("map");
    setCreateRequest((count) => count + 1);
  }
  useEffect(() => {
    if (createToken) window.history.replaceState(null, "", "/?view=map");
  }, [createToken]);

  const handleCreated = useCallback((activityId: string) => {
    setSelectedId(activityId);
  }, []);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {!isCreating && (
        <ExploreToolbar
          view={view}
          onViewChange={changeView}
          sport={filters.sport}
          onSportChange={(sport) => setFilters((current) => ({ ...current, sport }))}
          activeFilterCount={countActiveFilters(filters)}
          onOpenFilters={() => setFiltersOpen(true)}
          city={city}
          hasPosition={location.position !== null}
          isLocating={location.isLocating}
          onRequestLocation={location.ensureLocation}
        />
      )}

      {view === "list" ? (
        <div className="relative flex min-h-0 flex-1 flex-col overflow-y-auto">
          <ActivityList
            items={items}
            totalCount={activities.length}
            currentUserId={currentUser.id}
            myApplications={myApplications}
            receivedApplications={receivedApplications}
            onOpen={setSelectedId}
            onResetFilters={() => setFilters(DEFAULT_FILTERS)}
            onCreate={startCreation}
          />
        </div>
      ) : (
        <MapView
          activities={items.map(({ activity }) => activity)}
          currentUser={currentUser}
          userPosition={location.position}
          isLocating={location.isLocating}
          onRequestLocation={location.ensureLocation}
          selectedId={selectedId}
          onSelect={setSelectedId}
          focusId={focusId}
          createRequest={createRequest}
          onCreatingChange={setIsCreating}
          onCreated={handleCreated}
        />
      )}

      <ActivitySheet
        activity={isCreating ? null : selected}
        currentUserId={currentUser.id}
        myApplication={selected ? (myApplications[selected.id] ?? null) : null}
        receivedApplications={
          selected ? receivedApplications.filter((application) => application.activityId === selected.id) : []
        }
        onShowOnMap={
          view === "list" && selected
            ? () => {
                setFocusId(selected.id);
                changeView("map");
              }
            : undefined
        }
        onClose={() => setSelectedId(null)}
      />

      <FiltersSheet
        open={filtersOpen}
        onOpenChange={setFiltersOpen}
        filters={filters}
        onChange={setFilters}
        resultCount={items.length}
        hasPosition={location.position !== null}
        onRequestLocation={() => {
          setFiltersOpen(false);
          location.ensureLocation();
        }}
      />

      <LocationPermissionDialog {...location.dialog} />
    </div>
  );
}
