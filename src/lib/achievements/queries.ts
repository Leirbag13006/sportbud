import "server-only";

import { and, eq, inArray, ne, or, sql } from "drizzle-orm";

import { db } from "@/db";
import { activities, applications, users } from "@/db/schema";
import { getRatingSummaries } from "@/lib/reviews/queries";
import { evaluateAchievements, type AchievementState, type MemberStats } from "./definitions";

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

/** Succès (débloqués ou non) d'un membre. */
export async function getAchievements(userId: string): Promise<AchievementState[]> {
  const stats = (await getMemberStats([userId]))[userId]!;
  return evaluateAchievements(stats);
}

/** Succès débloqués de plusieurs membres (fiches candidats). */
export async function getUnlockedAchievementsByUser(userIds: string[]): Promise<Record<string, AchievementState[]>> {
  const stats = await getMemberStats(userIds);
  return Object.fromEntries(
    Object.entries(stats).map(([userId, value]) => [userId, evaluateAchievements(value).filter((item) => item.unlocked)]),
  );
}
