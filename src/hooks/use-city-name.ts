"use client";

import { useEffect, useState } from "react";

import { reverseGeocodeCity } from "@/lib/geocoding";

/** Arrondi (~1 km) : évite de relancer la recherche à chaque petit déplacement. */
const round = (value: number) => Math.round(value * 100) / 100;

/** Ville de l'utilisateur, déduite de sa position (géocodage inverse). */
export function useCityName(position: [number, number] | null) {
  const [city, setCity] = useState<string | null>(null);
  const lat = position ? round(position[0]) : null;
  const lng = position ? round(position[1]) : null;

  useEffect(() => {
    if (lat === null || lng === null) return;
    const controller = new AbortController();
    reverseGeocodeCity([lat, lng], { signal: controller.signal })
      .then((name) => {
        if (!controller.signal.aborted) setCity(name);
      })
      .catch(() => {
        // Service indisponible : on garde le libellé générique.
      });
    return () => controller.abort();
  }, [lat, lng]);

  return position ? city : null;
}
