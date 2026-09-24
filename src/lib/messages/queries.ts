import "server-only";

import { and, count, desc, eq, inArray, isNull, ne, or } from "drizzle-orm";

import { db } from "@/db";
import { activities, applications, messages, type Message } from "@/db/schema";
import { countPendingReceivedApplications } from "@/lib/applications/queries";
import { getUnseenAchievements, syncAchievements } from "@/lib/achievements/queries";
import { countReviewsToWrite } from "@/lib/reviews/queries";
import { getBlockRelations } from "@/lib/safety/queries";
import type { BlockStatus } from "@/lib/safety/types";
import type {
  ConversationDTO,
  ConversationSummaryDTO,
  MessageDTO,
  NotificationsDTO,
} from "./types";

/** Nombre maximum de messages chargés par conversation. */
const MESSAGES_LIMIT = 300;

const userColumns = { id: true, fullName: true, avatarUrl: true, sportLevel: true } as const;

/**
 * Condition : candidature acceptée dont l'utilisateur est le participant ou le créateur de l'activité.
 * C'est la règle d'accès unique à une conversation.
 */
function conversationAccess(userId: string) {
  return and(
    eq(applications.status, "accepted"),
    or(
      eq(applications.applicantId, userId),
      inArray(
        applications.activityId,
        db.select({ id: activities.id }).from(activities).where(eq(activities.creatorId, userId)),
      ),
    ),
  );
}

type ApplicationRow = Awaited<ReturnType<typeof findConversationRows>>[number];

function findConversationRows(userId: string, applicationId?: string) {
  return db.query.applications.findMany({
    columns: { id: true, applicantId: true, updatedAt: true },
    with: {
      applicant: { columns: userColumns },
      activity: {
        columns: { id: true, sportType: true, startsAt: true, locationName: true, address: true, creatorId: true },
        with: { creator: { columns: userColumns } },
      },
    },
    where: applicationId
      ? and(eq(applications.id, applicationId), conversationAccess(userId))
      : conversationAccess(userId),
  });
}

function toConversationDTO(
  row: ApplicationRow,
  userId: string,
  statusWith: (otherId: string) => BlockStatus,
): ConversationDTO {
  const { activity } = row;
  const isCreator = activity.creatorId === userId;
  const otherUser = isCreator ? row.applicant : activity.creator;
  return {
    id: row.id,
    activity: {
      id: activity.id,
      sportType: activity.sportType,
      startsAt: activity.startsAt.toISOString(),
      locationName: activity.locationName,
      address: activity.address,
    },
    otherUser,
    myRole: isCreator ? "creator" : "participant",
    blockStatus: statusWith(otherUser.id),
  };
}

export function toMessageDTO(message: Pick<Message, "id" | "senderId" | "content" | "kind" | "createdAt" | "readAt">): MessageDTO {
  return {
    id: message.id,
    senderId: message.senderId,
    content: message.content,
    kind: message.kind,
    createdAt: message.createdAt.toISOString(),
    readAt: message.readAt?.toISOString() ?? null,
  };
}

/** Conversation si l'utilisateur y a accès, sinon null. */
export async function getConversation(userId: string, applicationId: string): Promise<ConversationDTO | null> {
  const [[row], { statusWith }] = await Promise.all([
    findConversationRows(userId, applicationId),
    getBlockRelations(userId),
  ]);
  return row ? toConversationDTO(row, userId, statusWith) : null;
}

/** Messages d'une conversation, du plus ancien au plus récent. L'accès doit avoir été vérifié. */
export async function getMessages(applicationId: string): Promise<MessageDTO[]> {
  // Les N derniers messages, remis dans l'ordre chronologique.
  const rows = await db.query.messages.findMany({
    columns: { id: true, senderId: true, content: true, kind: true, createdAt: true, readAt: true },
    where: eq(messages.applicationId, applicationId),
    orderBy: [desc(messages.createdAt)],
    limit: MESSAGES_LIMIT,
  });
  return rows.reverse().map(toMessageDTO);
}

/** Liste des conversations de l'utilisateur, la plus récemment active en premier. */
export async function listConversations(userId: string): Promise<ConversationSummaryDTO[]> {
  const rows = await findConversationRows(userId);
  if (rows.length === 0) return [];
  const ids = rows.map((row) => row.id);

  const [recentMessages, unreadRows, { statusWith }] = await Promise.all([
    db.query.messages.findMany({
      columns: { applicationId: true, content: true, kind: true, senderId: true, createdAt: true },
      where: inArray(messages.applicationId, ids),
      orderBy: [desc(messages.createdAt)],
    }),
    db
      .select({ applicationId: messages.applicationId, value: count() })
      .from(messages)
      .where(and(inArray(messages.applicationId, ids), ne(messages.senderId, userId), isNull(messages.readAt)))
      .groupBy(messages.applicationId),
    getBlockRelations(userId),
  ]);

  // Messages triés du plus récent au plus ancien : le premier rencontré est le dernier envoyé.
  const lastByConversation = new Map<string, (typeof recentMessages)[number]>();
  for (const message of recentMessages) {
    if (!lastByConversation.has(message.applicationId)) lastByConversation.set(message.applicationId, message);
  }
  const unreadByConversation = new Map(unreadRows.map((row) => [row.applicationId, row.value]));

  return rows
    .map((row) => {
      const last = lastByConversation.get(row.id);
      return {
        ...toConversationDTO(row, userId, statusWith),
        lastMessage: last
          ? { content: last.content, kind: last.kind, senderId: last.senderId, createdAt: last.createdAt.toISOString() }
          : null,
        unreadCount: unreadByConversation.get(row.id) ?? 0,
        updatedAt: (last?.createdAt ?? row.updatedAt).toISOString(),
      };
    })
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

/** Compteurs des badges de navigation et dernier message non lu. */
export async function getNotifications(userId: string): Promise<NotificationsDTO> {
  const unreadWhere = and(
    ne(messages.senderId, userId),
    isNull(messages.readAt),
    inArray(messages.applicationId, db.select({ id: applications.id }).from(applications).where(conversationAccess(userId))),
  );

  // Enregistre les succès nouvellement atteints (au plus toutes les 30 s par membre).
  await syncAchievements(userId);

  const [[unread], latest, pendingApplications, reviewsToWrite, newAchievements] = await Promise.all([
    db.select({ value: count() }).from(messages).where(unreadWhere),
    db.query.messages.findFirst({
      columns: { id: true, applicationId: true, content: true },
      with: { sender: { columns: { fullName: true } } },
      where: unreadWhere,
      orderBy: [desc(messages.createdAt)],
    }),
    countPendingReceivedApplications(userId),
    countReviewsToWrite(userId),
    getUnseenAchievements(userId),
  ]);

  return {
    unreadMessages: unread?.value ?? 0,
    pendingApplications,
    reviewsToWrite,
    newAchievements,
    latestUnread: latest
      ? {
          id: latest.id,
          conversationId: latest.applicationId,
          senderName: latest.sender.fullName,
          preview: latest.content.length > 80 ? `${latest.content.slice(0, 80)}…` : latest.content,
        }
      : null,
  };
}
