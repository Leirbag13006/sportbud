import { z } from "zod";

import { SPORT_LEVEL_VALUES, SPORT_TYPE_VALUES } from "@/db/schema";

const DAY_MS = 24 * 60 * 60 * 1000;
/** Une activité peut être programmée au plus tard 60 jours à l'avance. */
export const MAX_DAYS_AHEAD = 60;
/** Nombre maximum de partenaires recherchés pour une activité. */
export const MAX_SPOTS = 20;
/** Prix maximum par personne, en euros. */
export const MAX_PRICE_EUROS = 200;

/** Texte facultatif : chaîne vide → null. */
const optionalText = (max: number, message: string) =>
  z
    .string()
    .trim()
    .max(max, message)
    .optional()
    .transform((value) => value || null);

export const createActivitySchema = z.object({
  sportType: z.enum(SPORT_TYPE_VALUES, "Choisis un sport."),
  // Date ISO construite dans le navigateur à partir de la date et de l'heure locales de l'utilisateur.
  startsAt: z.coerce
    .date({ error: "Choisis une date et une heure." })
    .refine((date) => date.getTime() > Date.now(), "L'activité doit commencer dans le futur.")
    .refine(
      (date) => date.getTime() < Date.now() + MAX_DAYS_AHEAD * DAY_MS,
      `Au maximum ${MAX_DAYS_AHEAD} jours à l'avance.`,
    ),
  durationMinutes: z.coerce
    .number({ error: "Choisis une durée." })
    .int()
    .min(15, "15 minutes minimum.")
    .max(720, "12 heures maximum."),
  spotsTotal: z.coerce
    .number({ error: "Indique le nombre de personnes recherchées." })
    .int()
    .min(1, "Au moins 1 personne.")
    .max(MAX_SPOTS, `${MAX_SPOTS} personnes maximum.`),
  // "any" = ouvert à tous les niveaux (stocké en null).
  requiredLevel: z
    .enum([...SPORT_LEVEL_VALUES, "any"], "Choisis un niveau.")
    .transform((level) => (level === "any" ? null : level)),
  locationName: optionalText(120, "120 caractères maximum."),
  address: optionalText(200, "200 caractères maximum."),
  description: optionalText(500, "500 caractères maximum."),
  // Prix par personne saisi en euros (« 7,50 ») ; vide ou 0 = gratuit. Converti en centimes.
  price: z
    .string()
    .trim()
    .transform((value) => (value === "" ? 0 : Number(value.replace(",", "."))))
    .pipe(
      z
        .number({ error: "Indique un prix valide." })
        .min(0, "Le prix ne peut pas être négatif.")
        .max(MAX_PRICE_EUROS, `${MAX_PRICE_EUROS} € maximum.`),
    )
    .transform((euros) => Math.round(euros * 100)),
  equipmentRequired: z.enum(["yes", "no"]).transform((value) => value === "yes"),
  equipmentNote: optionalText(120, "120 caractères maximum."),
  lat: z.coerce.number({ error: "Place le lieu sur la carte." }).min(-90).max(90),
  lng: z.coerce.number({ error: "Place le lieu sur la carte." }).min(-180).max(180),
});

export type CreateActivityInput = z.infer<typeof createActivitySchema>;
