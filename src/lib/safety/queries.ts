import "server-only";

import { and, desc, eq, or } from "drizzle-orm";

import { db } from "@/db";
import { blocks } from "@/db/schema";
import type { BlockStatus, BlockedUser } from "./types";

/** Blocages impliquant l'utilisateur, dans les deux sens. */
export async function getBlockRelations(userId: string) {
  const rows = await db
    .select({ blockerId: blocks.blockerId, blockedId: blocks.blockedId })
    .from(blocks)
    .where(or(eq(blocks.blockerId, userId), eq(blocks.blockedId, userId)));

  const blockedByMe = new Set<string>();
  const blockedMe = new Set<string>();
  for (const row of rows) {
    if (row.blockerId === userId) blockedByMe.add(row.blockedId);
    else blockedMe.add(row.blockerId);
  }

  return {
    blockedByMe,
    blockedMe,
    /** Membres avec qui aucune interaction n'est possible (bloqués ou bloquants). */
    hidden: new Set([...blockedByMe, ...blockedMe]),
    statusWith: (otherId: string): BlockStatus =>
      blockedByMe.has(otherId) ? "by-me" : blockedMe.has(otherId) ? "by-them" : null,
  };
}

/** Vrai si l'un des deux membres a bloqué l'autre. */
export async function isBlockedBetween(userId: string, otherId: string) {
  const [row] = await db
    .select({ blockerId: blocks.blockerId })
    .from(blocks)
    .where(
      or(
        and(eq(blocks.blockerId, userId), eq(blocks.blockedId, otherId)),
        and(eq(blocks.blockerId, otherId), eq(blocks.blockedId, userId)),
      ),
    )
    .limit(1);
  return Boolean(row);
}

/** Membres bloqués par l'utilisateur, du plus récent au plus ancien. */
export async function getBlockedUsers(userId: string): Promise<BlockedUser[]> {
  const rows = await db.query.blocks.findMany({
    columns: { createdAt: true },
    with: { blocked: { columns: { id: true, fullName: true, avatarUrl: true } } },
    where: eq(blocks.blockerId, userId),
    orderBy: [desc(blocks.createdAt)],
  });
  return rows.map(({ blocked, createdAt }) => ({ ...blocked, blockedAt: createdAt }));
}
