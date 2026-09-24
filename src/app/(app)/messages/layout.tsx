import { MessagesShell } from "@/components/messages/messages-shell";
import { requireUser } from "@/lib/auth/session";
import { listConversations } from "@/lib/messages/queries";

/** Messagerie : liste des conversations + conversation ouverte. */
export default async function MessagesLayout({ children }: LayoutProps<"/messages">) {
  const user = await requireUser();
  const conversations = await listConversations(user.id);

  return (
    <MessagesShell initialConversations={conversations} currentUserId={user.id}>
      {children}
    </MessagesShell>
  );
}
