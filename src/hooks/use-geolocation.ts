"use client";

import { useCallback, useEffect, useState } from "react";

/** Autorisation du navigateur pour la géolocalisation. `unknown` : pas encore vérifiée. */
export type GeolocationPermission = "unknown" | "prompt" | "granted" | "denied" | "unsupported";

export type GeolocationState =
  /** Localisation pas encore demandée (en attente de l'accord de l'utilisateur). */
  | { status: "idle"; position: null }
  /** Recherche de la position en cours. */
  | { status: "locating"; position: null }
  | { status: "granted"; position: [number, number]; accuracy: number }
  /** Refusée par l'utilisateur, indisponible ou délai dépassé. */
  | { status: "denied" | "unavailable"; position: null };

export interface UseGeolocationResult {
  state: GeolocationState;
  permission: GeolocationPermission;
  /** Lance la localisation (déclenche la demande native du navigateur si nécessaire). */
  request: () => void;
}

/**
 * Suit la position de l'appareil (API Geolocation du navigateur).
 * La localisation ne démarre pas d'elle-même : seulement si elle est déjà autorisée,
 * ou après `request()` (bouton « Autoriser » de la fenêtre d'explication).
 */
export function useGeolocation(): UseGeolocationResult {
  const [state, setState] = useState<GeolocationState>({ status: "idle", position: null });
  const [permission, setPermission] = useState<GeolocationPermission>("unknown");
  const [shouldWatch, setShouldWatch] = useState(false);

  // Lit l'autorisation actuelle et suit ses changements (ex. réglage modifié dans le navigateur).
  useEffect(() => {
    let status: PermissionStatus | null = null;
    let cancelled = false;
    const sync = () => {
      if (!status || cancelled) return;
      setPermission(status.state);
      if (status.state === "granted") setShouldWatch(true);
    };

    const resolve = async () => {
      if (!("geolocation" in navigator)) return "unsupported" as const;
      // Navigateurs sans API Permissions (anciens Safari) : on considère qu'il faut demander.
      if (!navigator.permissions?.query) return "prompt" as const;
      try {
        status = await navigator.permissions.query({ name: "geolocation" });
        status.addEventListener("change", sync);
        return null;
      } catch {
        return "prompt" as const;
      }
    };

    resolve().then((fallback) => {
      if (cancelled) return;
      if (fallback) setPermission(fallback);
      else sync();
    });

    return () => {
      cancelled = true;
      status?.removeEventListener("change", sync);
    };
  }, []);

  // Suivi de la position une fois la localisation autorisée ou demandée.
  useEffect(() => {
    if (!shouldWatch || !("geolocation" in navigator)) return;

    const watchId = navigator.geolocation.watchPosition(
      ({ coords }) =>
        setState({
          status: "granted",
          position: [coords.latitude, coords.longitude],
          accuracy: coords.accuracy,
        }),
      (error) => {
        if (error.code === error.PERMISSION_DENIED) setPermission("denied");
        setState((previous) =>
          // Une erreur ponctuelle après une première position ne doit pas effacer le marqueur.
          previous.status === "granted"
            ? previous
            : {
                status: error.code === error.PERMISSION_DENIED ? "denied" : "unavailable",
                position: null,
              },
        );
      },
      { enableHighAccuracy: false, maximumAge: 60_000, timeout: 10_000 },
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [shouldWatch]);

  const request = useCallback(() => setShouldWatch(true), []);

  // États dérivés : API absente, ou surveillance lancée sans résultat encore reçu.
  const effectiveState: GeolocationState =
    permission === "unsupported"
      ? { status: "unavailable", position: null }
      : shouldWatch && state.status === "idle"
        ? { status: "locating", position: null }
        : state;

  return { state: effectiveState, permission, request };
}
