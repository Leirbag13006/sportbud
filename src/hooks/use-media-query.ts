"use client";

import { useSyncExternalStore } from "react";

/**
 * Vrai si la media query correspond (ex. "(min-width: 768px)").
 * Renvoie `false` pendant le rendu serveur.
 */
export function useMediaQuery(query: string) {
  return useSyncExternalStore(
    (onChange) => {
      const media = window.matchMedia(query);
      media.addEventListener("change", onChange);
      return () => media.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}
