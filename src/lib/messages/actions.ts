"use server";

import { and, eq, isNull, ne } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { messages } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/session";
import { getConversation, toMessageDTO } from "./queries";
import type { MessageDTO } from "./types";

const contentSchema = z
  .string()
  .trim()
  .min(1, "Le message est vide.")
  .max(2000, "2000 caractères maximum.");

export type SendMessageResult = { ok: true; message: MessageDTO } | { ok: false; error: string };

/** Envoie un message dans une conversation dont l'utilisateur est participant. */
export async function sendMessage(conversationId: string, content: string): Promise<SendMessageResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Ta session a expiré, reconnecte-toi." };

  const parsed = contentSchema.safeParse(content);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]!.message };

  const conversation = await getConversation(user.id, conversationId);
  if (!conversation) return { ok: false, error: "Cette conversation n'est plus disponible." };
  if (conversation.blockStatus) return { ok: false, error: "Tu ne peux plus écrire à ce membre." };

  const [message] = await db
    .insert(messages)
    .values({ applicationId: conversationId, senderId: user.id, content: parsed.data })
    .returning();

  return { ok: true, message: toMessageDTO(message!) };
}

/** Marque comme lus les messages reçus dans une conversation. */
export async function markConversationRead(conversationId: string): Promise<void> {
  const user = await getCurrentUser();
  if (!user || !(await getConversation(user.id, conversationId))) return;

  await db
    .update(messages)
    .set({ readAt: new Date() })
    .where(
      and(eq(messages.applicationId, conversationId), ne(messages.senderId, user.id), isNull(messages.readAt)),
    );
}
