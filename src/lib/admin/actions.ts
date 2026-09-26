"use server";

import { and, eq, gt, inArray, isNull, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { activities, applications, reports, sessions, users } from "@/db/schema";
import { postGroupSystemMessage } from "@/lib/messages/system";
import { getAdmin, isAdmin } from "./auth";

export type AdminActionResult = { ok: true } | { ok: false; error: string };

const FORBIDDEN = { ok: false, error: "Action réservée à la modération." } as const;

/** Classe un signalement sans suite. */
export async function dismissReport(reportId: string): Promise<AdminActionResult> {
  if (!(await getAdmin())) return FORBIDDEN;
  await db
    .update(reports)
    .set({ resolution: "dismissed", resolvedAt: new Date() })
    .where(and(eq(reports.id, reportId), isNull(reports.resolvedAt)));
  revalidatePath("/admin");
  return { ok: true };
}

/**
 * Suspend un compte : connexion impossible (sessions fermées), signalements en cours traités,
 * et séances à venir annulées (candidatures en attente refusées, groupes prévenus).
 */
export async function suspendUser(userId: string): Promise<AdminActionResult> {
  const admin = await getAdmin();
  if (!admin) return FORBIDDEN;
  if (userId === admin.id) return { ok: false, error: "Tu ne peux pas suspendre ton propre compte." };

  const target = await db.query.users.findFirst({ columns: { id: true, email: true, suspendedAt: true }, where: eq(users.id, userId) });
  if (!target) return { ok: false, error: "Ce membre n'existe plus." };
  if (isAdmin(target)) return { ok: false, error: "Impossible de suspendre un autre modérateur." };

  const now = new Date();
  await db.transaction(async (tx) => {
    await tx.update(users).set({ suspendedAt: target.suspendedAt ?? now }).where(eq(users.id, userId));
    await tx.delete(sessions).where(eq(sessions.userId, userId));
    await tx
      .update(reports)
      .set({ resolution: "suspended", resolvedAt: now })
      .where(and(eq(reports.reportedId, userId), isNull(reports.resolvedAt)));

    const upcoming = await tx
      .select({ id: activities.id })
      .from(activities)
      .where(and(eq(activities.creatorId, userId), ne(activities.status, "cancelled"), gt(activities.startsAt, now)));
    if (upcoming.length === 0) return;
    const ids = upcoming.map(({ id }) => id);
    await tx.update(activities).set({ status: "cancelled" }).where(inArray(activities.id, ids));
    await tx
      .update(applications)
      .set({ status: "rejected" })
      .where(and(inArray(applications.activityId, ids), eq(applications.status, "pending")));
    for (const id of ids) {
      await postGroupSystemMessage(tx, id, userId, "Séance annulée : le compte de l'organisateur a été suspendu par la modération.");
    }
  });

  revalidatePath("/", "layout");
  return { ok: true };
}

/** Lève la suspension (les séances annulées le restent). */
export async function unsuspendUser(userId: string): Promise<AdminActionResult> {
  if (!(await getAdmin())) return FORBIDDEN;
  await db.update(users).set({ suspendedAt: null }).where(eq(users.id, userId));
  revalidatePath("/admin");
  return { ok: true };
}
