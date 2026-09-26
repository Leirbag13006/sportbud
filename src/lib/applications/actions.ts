"use server";

import { and, eq, gt, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { activities, applications } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/session";
import { canJoinAudience } from "@/config/audience";
import { postGroupSystemMessage } from "@/lib/messages/system";
import { isBlockedBetween } from "@/lib/safety/queries";

export type ApplicationActionResult = { ok: true } | { ok: false; error: string };

const SESSION_EXPIRED = { ok: false, error: "Ta session a expiré, reconnecte-toi." } as const;

/** Rafraîchit toutes les pages (carte, profil) et les badges de navigation du layout. */
function refreshApp() {
  revalidatePath("/", "layout");
}

/** L'utilisateur connecté postule à une activité : la candidature est créée « en attente ». */
export async function applyToActivity(activityId: string): Promise<ApplicationActionResult> {
  const user = await getCurrentUser();
  if (!user) return SESSION_EXPIRED;

  const activity = await db.query.activities.findFirst({ where: eq(activities.id, activityId) });
  if (!activity) return { ok: false, error: "Cette activité n'existe plus." };
  if (activity.creatorId === user.id) return { ok: false, error: "Tu ne peux pas postuler à ta propre activité." };
  if (activity.startsAt.getTime() <= Date.now()) return { ok: false, error: "Cette activité a déjà commencé." };
  if (activity.status !== "open") return { ok: false, error: "Cette activité est complète." };
  if (!canJoinAudience(activity.audience, user.gender)) {
    return {
      ok: false,
      error: `Cette séance est réservée ${activity.audience === "women" ? "aux femmes" : "aux hommes"}.`,
    };
  }
  if (await isBlockedBetween(user.id, activity.creatorId)) {
    return { ok: false, error: "Tu ne peux pas rejoindre cette activité." };
  }

  // Un participant qui s'était désisté peut candidater à nouveau : sa candidature repart « en attente ».
  const [created] = await db
    .insert(applications)
    .values({ activityId, applicantId: user.id })
    .onConflictDoUpdate({
      target: [applications.activityId, applications.applicantId],
      set: { status: "pending" },
      setWhere: eq(applications.status, "withdrawn"),
    })
    .returning({ id: applications.id });

  if (!created) return { ok: false, error: "Tu as déjà postulé à cette activité." };

  refreshApp();
  return { ok: true };
}

/**
 * Le candidat retire sa candidature.
 * En attente : elle est simplement supprimée. Acceptée (désistement) : sa place est rendue, l'activité
 * se rouvre si elle était complète, le groupe de la séance est prévenu par un message automatique,
 * et l'éventuelle conversation privée avec l'organisateur est conservée (close).
 */
export async function withdrawApplication(applicationId: string): Promise<ApplicationActionResult> {
  const user = await getCurrentUser();
  if (!user) return SESSION_EXPIRED;

  const result = await db.transaction(async (tx): Promise<ApplicationActionResult> => {
    const application = await tx.query.applications.findFirst({
      where: and(eq(applications.id, applicationId), eq(applications.applicantId, user.id)),
      with: { activity: true },
    });
    if (!application) return { ok: false, error: "Candidature introuvable." };
    if (application.status === "rejected") return { ok: false, error: "Cette candidature a déjà été refusée." };
    if (application.status === "withdrawn") return { ok: false, error: "Tu as déjà quitté cette séance." };

    if (application.status === "accepted") {
      if (application.activity.startsAt.getTime() <= Date.now()) {
        return { ok: false, error: "L'activité a déjà commencé, tu ne peux plus te désister." };
      }
      // Rend la place ; une activité annulée le reste.
      await tx
        .update(activities)
        .set({
          spotsAvailable: sql`${activities.spotsAvailable} + 1`,
          status: sql`case when ${activities.status} = 'cancelled' then 'cancelled' else 'open' end`,
        })
        .where(eq(activities.id, application.activityId));
      await tx.update(applications).set({ status: "withdrawn" }).where(eq(applications.id, applicationId));
      await postGroupSystemMessage(
        tx,
        application.activityId,
        user.id,
        `${user.username} a quitté la séance : sa place est de nouveau disponible.`,
      );
      return { ok: true };
    }

    await tx.delete(applications).where(eq(applications.id, applicationId));
    return { ok: true };
  });

  if (result.ok) refreshApp();
  return result;
}

/**
 * Le créateur accepte ou refuse une candidature en attente.
 * L'acceptation décrémente les places de façon atomique : la mise à jour n'a lieu que s'il reste
 * une place, ce qui empêche de dépasser la capacité même avec deux acceptations simultanées.
 */
export async function respondToApplication(
  applicationId: string,
  decision: "accepted" | "rejected",
): Promise<ApplicationActionResult> {
  const user = await getCurrentUser();
  if (!user) return SESSION_EXPIRED;

  const result = await db.transaction(async (tx): Promise<ApplicationActionResult> => {
    const application = await tx.query.applications.findFirst({
      where: eq(applications.id, applicationId),
      with: { activity: true, applicant: { columns: { username: true } } },
    });
    // Même message si la candidature n'existe pas ou ne concerne pas une activité de l'utilisateur.
    if (!application || application.activity.creatorId !== user.id) {
      return { ok: false, error: "Candidature introuvable." };
    }
    if (application.status !== "pending") return { ok: false, error: "Cette candidature a déjà été traitée." };
    if (decision === "accepted" && (await isBlockedBetween(user.id, application.applicantId))) {
      return { ok: false, error: "Tu as bloqué ce membre (ou il t'a bloqué) : impossible de l'accepter." };
    }

    if (decision === "accepted") {
      // Toutes les expressions du SET utilisent les valeurs avant mise à jour (SQL standard).
      const [updated] = await tx
        .update(activities)
        .set({
          spotsAvailable: sql`${activities.spotsAvailable} - 1`,
          status: sql`case when ${activities.spotsAvailable} - 1 = 0 then 'full' else 'open' end`,
        })
        .where(
          and(
            eq(activities.id, application.activityId),
            eq(activities.status, "open"),
            gt(activities.spotsAvailable, 0),
          ),
        )
        .returning({ id: activities.id });

      if (!updated) return { ok: false, error: "Il n'y a plus de place disponible pour cette activité." };
    }

    await tx
      .update(applications)
      .set({ status: decision })
      .where(and(eq(applications.id, applicationId), eq(applications.status, "pending")));

    // Acceptation : le participant rejoint la discussion de groupe de la séance ; le message
    // automatique le notifie et présente le nouveau venu aux autres.
    if (decision === "accepted") {
      await postGroupSystemMessage(
        tx,
        application.activityId,
        user.id,
        `${application.applicant.username} a rejoint la séance. Bienvenue !`,
      );
    }
    return { ok: true };
  });

  if (result.ok) refreshApp();
  return result;
}
