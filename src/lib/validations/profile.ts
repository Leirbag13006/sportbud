import { z } from "zod";

import { SPORT_LEVEL_VALUES, SPORT_TYPE_VALUES } from "@/db/schema";

/** Taille maximale d'une photo encodée (≈ 110 Ko), largement au-dessus d'une image 320 px en WebP. */
const MAX_AVATAR_LENGTH = 150_000;

export const MAX_FAVORITE_SPORTS = 5;

/** Ville du membre (centre de l'exploration) : nom et position, ou null pour l'effacer. */
export const citySchema = z
  .object({
    name: z.string().trim().min(1).max(100),
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
  })
  .nullable();

export const profileSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Ton nom doit contenir au moins 2 caractères.")
    .max(80, "80 caractères maximum."),
  bio: z
    .string()
    .trim()
    .max(500, "500 caractères maximum.")
    .transform((value) => value || null),
  sportLevel: z.enum(SPORT_LEVEL_VALUES, "Choisis ton niveau."),
  favoriteSports: z
    .array(z.enum(SPORT_TYPE_VALUES))
    .max(MAX_FAVORITE_SPORTS, `${MAX_FAVORITE_SPORTS} sports maximum.`)
    .transform((sports) => [...new Set(sports)]),
  city: citySchema,
  // « keep » : photo inchangée, « remove » : supprimée, sinon nouvelle image (data URL).
  avatar: z.union([
    z.literal("keep"),
    z.literal("remove"),
    z
      .string()
      .max(MAX_AVATAR_LENGTH, "Photo trop lourde, choisis-en une autre.")
      .regex(/^data:image\/(webp|jpeg|png);base64,[A-Za-z0-9+/=]+$/, "Format de photo invalide."),
  ]),
});

export type ProfileInput = z.input<typeof profileSchema>;
