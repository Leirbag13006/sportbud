"use client";

import Link from "next/link";
import useSWR from "swr";

import { UserAvatar } from "@/components/applications/user-avatar";
import { getSport } from "@/config/sports";
import { fetcher, POLL_INTERVALS } from "@/lib/fetcher";
import { formatDay, formatRelativeShort } from "@/lib/format";
import type { ConversationSummaryDTO } from "@/lib/messages/types";
import { cn } from "@/lib/utils";

export const CONVERSATIONS_KEY = "/api/conversations";

interface ConversationListProps {
  initialConversations: ConversationSummaryDTO[];
  selectedId: string | null;
  currentUserId: string;
}

/** Liste des conversations, rafraîchie automatiquement (derniers messages, non lus). */
export function ConversationList({ initialConversations, selectedId, currentUserId }: ConversationListProps) {
  const { data: conversations = initialConversations } = useSWR<ConversationSummaryDTO[]>(
    CONVERSATIONS_KEY,
    fetcher,
    { fallbackData: initialConversations, refreshInterval: POLL_INTERVALS.background },
  );

  if (conversations.length === 0) {
    return (
      <p className="px-6 py-12 text-center text-sm text-muted-foreground">
        Aucune conversation pour l&apos;instant. Quand une candidature est acceptée, une discussion s&apos;ouvre ici
        entre l&apos;organisateur et le participant.
      </p>
    );
  }

  return (
    <ul className="divide-y">
      {conversations.map((conversation) => {
        const sport = getSport(conversation.activity.sportType);
        const { lastMessage, unreadCount } = conversation;
        const isSelected = conversation.id === selectedId;
        const preview = lastMessage
          ? `${lastMessage.senderId === currentUserId && lastMessage.kind === "text" ? "Toi : " : ""}${lastMessage.content}`
          : "Aucun message pour l'instant";

        return (
          <li key={conversation.id}>
            <Link
              href={`/messages/${conversation.id}`}
              aria-current={isSelected ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 px-4 py-3 transition-colors outline-none hover:bg-muted/60 focus-visible:bg-muted",
                isSelected && "bg-brand-soft/70 hover:bg-brand-soft",
              )}
            >
              <div className="relative">
                <UserAvatar user={conversation.otherUser} className="size-12" />
                <span
                  aria-hidden
                  className="absolute -right-1 -bottom-1 flex size-6 items-center justify-center rounded-full bg-background text-sm shadow-sm"
                >
                  {sport.emoji}
                </span>
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <p className={cn("truncate", unreadCount > 0 ? "font-semibold" : "font-medium")}>
                    {conversation.otherUser.fullName}
                  </p>
                  <time dateTime={conversation.updatedAt} className="shrink-0 text-xs text-muted-foreground">
                    {formatRelativeShort(new Date(conversation.updatedAt))}
                  </time>
                </div>
                <p className="truncate text-xs text-muted-foreground">
                  {sport.label} · {formatDay(new Date(conversation.activity.startsAt))}
                </p>
                <div className="flex items-center justify-between gap-2">
                  <p
                    className={cn(
                      "truncate text-sm",
                      unreadCount > 0 ? "font-medium text-foreground" : "text-muted-foreground",
                    )}
                  >
                    {preview}
                  </p>
                  {unreadCount > 0 && (
                    <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-semibold text-primary-foreground">
                      {unreadCount > 9 ? "9+" : unreadCount}
                      <span className="sr-only"> non lus</span>
                    </span>
                  )}
                </div>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
