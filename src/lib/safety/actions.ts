"use server";

import { and, count, eq, gt, inArray, or } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/db";
import { activities, applications, blocks, reports, users } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/session";
import { reportSchema, type ReportInput } from "@/lib/validations/report";

export type SafetyActionResult =
  | { ok: true }
  | { ok: false; error?: string; fieldErrors?: Record<string, string[] | undefined> };

const SESSION_EXPIRED = { ok: false, error: "Ta session a expiré, reconnecte-toi." } as const;

/** Limite anti-abus : signalements par membre sur 24 h. */
const MAX_REPORTS_PER_DAY = 10;

async function userExists(userId: string) {
  const [row] = await db.select({ id: users.id }).from(users).where(eq(users.id, userId));
  return Boolean(row);
}

/** Signale un membre à l'équipe de modération. */
export async function reportUser(input: ReportInput): Promise<SafetyActionResult> {
  const user = await getCurrentUser();
  if (!user) return SESSION_EXPIRED;

  const parsed = reportSchema.safeParse(input);
  if (!parsed.success) return { ok: false, fieldErrors: z.flattenError(parsed.error).fieldErrors };
  const { reportedId, reason, details } = parsed.data;

  if (reportedId === user.id) return { ok: false, error: "Tu ne peux pas te signaler toi-même." };
  if (!(await userExists(reportedId))) return { ok: false, error: "Ce membre n'existe plus." };

  const [recent] = await db
    .select({ value: count() })
    .from(reports)
    .where(and(eq(reports.reporterId, user.id), gt(reports.createdAt, new Date(Date.now() - 24 * 3600 * 1000))));
  if ((recent?.value ?? 0) >= MAX_REPORTS_PER_DAY) {
    return { ok: false, error: "Tu as envoyé beaucoup de signalements aujourd'hui. Réessaie demain." };
  }

  await db.insert(reports).values({ reporterId: user.id, reportedId, reason, details });
  return { ok: true };
}

/**
 * Bloque un membre : ses activités disparaissent de l'exploration (et les miennes des siennes),
 * les candidatures en attente entre nous sont refusées et la messagerie est coupée.
 */
export async function blockUser(blockedId: string): Promise<SafetyActionResult> {
  const user = await getCurrentUser();
  if (!user) return SESSION_EXPIRED;
  if (blockedId === user.id) return { ok: false, error: "Tu ne peux pas te bloquer toi-même." };
  if (!(await userExists(blockedId))) return { ok: false, error: "Ce membre n'existe plus." };

  await db.transaction(async (tx) => {
    await tx.insert(blocks).values({ blockerId: user.id, blockedId }).onConflictDoNothing();

    // Candidatures en attente dans les deux sens (sur mes activités, ou sur les siennes) : refusées.
    const between = (creatorId: string, applicantId: string) =>
      and(
        eq(applications.applicantId, applicantId),
        inArray(applications.activityId, tx.select({ id: activities.id }).from(activities).where(eq(activities.creatorId, creatorId))),
      );
    await tx
      .update(applications)
      .set({ status: "rejected" })
      .where(and(eq(applications.status, "pending"), or(between(user.id, blockedId), between(blockedId, user.id))));
  });

  revalidatePath("/", "layout");
  return { ok: true };
}

/** Débloque un membre. */
export async function unblockUser(blockedId: string): Promise<SafetyActionResult> {
  const user = await getCurrentUser();
  if (!user) return SESSION_EXPIRED;

  await db.delete(blocks).where(and(eq(blocks.blockerId, user.id), eq(blocks.blockedId, blockedId)));

  revalidatePath("/", "layout");
  return { ok: true };
}
