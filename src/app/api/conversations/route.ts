import { json, unauthorized } from "@/lib/api/responses";
import { getCurrentUser } from "@/lib/auth/session";
import { listConversations } from "@/lib/messages/queries";

/** Conversations de l'utilisateur, avec dernier message et nombre de non lus. */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  return json(await listConversations(user.id));
}
