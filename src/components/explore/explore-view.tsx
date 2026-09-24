"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { ActivitySheet } from "@/components/activities/activity-sheet";
import { LocationPermissionDialog } from "@/components/map/location-permission-dialog";
import type { MapUser } from "@/components/map/marker-icons";
import { MapView } from "@/components/map/map-view";
import { useCityName } from "@/hooks/use-city-name";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useLocationAccess } from "@/hooks/use-location-access";
import type { ExploreActivity } from "@/lib/activities/types";
import type { MyApplicationSummary, ReceivedApplication } from "@/lib/applications/types";
import { ActivityList } from "./activity-list";
import { ExploreToolbar, type ExploreViewMode } from "./explore-toolbar";
import {
  applyFilters,
  countActiveFilters,
  DEFAULT_FILTERS,
  isDefaultFilters,
  pickRecommended,
  type ExploreFilters,
  type ExplorePreferences,
} from "./filters";
import { FiltersSheet } from "./filters-sheet";

interface ExploreViewProps {
  activities: ExploreActivity[];
  currentUser: MapUser & { id: string };
  preferences: ExplorePreferences;
  myApplications: Record<string, MyApplicationSummary>;
  receivedApplications: ReceivedApplication[];
  initialView: ExploreViewMode;
  /** Activité à ouvrir au chargement (lien « Voir sur la carte »). */
  initialSelectedId?: string;
  /** Jeton de création (bouton « + » de la navigation) : chaque nouvelle valeur lance une création. */
  createToken?: string;
}

/** Largeur à partir de laquelle liste et carte s'affichent côte à côte. */
const SPLIT_QUERY = "(min-width: 1280px)";

/**
 * Écran d'accueil « Explorer » : liste de cartes (par défaut) ou carte interactive,
 * avec filtres partagés, détail d'activité et création. Sur grand écran, liste et carte
 * sont côte à côte : survoler une carte met son marqueur en avant, cliquer centre la carte.
 */
export function ExploreView({
  activities,
  currentUser,
  preferences,
  myApplications,
  receivedApplications,
  initialView,
  initialSelectedId,
  createToken,
}: ExploreViewProps) {
  const location = useLocationAccess();
  const gpsCity = useCityName(location.position);
  // Position de référence : la géolocalisation si partagée, sinon la ville choisie à l'accueil.
  const referencePosition = location.position ?? preferences.home?.position ?? null;
  const city = location.position ? gpsCity : (preferences.home?.city ?? null);
  const [view, setView] = useState<ExploreViewMode>(initialView);
  const [filters, setFilters] = useState<ExploreFilters>(DEFAULT_FILTERS);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(initialSelectedId ?? null);
  const [focusId, setFocusId] = useState<string | null>(initialSelectedId ?? null);
  const [createRequest, setCreateRequest] = useState(0);
  const [editRequest, setEditRequest] = useState<{ token: number; activity: ExploreActivity } | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const isSplit = useMediaQuery(SPLIT_QUERY);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [panRequest, setPanRequest] = useState<{ token: number; activityId: string } | null>(null);

  const items = useMemo(
    () => applyFilters(activities, filters, referencePosition),
    [activities, filters, referencePosition],
  );
  const recommended = useMemo(
    () => (isDefaultFilters(filters) ? pickRecommended(items, preferences, currentUser.id) : []),
    [items, filters, preferences, currentUser.id],
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

  /** Modification depuis la fiche : bascule sur la carte, qui ouvre le formulaire pré-rempli. */
  const startEditing = (activity: ExploreActivity) => {
    setSelectedId(null);
    changeView("map");
    setEditRequest((previous) => ({ token: (previous?.token ?? 0) + 1, activity }));
  };

  const handleCreated = useCallback((activityId: string) => {
    setSelectedId(activityId);
  }, []);

  /** Ouverture depuis la liste : en vue côte à côte, la carte se centre aussi sur l'activité. */
  const openFromList = (activityId: string) => {
    setSelectedId(activityId);
    if (isSplit) setPanRequest((previous) => ({ token: (previous?.token ?? 0) + 1, activityId }));
  };

  const activityList = (
    <ActivityList
      items={items}
      recommended={recommended}
      totalCount={activities.length}
      currentUserId={currentUser.id}
      myApplications={myApplications}
      receivedApplications={receivedApplications}
      onOpen={openFromList}
      onResetFilters={() => setFilters(DEFAULT_FILTERS)}
      onCreate={startCreation}
      layout={isSplit ? "column" : "grid"}
      onHover={isSplit ? setHoveredId : undefined}
    />
  );

  const mapView = (
    <MapView
      activities={items.map(({ activity }) => activity)}
      currentUser={currentUser}
      userPosition={location.position}
      homePosition={preferences.home?.position ?? null}
      isLocating={location.isLocating}
      onRequestLocation={location.ensureLocation}
      selectedId={selectedId}
      onSelect={setSelectedId}
      focusId={focusId}
      createRequest={createRequest}
      onCreatingChange={setIsCreating}
      onCreated={handleCreated}
      creatorGender={preferences.gender}
      editRequest={editRequest}
      highlightedId={hoveredId}
      panRequest={panRequest}
    />
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {!isCreating && (
        <ExploreToolbar
          view={view}
          onViewChange={changeView}
          showViewToggle={!isSplit}
          sport={filters.sport}
          onSportChange={(sport) => setFilters((current) => ({ ...current, sport }))}
          activeFilterCount={countActiveFilters(filters)}
          onOpenFilters={() => setFiltersOpen(true)}
          city={city}
          hasPosition={referencePosition !== null}
          isLocating={location.isLocating}
          onRequestLocation={location.ensureLocation}
        />
      )}

      {isSplit ? (
        <div className="flex min-h-0 flex-1">
          {/* Pendant la création, la carte prend toute la largeur pour choisir le lieu. */}
          {!isCreating && (
            <aside aria-label="Liste des activités" className="w-[420px] shrink-0 overflow-y-auto border-r xl:w-[480px]">
              {activityList}
            </aside>
          )}
          {mapView}
        </div>
      ) : view === "list" ? (
        <div className="relative flex min-h-0 flex-1 flex-col overflow-y-auto">{activityList}</div>
      ) : (
        mapView
      )}

      <ActivitySheet
        activity={isCreating ? null : selected}
        currentUserId={currentUser.id}
        myApplication={selected ? (myApplications[selected.id] ?? null) : null}
        receivedApplications={
          selected ? receivedApplications.filter((application) => application.activityId === selected.id) : []
        }
        onShowOnMap={
          view === "list" && !isSplit && selected
            ? () => {
                setFocusId(selected.id);
                changeView("map");
              }
            : undefined
        }
        onClose={() => setSelectedId(null)}
        onEdit={startEditing}
        viewerGender={preferences.gender}
      />

      <FiltersSheet
        open={filtersOpen}
        onOpenChange={setFiltersOpen}
        filters={filters}
        onChange={setFilters}
        resultCount={items.length}
        hasPosition={referencePosition !== null}
        gender={preferences.gender}
        onRequestLocation={() => {
          setFiltersOpen(false);
          location.ensureLocation();
        }}
      />

      <LocationPermissionDialog {...location.dialog} />
    </div>
  );
}
