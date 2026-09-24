import type { NextRequest } from "next/server";

import { json, notFound, unauthorized } from "@/lib/api/responses";
import { getCurrentUser } from "@/lib/auth/session";
import { getConversation, getMessages } from "@/lib/messages/queries";
import type { ConversationWithMessagesDTO } from "@/lib/messages/types";

/** Conversation et ses messages, réservés à ses deux participants. */
export async function GET(_request: NextRequest, ctx: RouteContext<"/api/conversations/[id]/messages">) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const { id } = await ctx.params;
  const conversation = await getConversation(user.id, id);
  // 404 (et non 403) : ne pas révéler l'existence d'une conversation à un tiers.
  if (!conversation) return notFound();

  return json<ConversationWithMessagesDTO>({ conversation, messages: await getMessages(id) });
}
