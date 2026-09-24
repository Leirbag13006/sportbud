"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/db";
import { users } from "@/db/schema";
import { getCurrentUser, isUsernameTaken } from "@/lib/auth/session";
import { profileSchema, type ProfileInput } from "@/lib/validations/profile";

export type ProfileActionResult =
  | { ok: true }
  | { ok: false; error?: string; fieldErrors?: Record<string, string[] | undefined> };

/** Met à jour le profil de l'utilisateur connecté (nom, bio, niveau, sports favoris, ville, photo). */
export async function updateProfile(input: ProfileInput): Promise<ProfileActionResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Ta session a expiré, reconnecte-toi." };

  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) return { ok: false, fieldErrors: z.flattenError(parsed.error).fieldErrors };
  const { avatar, city, ...fields } = parsed.data;
  if (await isUsernameTaken(fields.username, user.id)) {
    return { ok: false, fieldErrors: { username: ["Ce pseudo est déjà pris, essaie une variante."] } };
  }

  await db
    .update(users)
    .set({
      ...fields,
      city: city?.name ?? null,
      homeLat: city?.lat ?? null,
      homeLng: city?.lng ?? null,
      ...(avatar === "keep" ? {} : { avatarUrl: avatar === "remove" ? null : avatar }),
    })
    .where(eq(users.id, user.id));

  revalidatePath("/", "layout");
  return { ok: true };
}
