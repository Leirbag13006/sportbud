import type { ActivityWithCreator } from "./types";

/**
 * Activités fictives pour valider le design de la carte (étape 3).
 * Remplacées par les vraies données de la base à l'étape 4.
 *
 * Elles sont positionnées autour d'un point de référence (la position de l'utilisateur)
 * pour être visibles quel que soit l'endroit où l'app est ouverte.
 */

const HOUR = 60 * 60 * 1000;

type MockSeed = Omit<ActivityWithCreator, "id" | "lat" | "lng" | "startsAt" | "creatorId"> & {
  /** Décalage par rapport au point de référence, en degrés [lat, lng]. */
  offset: [number, number];
  /** Début de l'activité, en heures à partir de maintenant. */
  startsInHours: number;
};

const SEEDS: MockSeed[] = [
  {
    offset: [0.006, -0.009],
    startsInHours: 3,
    sportType: "football",
    locationName: "City stade du parc",
    description: "Five amical, on cherche 3 joueurs pour compléter les équipes. Chasubles fournies.",
    durationMinutes: 90,
    requiredLevel: null,
    spotsTotal: 4,
    spotsAvailable: 3,
    status: "open",
    creator: { id: "mock-1", fullName: "Karim Benali", sportLevel: "intermediate", avatarUrl: null },
  },
  {
    offset: [-0.004, 0.011],
    startsInHours: 26,
    sportType: "tennis",
    locationName: "Tennis club municipal, court 3",
    description: "Simple d'une heure, je réserve le court. Niveau 30/2 environ.",
    durationMinutes: 60,
    requiredLevel: "intermediate",
    spotsTotal: 1,
    spotsAvailable: 1,
    status: "open",
    creator: { id: "mock-2", fullName: "Julie Moreau", sportLevel: "pro", avatarUrl: null },
  },
  {
    offset: [0.012, 0.004],
    startsInHours: 15,
    sportType: "running",
    locationName: "Départ entrée principale du parc",
    description: "Footing tranquille de 8 km à 6 min/km, tous niveaux bienvenus.",
    durationMinutes: 50,
    requiredLevel: "beginner",
    spotsTotal: 5,
    spotsAvailable: 2,
    status: "open",
    creator: { id: "mock-3", fullName: "Thomas Nguyen", sportLevel: "intermediate", avatarUrl: null },
  },
  {
    offset: [-0.009, -0.006],
    startsInHours: 5,
    sportType: "basketball",
    locationName: "Playground du gymnase",
    description: "3 contre 3 sur demi-terrain.",
    durationMinutes: 120,
    requiredLevel: null,
    spotsTotal: 3,
    spotsAvailable: 0,
    status: "full",
    creator: { id: "mock-4", fullName: "Inès Fabre", sportLevel: "pro", avatarUrl: null },
  },
  {
    offset: [0.002, 0.017],
    startsInHours: 50,
    sportType: "padel",
    locationName: "Padel Center, terrain 2",
    description: "Il nous manque une paire pour un double. Balles fournies.",
    durationMinutes: 90,
    requiredLevel: "intermediate",
    spotsTotal: 2,
    spotsAvailable: 2,
    status: "open",
    creator: { id: "mock-5", fullName: "Lucas Garcia", sportLevel: "intermediate", avatarUrl: null },
  },
  {
    offset: [-0.014, 0.002],
    startsInHours: 20,
    sportType: "cycling",
    locationName: "Parking de la corniche",
    description: "Sortie route de 60 km avec un peu de dénivelé, allure ~27 km/h.",
    durationMinutes: 150,
    requiredLevel: "pro",
    spotsTotal: 4,
    spotsAvailable: 1,
    status: "open",
    creator: { id: "mock-6", fullName: "Sarah Martin", sportLevel: "pro", avatarUrl: null },
  },
];

export function getMockActivities([refLat, refLng]: [number, number]): ActivityWithCreator[] {
  const now = Date.now();

  return SEEDS.map(({ offset, startsInHours, creator, ...seed }, index) => ({
    ...seed,
    id: `mock-activity-${index + 1}`,
    creatorId: creator.id,
    creator,
    lat: refLat + offset[0],
    lng: refLng + offset[1],
    // Arrondi à l'heure pleine pour des horaires réalistes.
    startsAt: new Date(Math.ceil((now + startsInHours * HOUR) / HOUR) * HOUR),
  }));
}
