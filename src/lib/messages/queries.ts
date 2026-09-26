import "server-only";

import { and, count, desc, eq, exists, inArray, isNull, ne, notInArray, or, sql } from "drizzle-orm";

import { getActivityTitle } from "@/config/sports";
import { db } from "@/db";
import { activities, applications, groupChatReads, groupMessages, messages, type Activity, type Message } from "@/db/schema";
import { countPendingReceivedApplications } from "@/lib/applications/queries";
import { getUnseenAchievements, syncAchievements } from "@/lib/achievements/queries";
import { countReviewsToWrite } from "@/lib/reviews/queries";
import { getBlockRelations } from "@/lib/safety/queries";
import type { BlockStatus } from "@/lib/safety/types";
import {
  groupConversationId,
  parseGroupConversationId,
  type ConversationActivity,
  type ConversationDTO,
  type ConversationSummaryDTO,
  type GroupConversationDTO,
  type MessageDTO,
  type NotificationsDTO,
  type PrivateConversationDTO,
} from "./types";

/** Nombre maximum de messages chargés par conversation. */
const MESSAGES_LIMIT = 300;

const userColumns = { id: true, username: true, avatarUrl: true, sportLevel: true } as const;
const activityColumns = {
  id: true,
  sportType: true,
  startsAt: true,
  durationMinutes: true,
  locationName: true,
  address: true,
  creatorId: true,
  status: true,
  spotsTotal: true,
  spotsAvailable: true,
} as const;

type ActivityRow = Pick<Activity, keyof typeof activityColumns>;

function toConversationActivity(activity: ActivityRow): ConversationActivity {
  return {
    id: activity.id,
    sportType: activity.sportType,
    startsAt: activity.startsAt.toISOString(),
    ended: activity.startsAt.getTime() + activity.durationMinutes * 60_000 < Date.now(),
    cancelled: activity.status === "cancelled",
    title: getActivityTitle(activity.sportType, activity.status === "open" ? activity.spotsAvailable : activity.spotsTotal),
    locationName: activity.locationName,
    address: activity.address,
  };
}

// -----------------------------------------------------------------------------
// Conversations privées (organisateur ↔ participant, une par candidature acceptée)
// -----------------------------------------------------------------------------

/**
 * Condition : candidature acceptée (ou participant désisté, conversation en lecture seule) dont
 * l'utilisateur est le participant ou le créateur de l'activité. C'est la règle d'accès unique à une conversation privée.
 */
function conversationAccess(userId: string) {
  return and(
    inArray(applications.status, ["accepted", "withdrawn"]),
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
    columns: { id: true, applicantId: true, status: true, updatedAt: true },
    with: {
      applicant: { columns: userColumns },
      activity: { columns: activityColumns, with: { creator: { columns: userColumns } } },
    },
    where: applicationId
      ? and(eq(applications.id, applicationId), conversationAccess(userId))
      : conversationAccess(userId),
  });
}

