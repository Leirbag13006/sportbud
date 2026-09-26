import "server-only";

import { db } from "@/db";
import { groupMessages } from "@/db/schema";

/** Transaction Drizzle ou connexion directe : tout ce qui sait insérer. */
type Writer = Pick<typeof db, "insert">;

/**
 * Message automatique dans la discussion de groupe d'une séance (arrivée ou départ d'un participant,
 * modification, annulation). L'auteur est le membre à l'origine de l'événement.
 */
export async function postGroupSystemMessage(writer: Writer, activityId: string, senderId: string, content: string) {
  await writer.insert(groupMessages).values({ activityId, senderId, kind: "system", content });
}
