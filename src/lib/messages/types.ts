import type { Message, PublicUser, SportType } from "@/db/schema";
import type { EarnedBadge } from "@/lib/achievements/definitions";
import type { BlockStatus } from "@/lib/safety/types";

/**
 * Types échangés avec le navigateur (API JSON) : les dates sont des chaînes ISO.
 * Deux sortes de conversations :
 * - privée : une candidature acceptée, entre l'organisateur et le participant (id = id de la candidature) ;
 * - groupe : la séance, entre l'organisateur et tous les participants acceptés (id = « g- » + id de la séance).
 */

export type ConversationUser = Pick<PublicUser, "id" | "username" | "avatarUrl" | "sportLevel">;

export interface ConversationActivity {
  id: string;
  sportType: SportType;
  startsAt: string;
  /** Séance terminée (début + durée dépassés), calculé côté serveur. */
  ended: boolean;
  cancelled: boolean;
  /** Titre de l'annonce (« Recherche 2 joueurs »). */
  title: string;
  locationName: string | null;
  address: string | null;
}

interface BaseConversationDTO {
  id: string;
  activity: ConversationActivity;
  /** Rôle de l'utilisateur courant dans l'activité. */
  myRole: "creator" | "participant";
}

export interface PrivateConversationDTO extends BaseConversationDTO {
  kind: "private";
  /** L'autre participant de la conversation. */
  otherUser: ConversationUser;
  /** Le participant s'est désisté : la conversation reste lisible mais l'envoi est coupé. */
  withdrawn: boolean;
  /** Blocage entre les deux membres : la conversation reste lisible mais l'envoi est coupé. */
  blockStatus: BlockStatus;
}

export interface GroupMember extends ConversationUser {
  role: "creator" | "participant";
  /** Conversation privée de l'utilisateur courant avec ce membre (organisateur ↔ participant), sinon null. */
  privateConversationId: string | null;
}

export interface GroupConversationDTO extends BaseConversationDTO {
  kind: "group";
  /** Membres du groupe : l'organisateur d'abord, puis les participants acceptés. */
  members: GroupMember[];
}

export type ConversationDTO = PrivateConversationDTO | GroupConversationDTO;

/** Identifiant de la conversation de groupe d'une séance. */
export function groupConversationId(activityId: string) {
  return `g-${activityId}`;
}

/** Identifiant de séance d'une conversation de groupe, sinon null (conversation privée). */
export function parseGroupConversationId(conversationId: string) {
  return conversationId.startsWith("g-") ? conversationId.slice(2) : null;
}

export interface MessageDTO {
  id: string;
  senderId: string;
  content: string;
  kind: Message["kind"];
  createdAt: string;
  readAt: string | null;
  /** Auteur (conversations de groupe : affiché au-dessus de ses messages). */
  sender?: Pick<ConversationUser, "id" | "username" | "avatarUrl">;
}

export type ConversationSummaryDTO = ConversationDTO & {
  lastMessage: (Pick<MessageDTO, "content" | "kind" | "senderId" | "createdAt"> & { senderName: string }) | null;
  unreadCount: number;
  /** Date de la dernière activité (dernier message), pour le tri. */
  updatedAt: string;
};

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
