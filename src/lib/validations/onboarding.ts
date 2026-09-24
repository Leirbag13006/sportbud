import { z } from "zod";

import { SPORT_LEVEL_VALUES, SPORT_TYPE_VALUES } from "@/db/schema";
import { genderSchema } from "./auth";
import { citySchema, MAX_FAVORITE_SPORTS } from "./profile";

/** Parcours d'accueil : sports favoris, niveau et ville (centre de l'exploration). */
export const onboardingSchema = z.object({
  favoriteSports: z
    .array(z.enum(SPORT_TYPE_VALUES))
    .min(1, "Choisis au moins un sport.")
    .max(MAX_FAVORITE_SPORTS, `${MAX_FAVORITE_SPORTS} sports maximum.`)
    .transform((sports) => [...new Set(sports)]),
  sportLevel: z.enum(SPORT_LEVEL_VALUES, "Choisis ton niveau."),
  gender: genderSchema,
  city: citySchema,
});

export type OnboardingInput = z.input<typeof onboardingSchema>;