function toPrivateConversationDTO(
  row: ApplicationRow,
  userId: string,
  statusWith: (otherId: string) => BlockStatus,
): PrivateConversationDTO {
  const { activity } = row;
  const isCreator = activity.creatorId === userId;
  const otherUser = isCreator ? row.applicant : activity.creator;
  return {
    kind: "private",
    id: row.id,
    activity: toConversationActivity(activity),
    otherUser,
    myRole: isCreator ? "creator" : "participant",
    withdrawn: row.status === "withdrawn",
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

// -----------------------------------------------------------------------------
// Conversations de groupe (une par séance : organisateur + participants acceptés)
// -----------------------------------------------------------------------------

/** Séances dont l'utilisateur est membre du groupe (organisateur, ou participant accepté). */
function groupActivityIds(userId: string) {
  // Le groupe existe dès le premier participant accepté, et reste en place si tous se désistent
  // (l'organisateur y lit les messages de départ).
  const accepted = (activityId: typeof activities.id) =>
    db
      .select({ id: applications.id })
      .from(applications)
      .where(and(eq(applications.activityId, activityId), inArray(applications.status, ["accepted", "withdrawn"])));
  return db
    .select({ id: activities.id })
    .from(activities)
    .where(
      and(
        exists(accepted(activities.id)),
        or(
          eq(activities.creatorId, userId),
          exists(
            db
              .select({ id: applications.id })
              .from(applications)
              .where(
                and(
                  eq(applications.activityId, activities.id),
                  eq(applications.applicantId, userId),
                  eq(applications.status, "accepted"),
                ),
              ),
          ),
        ),
      ),
    );
}

type GroupRow = Awaited<ReturnType<typeof findGroupRows>>[number];

function findGroupRows(userId: string, activityId?: string) {
  return db.query.activities.findMany({
    columns: activityColumns,
    with: {
      creator: { columns: userColumns },
      applications: {
        columns: { id: true, applicantId: true },
        where: eq(applications.status, "accepted"),
        with: { applicant: { columns: userColumns } },
      },
    },
    where: and(
      inArray(activities.id, groupActivityIds(userId)),
      activityId ? eq(activities.id, activityId) : undefined,
    ),
  });
}

function toGroupConversationDTO(row: GroupRow, userId: string): GroupConversationDTO {
  const { applications: accepted, creator, ...activity } = row;
  const isCreator = activity.creatorId === userId;
  const myApplicationId = accepted.find((application) => application.applicantId === userId)?.id ?? null;
  return {
    kind: "group",
    id: groupConversationId(activity.id),
    activity: toConversationActivity(activity),
    myRole: isCreator ? "creator" : "participant",
    members: [
      // Conversation privée possible uniquement entre l'organisateur et un participant.
      { ...creator, role: "creator", privateConversationId: isCreator ? null : myApplicationId },
      ...accepted.map(({ id, applicant }) => ({
        ...applicant,
        role: "participant" as const,
        privateConversationId: isCreator ? id : null,
      })),
    ],
  };
}

async function getGroupMessages(activityId: string, hidden: Set<string>): Promise<MessageDTO[]> {
  const rows = await db.query.groupMessages.findMany({
    columns: { id: true, senderId: true, content: true, kind: true, createdAt: true },
    with: { sender: { columns: { id: true, username: true, avatarUrl: true } } },
    where: eq(groupMessages.activityId, activityId),
    orderBy: [desc(groupMessages.createdAt)],
    limit: MESSAGES_LIMIT,
  });
  return rows
    .reverse()
    // Messages des membres bloqués (dans un sens ou dans l'autre) masqués ; les messages automatiques restent.
    .filter((message) => message.kind === "system" || !hidden.has(message.senderId))
    .map(({ sender, ...message }) => ({
      ...message,
      createdAt: message.createdAt.toISOString(),
      readAt: null,
      sender,
    }));
}

/** Condition : message de groupe non lu par l'utilisateur (reçu après sa dernière lecture). */
function groupUnread(userId: string, hidden: Set<string>) {
  return and(
    inArray(groupMessages.activityId, groupActivityIds(userId)),
    ne(groupMessages.senderId, userId),
    hidden.size > 0 ? notInArray(groupMessages.senderId, [...hidden]) : undefined,
    // Alias explicite « r » : dans les requêtes relationnelles, Drizzle réécrit les colonnes des
    // tables interpolées avec l'alias de la table principale.
    sql`${groupMessages.createdAt} > coalesce((select r.read_at from group_chat_reads r where r.activity_id = ${groupMessages.activityId} and r.user_id = ${userId}), 0)`,
  );
}

// -----------------------------------------------------------------------------
// Accès commun (routes API, pages, actions)
// -----------------------------------------------------------------------------

/** Conversation (privée ou de groupe) si l'utilisateur y a accès, sinon null. */
export async function getConversation(userId: string, conversationId: string): Promise<ConversationDTO | null> {
  const activityId = parseGroupConversationId(conversationId);
  if (activityId) {
    const [row] = await findGroupRows(userId, activityId);
    return row ? toGroupConversationDTO(row, userId) : null;
  }
  const [[row], { statusWith }] = await Promise.all([
    findConversationRows(userId, conversationId),
    getBlockRelations(userId),
  ]);
  return row ? toPrivateConversationDTO(row, userId, statusWith) : null;
}

/** Messages d'une conversation, du plus ancien au plus récent. L'accès doit avoir été vérifié. */
export async function getMessages(userId: string, conversation: ConversationDTO): Promise<MessageDTO[]> {
  if (conversation.kind === "group") {
    const { hidden } = await getBlockRelations(userId);
    return getGroupMessages(conversation.activity.id, hidden);
  }
  // Les N derniers messages, remis dans l'ordre chronologique.
  const rows = await db.query.messages.findMany({
    columns: { id: true, senderId: true, content: true, kind: true, createdAt: true, readAt: true },
    where: eq(messages.applicationId, conversation.id),
    orderBy: [desc(messages.createdAt)],
    limit: MESSAGES_LIMIT,
  });
  return rows.reverse().map(toMessageDTO);
}

/**
 * Liste des conversations de l'utilisateur, la plus récemment active en premier : les groupes de
 * ses séances, et les conversations privées qui contiennent au moins un message.
 */
export async function listConversations(userId: string): Promise<ConversationSummaryDTO[]> {
  const [privateRows, groupRows, { statusWith, hidden }] = await Promise.all([
    findConversationRows(userId),
    findGroupRows(userId),
    getBlockRelations(userId),
  ]);
  const privateIds = privateRows.map((row) => row.id);
  const groupIds = groupRows.map((row) => row.id);

  const [privateMessages, privateUnread, groupLast, groupUnreadRows] = await Promise.all([
    privateIds.length === 0
      ? []
      : db.query.messages.findMany({
          columns: { applicationId: true, content: true, kind: true, senderId: true, createdAt: true },
          with: { sender: { columns: { username: true } } },
          where: inArray(messages.applicationId, privateIds),
          orderBy: [desc(messages.createdAt)],
        }),
    privateIds.length === 0
      ? []
      : db
          .select({ id: messages.applicationId, value: count() })
          .from(messages)
          .where(and(inArray(messages.applicationId, privateIds), ne(messages.senderId, userId), isNull(messages.readAt)))
          .groupBy(messages.applicationId),
    groupIds.length === 0
      ? []
      : db.query.groupMessages.findMany({
          columns: { activityId: true, content: true, kind: true, senderId: true, createdAt: true },
          with: { sender: { columns: { username: true } } },
          where: and(
            inArray(groupMessages.activityId, groupIds),
            hidden.size > 0 ? or(eq(groupMessages.kind, "system"), notInArray(groupMessages.senderId, [...hidden])) : undefined,
          ),
          orderBy: [desc(groupMessages.createdAt)],
        }),
    groupIds.length === 0
      ? []
      : db
          .select({ id: groupMessages.activityId, value: count() })
          .from(groupMessages)
          .where(groupUnread(userId, hidden))
          .groupBy(groupMessages.activityId),
  ]);

  // Messages triés du plus récent au plus ancien : le premier rencontré est le dernier envoyé.
  const lastPrivate = new Map<string, (typeof privateMessages)[number]>();
  for (const message of privateMessages) if (!lastPrivate.has(message.applicationId)) lastPrivate.set(message.applicationId, message);
  const lastGroup = new Map<string, (typeof groupLast)[number]>();
  for (const message of groupLast) if (!lastGroup.has(message.activityId)) lastGroup.set(message.activityId, message);
  const unreadPrivate = new Map(privateUnread.map((row) => [row.id, row.value]));
  const unreadGroup = new Map(groupUnreadRows.map((row) => [row.id, row.value]));

  const summary = (last: { content: string; kind: Message["kind"]; senderId: string; createdAt: Date; sender: { username: string } } | undefined) =>
    last
      ? { content: last.content, kind: last.kind, senderId: last.senderId, senderName: last.sender.username, createdAt: last.createdAt.toISOString() }
      : null;

  const privateSummaries: ConversationSummaryDTO[] = privateRows
    .filter((row) => lastPrivate.has(row.id))
    .map((row) => {
      const last = lastPrivate.get(row.id);
      return {
        ...toPrivateConversationDTO(row, userId, statusWith),
        lastMessage: summary(last),
        unreadCount: unreadPrivate.get(row.id) ?? 0,
        updatedAt: (last?.createdAt ?? row.updatedAt).toISOString(),
      };
    });

  const groupSummaries: ConversationSummaryDTO[] = groupRows.map((row) => {
    const last = lastGroup.get(row.id);
    return {
      ...toGroupConversationDTO(row, userId),
      lastMessage: summary(last),
      unreadCount: unreadGroup.get(row.id) ?? 0,
      updatedAt: (last?.createdAt ?? row.startsAt).toISOString(),
    };
  });

  return [...groupSummaries, ...privateSummaries].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

/** Compteurs des badges de navigation et dernier message non lu (privé ou de groupe). */
export async function getNotifications(userId: string): Promise<NotificationsDTO> {
  const privateUnread = and(
    ne(messages.senderId, userId),
    isNull(messages.readAt),
    inArray(messages.applicationId, db.select({ id: applications.id }).from(applications).where(conversationAccess(userId))),
  );

  // Enregistre les succès nouvellement atteints (au plus toutes les 30 s par membre).
  await syncAchievements(userId);
  const { hidden } = await getBlockRelations(userId);
  const groupWhere = groupUnread(userId, hidden);

  const [[unread], [unreadInGroups], latestPrivate, latestGroup, pendingApplications, reviewsToWrite, newAchievements] =
    await Promise.all([
      db.select({ value: count() }).from(messages).where(privateUnread),
      db.select({ value: count() }).from(groupMessages).where(groupWhere),
      db.query.messages.findFirst({
        columns: { id: true, applicationId: true, content: true, createdAt: true },
        with: { sender: { columns: { username: true } } },
        where: privateUnread,
        orderBy: [desc(messages.createdAt)],
      }),
      db.query.groupMessages.findFirst({
        columns: { id: true, activityId: true, content: true, createdAt: true },
        with: { sender: { columns: { username: true } } },
        where: groupWhere,
        orderBy: [desc(groupMessages.createdAt)],
      }),
      countPendingReceivedApplications(userId),
      countReviewsToWrite(userId),
      getUnseenAchievements(userId),
    ]);

  const latest =
    latestGroup && (!latestPrivate || latestGroup.createdAt > latestPrivate.createdAt)
      ? { id: latestGroup.id, conversationId: groupConversationId(latestGroup.activityId), senderName: latestGroup.sender.username, content: latestGroup.content }
      : latestPrivate
        ? { id: latestPrivate.id, conversationId: latestPrivate.applicationId, senderName: latestPrivate.sender.username, content: latestPrivate.content }
        : null;

  return {
    unreadMessages: (unread?.value ?? 0) + (unreadInGroups?.value ?? 0),
    pendingApplications,
    reviewsToWrite,
    newAchievements,
    latestUnread: latest
      ? {
          id: latest.id,
          conversationId: latest.conversationId,
          senderName: latest.senderName,
          preview: latest.content.length > 80 ? `${latest.content.slice(0, 80)}…` : latest.content,
        }
      : null,
  };
}

/** Enregistre la lecture du groupe par l'utilisateur (tous les messages actuels deviennent lus). */
export async function markGroupRead(activityId: string, userId: string) {
  const readAt = new Date();
  await db
    .insert(groupChatReads)
    .values({ activityId, userId, readAt })
    .onConflictDoUpdate({ target: [groupChatReads.activityId, groupChatReads.userId], set: { readAt } });
}
