import type { StyleSpecification } from "maplibre-gl";

import baseStyle from "./openfreemap-positron.json";

/**
 * Fond de carte SportMates : style vectoriel « Positron » d'OpenFreeMap (gratuit, sans clé),
 * recoloré aux couleurs de la charte (fond nuit, parcs vert profond, grands axes teintés menthe).
 *
 * MapLibre ne lit pas les variables CSS : les teintes sont donc déclinées ici des tokens
 * de `globals.css` (référence indiquée en commentaire quand la valeur est identique).
 */
const PALETTE = {
  background: "#0a1a17", // night-900
  residential: "#0d201c",
  building: "#11261f",
  buildingOutline: "#173a31", // night-700
  park: "#0f2c24",
  wood: "#0e2821",
  ice: "#1a2c29",
  water: "#0a2230",
  waterway: "#12344a",
  aeroway: "#132e28",
  roadPath: "#173a31", // night-700
  roadMinor: "#1b3a33",
  roadMajor: "#24483f",
  roadCasing: "#0a1a17", // night-900
  motorway: "#0e5a4c", // teal-600
  rail: "#1f3d35",
  boundary: "#35554c",
  labelStrong: "#e4efeb",
  label: "#a9bdb7",
  labelMuted: "#6b7975", // gray-400
  labelWater: "#6f9bb0",
  halo: "rgba(10, 26, 23, 0.85)", // night-900
} as const;

type Paint = Record<string, unknown>;

/** Couleurs à appliquer par couche du style de base (les autres propriétés sont conservées). */
const PAINT_OVERRIDES: Record<string, Paint> = {
  background: { "background-color": PALETTE.background },
  park: { "fill-color": PALETTE.park },
  water: { "fill-color": PALETTE.water },
  landcover_ice_shelf: { "fill-color": PALETTE.ice },
  landcover_glacier: { "fill-color": PALETTE.ice },
  landuse_residential: { "fill-color": PALETTE.residential },
  landcover_wood: { "fill-color": PALETTE.wood },
  waterway: { "line-color": PALETTE.waterway },
  building: { "fill-color": PALETTE.building, "fill-outline-color": PALETTE.buildingOutline },
  tunnel_motorway_casing: { "line-color": PALETTE.roadCasing },
  tunnel_motorway_inner: { "line-color": PALETTE.roadMajor },
  "aeroway-taxiway": { "line-color": PALETTE.aeroway },
  "aeroway-runway-casing": { "line-color": PALETTE.aeroway },
  "aeroway-area": { "fill-color": PALETTE.aeroway },
  "aeroway-runway": { "line-color": PALETTE.roadMinor },
  road_area_pier: { "fill-color": PALETTE.background },
  road_pier: { "line-color": PALETTE.background },
  highway_path: { "line-color": PALETTE.roadPath },
  highway_minor: { "line-color": PALETTE.roadMinor },
  highway_major_casing: { "line-color": PALETTE.roadCasing },
  highway_major_inner: { "line-color": PALETTE.roadMajor },
  highway_major_subtle: { "line-color": PALETTE.roadMinor },
  highway_motorway_casing: { "line-color": PALETTE.roadCasing },
  highway_motorway_inner: { "line-color": PALETTE.motorway },
  highway_motorway_subtle: { "line-color": PALETTE.roadMajor },
  highway_motorway_bridge_casing: { "line-color": PALETTE.roadCasing },
  highway_motorway_bridge_inner: { "line-color": PALETTE.motorway },
  railway_transit: { "line-color": PALETTE.rail },
  railway_transit_dashline: { "line-color": PALETTE.background },
  railway_service: { "line-color": PALETTE.rail },
  railway_service_dashline: { "line-color": PALETTE.background },
  railway: { "line-color": PALETTE.rail },
  railway_dashline: { "line-color": PALETTE.background },
  boundary_3: { "line-color": PALETTE.boundary },
  boundary_2: { "line-color": PALETTE.boundary },
  boundary_disputed: { "line-color": PALETTE.boundary },
  waterway_line_label: { "text-color": PALETTE.labelWater, "text-halo-color": PALETTE.halo },
  water_name_point_label: { "text-color": PALETTE.labelWater, "text-halo-color": PALETTE.halo },
  water_name_line_label: { "text-color": PALETTE.labelWater, "text-halo-color": PALETTE.halo },
  "highway-name-path": { "text-color": PALETTE.labelMuted, "text-halo-color": PALETTE.halo },
  "highway-name-minor": { "text-color": PALETTE.label, "text-halo-color": PALETTE.halo },
  "highway-name-major": { "text-color": PALETTE.label, "text-halo-color": PALETTE.halo },
  airport: { "text-color": PALETTE.label, "text-halo-color": PALETTE.halo },
  label_other: { "text-color": PALETTE.label, "text-halo-color": PALETTE.halo },
  label_village: { "text-color": PALETTE.labelStrong, "text-halo-color": PALETTE.halo },
  label_town: { "text-color": PALETTE.labelStrong, "text-halo-color": PALETTE.halo },
  label_state: { "text-color": PALETTE.label, "text-halo-color": PALETTE.halo },
  label_city: { "text-color": PALETTE.labelStrong, "text-halo-color": PALETTE.halo },
  label_city_capital: { "text-color": PALETTE.labelStrong, "text-halo-color": PALETTE.halo },
  label_country_3: { "text-color": PALETTE.labelStrong, "text-halo-color": PALETTE.halo },
  label_country_2: { "text-color": PALETTE.labelStrong, "text-halo-color": PALETTE.halo },
  label_country_1: { "text-color": PALETTE.labelStrong, "text-halo-color": PALETTE.halo },
};

/** Noms en français quand OpenStreetMap les connaît, sinon nom local (le style de base privilégie l'anglais). */
const FRENCH_NAME = ["coalesce", ["get", "name:fr"], ["get", "name"]];

/** Panneaux routiers américains : inutiles en France et illisibles sur fond sombre. */
const HIDDEN_LAYERS = new Set(["highway-shield-us-interstate", "road_shield_us"]);

export const SPORTMATES_MAP_STYLE = {
  ...(baseStyle as unknown as StyleSpecification),
  name: "SportMates",
  layers: (baseStyle as unknown as StyleSpecification).layers
    .filter((layer) => !HIDDEN_LAYERS.has(layer.id))
    .map((layer) => {
      const paint = { ...("paint" in layer ? layer.paint : {}), ...PAINT_OVERRIDES[layer.id] };
      if (layer.type !== "symbol") return { ...layer, paint } as typeof layer;
      // Les numéros de route (« A 7 ») gardent leur libellé ; les autres textes passent en français.
      const isRoadRef = JSON.stringify(layer.layout?.["text-field"]).includes('"ref"');
      const layout = isRoadRef ? layer.layout : { ...layer.layout, "text-field": FRENCH_NAME };
      return { ...layer, paint, layout } as typeof layer;
    }),
} satisfies StyleSpecification;

export const MAP_ATTRIBUTION =
  '<a href="https://openfreemap.org" target="_blank" rel="noopener">OpenFreeMap</a> · ' +
  '&copy; <a href="https://www.openmaptiles.org/" target="_blank" rel="noopener">OpenMapTiles</a> · ' +
  '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>';
