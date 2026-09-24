/** Centre par défaut si la géolocalisation est refusée ou indisponible : Marseille, Vieux-Port. */
export const DEFAULT_CENTER: [number, number] = [43.2951, 5.3744];
export const DEFAULT_ZOOM = 13;
/** Zoom appliqué une fois la position de l'utilisateur connue. */
export const USER_ZOOM = 14;

/** Zoom maximal (le fond vectoriel reste net même au-delà du niveau de détail des tuiles). */
export const MAX_ZOOM = 19;
