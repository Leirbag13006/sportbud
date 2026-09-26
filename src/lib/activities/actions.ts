"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/db";
import { activities, applications } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/session";
import { canJoinAudience } from "@/config/audience";
import { createActivitySchema } from "@/lib/validations/activity";
import { postGroupSystemMessage } from "@/lib/messages/system";
import { countUpcomingActivitiesByCreator } from "./queries";

const AUDIENCE_GENDER_ERROR =
  "Pour une séance entre femmes ou entre hommes, indique ton genre dans ton profil (il n'est jamais affiché).";

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

  if (!canJoinAudience(parsed.data.audience, user.gender)) {
    return { ok: false, fieldErrors: { audience: [AUDIENCE_GENDER_ERROR] } };
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

export type ActivityActionResult =
  | { ok: true }
  | { ok: false; error?: string; fieldErrors?: Record<string, string[] | undefined> };

/** Activité de l'utilisateur, pas encore commencée ni annulée ; sinon un message d'erreur. */
async function findEditableActivity(activityId: string, userId: string) {
  const activity = await db.query.activities.findFirst({ where: eq(activities.id, activityId) });
  if (!activity || activity.creatorId !== userId) return { error: "Activité introuvable." } as const;
  if (activity.status === "cancelled") return { error: "Cette activité est annulée." } as const;
  if (activity.startsAt.getTime() <= Date.now()) return { error: "Cette activité a déjà commencé." } as const;
  return { activity } as const;
}

/** Candidatures acceptées d'une activité (une conversation chacune). */
function acceptedApplications(activityId: string) {
  return db
    .select({ id: applications.id, applicantId: applications.applicantId })
    .from(applications)
    .where(and(eq(applications.activityId, activityId), eq(applications.status, "accepted")));
}

/** Prévient les participants acceptés par un message automatique dans le groupe de la séance. */
async function notifyParticipants(
  tx: Pick<typeof db, "insert">,
  activityId: string,
  accepted: { id: string }[],
  senderId: string,
  content: string,
) {
  if (accepted.length === 0) return;
  await postGroupSystemMessage(tx, activityId, senderId, content);
}

/**
 * Modifie une activité à venir de l'utilisateur. Les places restantes sont recalculées
 * (le total ne peut pas descendre sous le nombre de participants acceptés) et les participants
 * sont prévenus des changements importants dans leur conversation.
 */
export async function updateActivity(activityId: string, formData: FormData): Promise<ActivityActionResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Ta session a expiré, reconnecte-toi." };

  const parsed = createActivitySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, fieldErrors: z.flattenError(parsed.error).fieldErrors };

  const found = await findEditableActivity(activityId, user.id);
  if ("error" in found) return { ok: false, error: found.error };
  const { activity } = found;
  const data = parsed.data;

  if (!canJoinAudience(data.audience, user.gender)) {
    return { ok: false, fieldErrors: { audience: [AUDIENCE_GENDER_ERROR] } };
  }

  const accepted = await acceptedApplications(activityId);
  if (data.spotsTotal < accepted.length) {
    return {
      ok: false,
      fieldErrors: { spotsTotal: [`${accepted.length} participant(s) déjà accepté(s) : pas moins de ${accepted.length} place(s).`] },
    };
  }
  if (data.audience !== activity.audience && accepted.length > 0) {
    return { ok: false, fieldErrors: { audience: ["Des participants sont déjà acceptés : le public ne peut plus changer."] } };
  }

  // Résumé des changements utiles aux participants.
  const changes = [
    (data.startsAt.getTime() !== activity.startsAt.getTime() || data.durationMinutes !== activity.durationMinutes) &&
      "l'horaire",
    (Math.abs(data.lat - activity.lat) > 1e-5 || Math.abs(data.lng - activity.lng) > 1e-5 || data.address !== activity.address) &&
      "le lieu",
    data.price !== activity.priceCents && "le prix",
    data.equipmentRequired !== activity.equipmentRequired && "le matériel",
  ].filter((change): change is string => Boolean(change));

  const spotsAvailable = data.spotsTotal - accepted.length;
  await db.transaction(async (tx) => {
    await tx
      .update(activities)
      .set({
        sportType: data.sportType,
        startsAt: data.startsAt,
        durationMinutes: data.durationMinutes,
        requiredLevel: data.requiredLevel,
        locationName: data.locationName,
        address: data.address,
        description: data.description,
        lat: Number(data.lat.toFixed(6)),
        lng: Number(data.lng.toFixed(6)),
        spotsTotal: data.spotsTotal,
        spotsAvailable,
        status: spotsAvailable === 0 ? "full" : "open",
        priceCents: data.price,
        equipmentRequired: data.equipmentRequired,
        equipmentNote: data.equipmentRequired ? data.equipmentNote : null,
        audience: data.audience,
      })
      .where(eq(activities.id, activityId));

    if (changes.length > 0) {
      await notifyParticipants(
        tx,
        activityId,
        accepted,
        user.id,
        `L'organisateur a modifié la séance (${changes.join(", ")}). Vérifie les détails avant d'y aller !`,
      );
    }
  });

  revalidatePath("/", "layout");
  return { ok: true };
}

/**
 * Annule une activité à venir : elle disparaît de l'exploration, les candidatures en attente
 * sont refusées et les participants acceptés sont prévenus dans leur conversation.
 */
export async function cancelActivity(activityId: string): Promise<ActivityActionResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Ta session a expiré, reconnecte-toi." };

  const found = await findEditableActivity(activityId, user.id);
  if ("error" in found) return { ok: false, error: found.error };

  const accepted = await acceptedApplications(activityId);
  await db.transaction(async (tx) => {
    await tx.update(activities).set({ status: "cancelled" }).where(eq(activities.id, activityId));
    await tx
      .update(applications)
      .set({ status: "rejected" })
      .where(and(eq(applications.activityId, activityId), eq(applications.status, "pending")));
    await notifyParticipants(tx, activityId, accepted, user.id, "Séance annulée par l'organisateur. Désolé pour le contretemps !");
  });

  revalidatePath("/", "layout");
  return { ok: true };
}

/** Supprime une activité à venir sans participant accepté (sinon, il faut l'annuler). */
export async function deleteActivity(activityId: string): Promise<ActivityActionResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Ta session a expiré, reconnecte-toi." };

  const found = await findEditableActivity(activityId, user.id);
  if ("error" in found) return { ok: false, error: found.error };
  if ((await acceptedApplications(activityId)).length > 0) {
    return { ok: false, error: "Des participants sont inscrits : annule la séance pour les prévenir." };
  }

  await db.delete(activities).where(eq(activities.id, activityId));
  revalidatePath("/", "layout");
  return { ok: true };
}
