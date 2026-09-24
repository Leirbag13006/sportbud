import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ChatView } from "@/components/messages/chat-view";
import { requireUser } from "@/lib/auth/session";
import { getConversation, getMessages } from "@/lib/messages/queries";

export async function generateMetadata({ params }: PageProps<"/messages/[conversationId]">): Promise<Metadata> {
  const user = await requireUser();
  const conversation = await getConversation(user.id, (await params).conversationId);
  return { title: conversation ? `Discussion avec ${conversation.otherUser.fullName}` : "Messages" };
}

/** Conversation ouverte, réservée à ses deux participants. */
export default async function ConversationPage({ params }: PageProps<"/messages/[conversationId]">) {
  const user = await requireUser();
  const { conversationId } = await params;
  const conversation = await getConversation(user.id, conversationId);
  if (!conversation) notFound();

  const messages = await getMessages(conversationId);

  return (
    // key : repart d'un état propre (brouillon, messages locaux) en changeant de conversation.
    <ChatView key={conversationId} initialData={{ conversation, messages }} currentUserId={user.id} />
  );
}
