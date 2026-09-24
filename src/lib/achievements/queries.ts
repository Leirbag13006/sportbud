import "server-only";

import { and, asc, eq, inArray, isNull, max, ne, or, sql } from "drizzle-orm";

import { db } from "@/db";
import { activities, applications, userAchievements, users } from "@/db/schema";
import { getRatingSummaries } from "@/lib/reviews/queries";
import { evaluateAchievements, toEarnedBadge, type AchievementState, type EarnedBadge, type MemberStats } from "./definitions";

const WEEK_MS = 7 * 24 * 3600 * 1000;
const ended = () => sql`${activities.startsAt} + ${activities.durationMinutes} * 60000 <= ${Date.now()}`;

/** Plus grand nombre de dates contenues dans une fenêtre glissante de 7 jours. */
function bestWeek(dates: Date[]) {
  const times = dates.map((date) => date.getTime()).sort((a, b) => a - b);
  let best = 0;
  for (let start = 0, end = 0; end < times.length; end++) {
    while (times[end]! - times[start]! > WEEK_MS) start++;
    best = Math.max(best, end - start + 1);
  }
  return best;
}

/** Statistiques d'activité de plusieurs membres (séances terminées uniquement). */
export async function getMemberStats(userIds: string[]): Promise<Record<string, MemberStats>> {
  const ids = [...new Set(userIds)];
  if (ids.length === 0) return {};

  // Toutes les participations acceptées à des séances terminées impliquant ces membres,
  // comme participant ou comme organisateur.
  const [rows, profiles, ratings] = await Promise.all([
    db
      .select({
        activityId: activities.id,
        startsAt: activities.startsAt,
        sportType: activities.sportType,
        creatorId: activities.creatorId,
        applicantId: applications.applicantId,
      })
      .from(applications)
      .innerJoin(activities, eq(applications.activityId, activities.id))
      .where(
        and(
          eq(applications.status, "accepted"),
          ne(activities.status, "cancelled"),
          ended(),
          or(inArray(applications.applicantId, ids), inArray(activities.creatorId, ids)),
        ),
      ),
    db
      .select({ id: users.id, avatarUrl: users.avatarUrl, bio: users.bio, favoriteSports: users.favoriteSports })
      .from(users)
      .where(inArray(users.id, ids)),
    getRatingSummaries(ids),
  ]);

  // Participants acceptés par séance (pour compter les partenaires rencontrés).
  const participantsByActivity = new Map<string, string[]>();
  for (const row of rows) {
    participantsByActivity.set(row.activityId, [...(participantsByActivity.get(row.activityId) ?? []), row.applicantId]);
  }

  return Object.fromEntries(
    ids.map((userId) => {
      const played = rows.filter((row) => row.applicantId === userId);
      const organized = new Map(rows.filter((row) => row.creatorId === userId).map((row) => [row.activityId, row]));
      const sessions = [...played, ...organized.values()];

      const partners = new Set<string>();
      for (const row of sessions) {
        partners.add(row.creatorId);
        for (const participant of participantsByActivity.get(row.activityId) ?? []) partners.add(participant);
      }
      partners.delete(userId);

      const profile = profiles.find((item) => item.id === userId);
      const rating = ratings[userId];
      const stats: MemberStats = {
        sessionsPlayed: played.length,
        sessionsOrganized: organized.size,
        distinctSports: new Set(sessions.map((row) => row.sportType)).size,
        distinctPartners: partners.size,
        bestWeek: bestWeek(sessions.map((row) => row.startsAt)),
        ratingAverage: rating?.average ?? null,
        ratingCount: rating?.count ?? 0,
        profileComplete: Boolean(profile?.avatarUrl && profile.bio && profile.favoriteSports.length > 0),
      };
      return [userId, stats];
    }),
  );
}

/** Succès (débloqués ou non) d'un membre, avec leur palier. */
export async function getAchievements(userId: string): Promise<AchievementState[]> {
  const stats = (await getMemberStats([userId]))[userId]!;
  return evaluateAchievements(stats);
}

/** Dernière synchronisation par membre (limite le recalcul lors des rafraîchissements fréquents). */
const lastSync = new Map<string, number>();
const SYNC_INTERVAL_MS = 30_000;

/**
 * Enregistre les paliers nouvellement atteints par un membre (non vus par défaut).
 * Appelée lors du rafraîchissement des notifications ; recalcul au plus toutes les 30 s.
 */
export async function syncAchievements(userId: string, { force = false } = {}) {
  const now = Date.now();
  if (!force && now - (lastSync.get(userId) ?? 0) < SYNC_INTERVAL_MS) return;
  lastSync.set(userId, now);

  const achievements = await getAchievements(userId);
  const reached = achievements.flatMap((achievement) =>
    Array.from({ length: achievement.tier }, (_, index) => ({ userId, achievementId: achievement.id, tier: index + 1 })),
  );
  if (reached.length === 0) return;
  await db.insert(userAchievements).values(reached).onConflictDoNothing();
}

/** Succès débloqués dont le membre n'a pas encore vu la notification. */
export async function getUnseenAchievements(userId: string): Promise<EarnedBadge[]> {
  const rows = await db
    .select({ achievementId: userAchievements.achievementId, tier: userAchievements.tier })
    .from(userAchievements)
    .where(and(eq(userAchievements.userId, userId), isNull(userAchievements.seenAt)))
    .orderBy(asc(userAchievements.unlockedAt));

  // Un seul palier par succès : le plus élevé.
  const best = new Map<string, number>();
  for (const row of rows) best.set(row.achievementId, Math.max(best.get(row.achievementId) ?? 0, row.tier));
  return [...best].map(([id, tier]) => toEarnedBadge(id, tier)).filter((badge) => badge !== null);
}

/** Meilleurs badges enregistrés de plusieurs membres (cartes, fiches), du plus prestigieux au moins. */
export async function getEarnedBadges(userIds: string[], limit = 3): Promise<Record<string, EarnedBadge[]>> {
  const ids = [...new Set(userIds)];
  if (ids.length === 0) return {};
  const rows = await db
    .select({ userId: userAchievements.userId, achievementId: userAchievements.achievementId, tier: max(userAchievements.tier) })
    .from(userAchievements)
    .where(inArray(userAchievements.userId, ids))
    .groupBy(userAchievements.userId, userAchievements.achievementId);

  const byUser: Record<string, EarnedBadge[]> = {};
  for (const row of rows) {
    const badge = toEarnedBadge(row.achievementId, row.tier ?? 1);
    if (badge) (byUser[row.userId] ??= []).push(badge);
  }
  for (const badges of Object.values(byUser)) {
    badges.sort((a, b) => b.tier - a.tier);
    badges.splice(limit);
  }
  return byUser;
}
