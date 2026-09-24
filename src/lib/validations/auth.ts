import { z } from "zod";

import { SPORT_LEVEL_VALUES } from "@/db/schema";

const email = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, "L'email est requis.")
  .pipe(z.email("Adresse email invalide."));

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Le mot de passe est requis."),
});

export const registerSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Ton nom doit contenir au moins 2 caractères.")
    .max(80, "Ton nom ne peut pas dépasser 80 caractères."),
  email,
  password: z
    .string()
    .min(8, "Au moins 8 caractères.")
    .max(72, "72 caractères maximum.")
    .regex(/[a-zA-Z]/, "Au moins une lettre.")
    .regex(/\d/, "Au moins un chiffre."),
  sportLevel: z.enum(SPORT_LEVEL_VALUES, "Choisis ton niveau."),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
