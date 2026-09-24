/**
 * Géocodage (appelé depuis le navigateur) :
 * - Géoplateforme IGN (Base Adresse Nationale) : adresses françaises, gratuite, sans clé,
 *   autocomplétion autorisée — https://geoservices.ign.fr/documentation/services/services-geoplateforme/geocodage
 * - Nominatim (OpenStreetMap) : repli pour le géocodage inverse hors de France (1 requête/s max).
 */

const IGN_URL = "https://data.geopf.fr/geocodage";
const NOMINATIM_URL = "https://nominatim.openstreetmap.org";

export interface AddressSuggestion {
  id: string;
  /** Adresse complète : « 10 Rue Paradis 13001 Marseille ». */
  label: string;
  /** Ligne principale : « 10 Rue Paradis ». */
  name: string;
  /** Ligne secondaire : « 13001 Marseille ». */
  context: string;
  position: [number, number];
}

interface IgnFeature {
  geometry: { coordinates: [number, number] };
  properties: {
    id: string;
    label: string;
    name: string;
    postcode?: string;
    city?: string;
    type: "housenumber" | "street" | "locality" | "municipality";
  };
}

function toSuggestion({ geometry, properties }: IgnFeature): AddressSuggestion {
  const [lng, lat] = geometry.coordinates;
  return {
    id: properties.id,
    label: properties.type === "municipality" ? properties.label : `${properties.name}, ${properties.postcode ?? ""} ${properties.city ?? ""}`.trim(),
    name: properties.name,
    context: [properties.postcode, properties.city].filter(Boolean).join(" "),
    position: [lat, lng],
  };
}

/**
 * Suggestions d'adresses pour une saisie partielle.
 * `near` favorise les résultats proches (position de la carte).
 */
export async function searchAddresses(
  query: string,
  { near, signal }: { near?: [number, number]; signal?: AbortSignal } = {},
): Promise<AddressSuggestion[]> {
  const params = new URLSearchParams({ q: query, limit: "6", autocomplete: "1", index: "address" });
  if (near) {
    params.set("lat", String(near[0]));
    params.set("lon", String(near[1]));
  }

  const response = await fetch(`${IGN_URL}/search?${params}`, { signal });
  if (!response.ok) throw new Error(`Recherche d'adresse impossible (${response.status})`);
  const data = (await response.json()) as { features: IgnFeature[] };
  return data.features.map(toSuggestion);
}

/** Adresse la plus proche d'une position, ou null si rien n'est trouvé. */
export async function reverseGeocode(
  [lat, lng]: [number, number],
  { signal }: { signal?: AbortSignal } = {},
): Promise<string | null> {
  // 1. Base Adresse Nationale (France).
  const ign = await fetch(`${IGN_URL}/reverse?lat=${lat}&lon=${lng}&limit=1&index=address`, { signal });
  if (ign.ok) {
    const data = (await ign.json()) as { features: IgnFeature[] };
    const feature = data.features[0];
    // Au-delà de ~300 m, l'adresse proposée n'est plus pertinente (mer, forêt, hors de France…).
    const distance = (feature?.properties as { distance?: number } | undefined)?.distance ?? 0;
    if (feature && distance < 300) return toSuggestion(feature).label;
  }

  // 2. Repli OpenStreetMap (hors de France).
  const osm = await fetch(
    `${NOMINATIM_URL}/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=18&addressdetails=0&accept-language=fr`,
    { signal },
  );
  if (!osm.ok) return null;
  const data = (await osm.json()) as { display_name?: string };
  // « Nom, rue, quartier, ville, …, pays » : on garde les 3 premiers éléments, plus lisibles.
  return data.display_name?.split(", ").slice(0, 3).join(", ") ?? null;
}
