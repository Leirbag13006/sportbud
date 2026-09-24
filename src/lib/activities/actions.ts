"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/db";
import { activities } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/session";
import { createActivitySchema } from "@/lib/validations/activity";
import { countUpcomingActivitiesByCreator } from "./queries";

/** Nombre maximum d'activités à venir par utilisateur. */
const MAX_UPCOMING_PER_USER = 10;

export type CreateActivityResult =
  | { ok: true; activityId: string }
  | { ok: false; error?: string; fieldErrors?: Record<string, string[] | undefined> };

/** Crée une activité au nom de l'utilisateur connecté. */
export async function createActivity(formData: FormData): Promise<CreateActivityResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Ta session a expiré, reconnecte-toi." };

  const parsed = createActivitySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { ok: false, fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  if ((await countUpcomingActivitiesByCreator(user.id)) >= MAX_UPCOMING_PER_USER) {
    return {
      ok: false,
      error: `Tu as déjà ${MAX_UPCOMING_PER_USER} activités à venir. Attends qu'elles passent avant d'en créer d'autres.`,
    };
  }

  const { lat, lng, spotsTotal, price, equipmentRequired, equipmentNote, ...rest } = parsed.data;
  const [activity] = await db
    .insert(activities)
    .values({
      ...rest,
      creatorId: user.id,
      // ~10 cm de précision : inutile de stocker davantage.
      lat: Number(lat.toFixed(6)),
      lng: Number(lng.toFixed(6)),
      spotsTotal,
      spotsAvailable: spotsTotal,
      priceCents: price,
      equipmentRequired,
      // La précision n'a de sens que si du matériel est à apporter.
      equipmentNote: equipmentRequired ? equipmentNote : null,
      status: "open",
    })
    .returning({ id: activities.id });

  // Rafraîchit la carte (Server Component) pour afficher la nouvelle activité.
  revalidatePath("/");
  return { ok: true, activityId: activity!.id };
}
