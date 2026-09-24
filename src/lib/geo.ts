/** Rayon moyen de la Terre, en kilomètres. */
const EARTH_RADIUS_KM = 6371;

const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

/** Distance à vol d'oiseau entre deux points (formule de haversine), en kilomètres. */
export function distanceKm([lat1, lng1]: [number, number], [lat2, lng2]: [number, number]) {
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 + Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(a));
}

const kmFormatter = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 1 });

/** « 350 m », « 1,2 km », « 14 km ». */
export function formatDistance(km: number) {
  if (km < 1) return `${Math.max(50, Math.round((km * 1000) / 50) * 50)} m`;
  if (km < 10) return `${kmFormatter.format(km)} km`;
  return `${Math.round(km)} km`;
}
