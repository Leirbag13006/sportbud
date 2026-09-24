import { z } from "zod";

import { GENDER_VALUES, SPORT_LEVEL_VALUES } from "@/db/schema";

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

/** Pseudo public : 3 à 20 caractères, lettres sans accent, chiffres, « . », « _ » ou « - ». */
export const usernameSchema = z
  .string()
  .trim()
  .min(3, "Au moins 3 caractères.")
  .max(20, "20 caractères maximum.")
  .regex(/^[a-zA-Z0-9._-]+$/, "Lettres sans accent, chiffres, « . », « _ » ou « - » uniquement.")
  .refine((value) => /[a-zA-Z]/.test(value), "Au moins une lettre.");

/** Prénom (privé) : sert à s'adresser au membre. */
export const firstNameSchema = z
  .string()
  .trim()
  .min(2, "Au moins 2 caractères.")
  .max(80, "80 caractères maximum.");

/** Genre (facultatif) : vide = non renseigné. */
export const genderSchema = z
  .enum([...GENDER_VALUES, ""])
  .transform((value) => (value === "" ? null : value));

/** Règles d'un nouveau mot de passe (inscription, réinitialisation). */
const newPassword = z
  .string()
  .min(8, "Au moins 8 caractères.")
  .max(72, "72 caractères maximum.")
  .regex(/[a-zA-Z]/, "Au moins une lettre.")
  .regex(/\d/, "Au moins un chiffre.");

export const registerSchema = z.object({
  username: usernameSchema,
  fullName: firstNameSchema,
  email,
  password: newPassword,
  sportLevel: z.enum(SPORT_LEVEL_VALUES, "Choisis ton niveau."),
});

export const forgotPasswordSchema = z.object({ email });

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1),
    password: newPassword,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Les deux mots de passe ne correspondent pas.",
  });

/** Suppression du compte : confirmation par le mot de passe actuel. */
export const deleteAccountSchema = z.object({
  password: z.string().min(1, "Saisis ton mot de passe pour confirmer."),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
