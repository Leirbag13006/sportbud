"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/db";
import { users } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/session";
import { onboardingSchema, type OnboardingInput } from "@/lib/validations/onboarding";

export type OnboardingActionResult =
  | { ok: true }
  | { ok: false; error?: string; fieldErrors?: Record<string, string[] | undefined> };

/** Enregistre les réponses du parcours d'accueil et le marque comme terminé. */
export async function completeOnboarding(input: OnboardingInput): Promise<OnboardingActionResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Ta session a expiré, reconnecte-toi." };

  const parsed = onboardingSchema.safeParse(input);
  if (!parsed.success) return { ok: false, fieldErrors: z.flattenError(parsed.error).fieldErrors };
  const { favoriteSports, sportLevel, city } = parsed.data;

  await db
    .update(users)
    .set({
      favoriteSports,
      sportLevel,
      city: city?.name ?? null,
      homeLat: city?.lat ?? null,
      homeLng: city?.lng ?? null,
      onboardedAt: new Date(),
    })
    .where(eq(users.id, user.id));

  revalidatePath("/", "layout");
  return { ok: true };
}

/** « Plus tard » : le parcours n'est plus proposé (les réglages restent modifiables dans le profil). */
export async function skipOnboarding(): Promise<OnboardingActionResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Ta session a expiré, reconnecte-toi." };

  await db.update(users).set({ onboardedAt: new Date() }).where(eq(users.id, user.id));

  revalidatePath("/", "layout");
  return { ok: true };
}
