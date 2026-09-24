import { json, unauthorized } from "@/lib/api/responses";
import { getCurrentUser } from "@/lib/auth/session";
import { getNotifications } from "@/lib/messages/queries";

/** Compteurs des badges (messages non lus, candidatures en attente), interrogés régulièrement. */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  return json(await getNotifications(user.id));
}
