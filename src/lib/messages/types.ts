import type { Message, PublicUser, SportType } from "@/db/schema";
import type { EarnedBadge } from "@/lib/achievements/definitions";

/**
 * Types échangés avec le navigateur (API JSON) : les dates sont des chaînes ISO.
 * Une conversation correspond à une candidature acceptée, entre le créateur et le participant.
 */

export type ConversationUser = Pick<PublicUser, "id" | "fullName" | "avatarUrl" | "sportLevel">;

export interface ConversationActivity {
  id: string;
  sportType: SportType;
  startsAt: string;
  locationName: string | null;
  address: string | null;
}

export interface ConversationDTO {
  /** Identifiant de la conversation = identifiant de la candidature acceptée. */
  id: string;
  activity: ConversationActivity;
  /** L'autre participant de la conversation. */
  otherUser: ConversationUser;
  /** Rôle de l'utilisateur courant dans l'activité. */
  myRole: "creator" | "participant";
}

export interface MessageDTO {
  id: string;
  senderId: string;
  content: string;
  kind: Message["kind"];
  createdAt: string;
  readAt: string | null;
}

export interface ConversationSummaryDTO extends ConversationDTO {
  lastMessage: Pick<MessageDTO, "content" | "kind" | "senderId" | "createdAt"> | null;
  unreadCount: number;
  /** Date de la dernière activité (dernier message), pour le tri. */
  updatedAt: string;
}

export interface ConversationWithMessagesDTO {
  conversation: ConversationDTO;
  messages: MessageDTO[];
}

export interface NotificationsDTO {
  unreadMessages: number;
  pendingApplications: number;
  /** Participants de séances terminées que l'utilisateur n'a pas encore notés. */
  reviewsToWrite: number;
  /** Succès débloqués dont la notification n'a pas encore été vue. */
  newAchievements: EarnedBadge[];
  /** Dernier message non lu, pour la notification toast. */
  latestUnread: { id: string; conversationId: string; senderName: string; preview: string } | null;
}
