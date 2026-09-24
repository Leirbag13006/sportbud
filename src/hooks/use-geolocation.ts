"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

export type GeolocationState =
  /** Recherche de la position en cours. */
  | { status: "locating"; position: null }
  | { status: "granted"; position: [number, number]; accuracy: number }
  /** Refusée par l'utilisateur, indisponible ou délai dépassé. */
  | { status: "denied" | "unavailable"; position: null };

/**
 * Suit la position de l'appareil (API Geolocation du navigateur).
 * La position est mise à jour si l'utilisateur se déplace.
 */
export function useGeolocation(): GeolocationState {
  // Support de l'API : supposé vrai côté serveur pour que le premier rendu soit identique
  // dans le navigateur (hydratation), puis vérifié réellement côté client.
  const isSupported = useSyncExternalStore(
    noopSubscribe,
    () => "geolocation" in navigator,
    () => true,
  );
  const [state, setState] = useState<GeolocationState>({ status: "locating", position: null });

  useEffect(() => {
    if (!isSupported) return;

    const watchId = navigator.geolocation.watchPosition(
      ({ coords }) =>
        setState({
          status: "granted",
          position: [coords.latitude, coords.longitude],
          accuracy: coords.accuracy,
        }),
      (error) =>
        setState((previous) =>
          // Une erreur ponctuelle après une première position ne doit pas effacer le marqueur.
          previous.status === "granted"
            ? previous
            : {
                status: error.code === error.PERMISSION_DENIED ? "denied" : "unavailable",
                position: null,
              },
        ),
      { enableHighAccuracy: false, maximumAge: 60_000, timeout: 10_000 },
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [isSupported]);

  return isSupported ? state : { status: "unavailable", position: null };
}

/** Le support de l'API ne change jamais : aucun abonnement nécessaire. */
const noopSubscribe = () => () => {};
