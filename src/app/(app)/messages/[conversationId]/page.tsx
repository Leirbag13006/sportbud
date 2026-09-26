import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ChatView } from "@/components/messages/chat-view";
import { requireUser } from "@/lib/auth/session";
import { getConversation, getMessages } from "@/lib/messages/queries";

export async function generateMetadata({ params }: PageProps<"/messages/[conversationId]">): Promise<Metadata> {
  const user = await requireUser();
  const conversation = await getConversation(user.id, (await params).conversationId);
  if (!conversation) return { title: "Messages" };
  return {
    title: conversation.kind === "group" ? `Groupe · ${conversation.activity.title}` : `Discussion avec ${conversation.otherUser.username}`,
  };
}

/** Conversation ouverte (privée ou groupe de la séance), réservée à ses membres. */
export default async function ConversationPage({ params }: PageProps<"/messages/[conversationId]">) {
  const user = await requireUser();
  const { conversationId } = await params;
  const conversation = await getConversation(user.id, conversationId);
  if (!conversation) notFound();

  const messages = await getMessages(user.id, conversation);

  return (
    // key : repart d'un état propre (brouillon, messages locaux) en changeant de conversation.
    <ChatView key={conversationId} initialData={{ conversation, messages }} currentUserId={user.id} />
  );
}
