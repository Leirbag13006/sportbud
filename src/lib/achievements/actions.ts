"use server";

import { and, eq, isNull } from "drizzle-orm";

import { db } from "@/db";
import { userAchievements } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/session";

/** Marque comme vues les notifications de succès de l'utilisateur connecté. */
export async function markAchievementsSeen(): Promise<void> {
  const user = await getCurrentUser();
  if (!user) return;
  await db
    .update(userAchievements)
    .set({ seenAt: new Date() })
    .where(and(eq(userAchievements.userId, user.id), isNull(userAchievements.seenAt)));
}
