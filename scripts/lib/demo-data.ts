/** Données démo : les comptes en @demo.sportmates.local et tout ce qui s'y rattache. */
import { inArray, like, or } from "drizzle-orm";
import type { LibSQLDatabase } from "drizzle-orm/libsql";

import * as schema from "../../src/db/schema";
import {
  activities,
  applications,
  blocks,
  messages,
  passwordResetTokens,
  reports,
  reviews,
  sessions,
  userAchievements,
  users,
} from "../../src/db/schema";

export const DEMO_EMAIL_DOMAIN = "@demo.sportmates.local";

type Db = LibSQLDatabase<typeof schema>;
export type Tx = Parameters<Parameters<Db["transaction"]>[0]>[0];

/** Supprime les comptes démo et tout ce qui s'y rattache ; les vrais comptes ne sont pas touchés. Renvoie le nombre de comptes supprimés. */
export async function removeDemoData(tx: Tx) {
  const demoUserIds = (
    await tx.select({ id: users.id }).from(users).where(like(users.email, `%${DEMO_EMAIL_DOMAIN}`))
  ).map((row) => row.id);
  if (demoUserIds.length === 0) return 0;

  const demoActivityIds = (
    await tx.select({ id: activities.id }).from(activities).where(inArray(activities.creatorId, demoUserIds))
  ).map((row) => row.id);
  const demoApplicationIds = (
    await tx
      .select({ id: applications.id })
      .from(applications)
      .where(
        or(
          inArray(applications.applicantId, demoUserIds),
          demoActivityIds.length > 0 ? inArray(applications.activityId, demoActivityIds) : undefined,
        ),
      )
  ).map((row) => row.id);

  if (demoApplicationIds.length > 0) {
    await tx.delete(messages).where(inArray(messages.applicationId, demoApplicationIds));
  }
  await tx.delete(messages).where(inArray(messages.senderId, demoUserIds));
  await tx
    .delete(reviews)
    .where(
      or(
        inArray(reviews.reviewerId, demoUserIds),
        inArray(reviews.revieweeId, demoUserIds),
        demoActivityIds.length > 0 ? inArray(reviews.activityId, demoActivityIds) : undefined,
      ),
    );
  await tx.delete(reports).where(or(inArray(reports.reporterId, demoUserIds), inArray(reports.reportedId, demoUserIds)));
  await tx.delete(blocks).where(or(inArray(blocks.blockerId, demoUserIds), inArray(blocks.blockedId, demoUserIds)));
  await tx.delete(userAchievements).where(inArray(userAchievements.userId, demoUserIds));
  await tx.delete(passwordResetTokens).where(inArray(passwordResetTokens.userId, demoUserIds));
  await tx.delete(sessions).where(inArray(sessions.userId, demoUserIds));
  if (demoApplicationIds.length > 0) {
    await tx.delete(applications).where(inArray(applications.id, demoApplicationIds));
  }
  await tx.delete(activities).where(inArray(activities.creatorId, demoUserIds));
  await tx.delete(users).where(inArray(users.id, demoUserIds));
  return demoUserIds.length;
}
