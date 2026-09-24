/** Centre par défaut si la géolocalisation est refusée ou indisponible : Marseille, Vieux-Port. */
export const DEFAULT_CENTER: [number, number] = [43.2951, 5.3744];
export const DEFAULT_ZOOM = 13;
/** Zoom appliqué une fois la position de l'utilisateur connue. */
export const USER_ZOOM = 14;

/**
 * Tuiles OpenStreetMap standard : gratuites, sans clé, avec attribution obligatoire.
 * Politique d'usage : https://operations.osmfoundation.org/policies/tiles/ (adaptée à une démo).
 */
export const TILE_LAYER = {
  url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  maxZoom: 19,
} as const;
