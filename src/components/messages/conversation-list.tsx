"use client";

import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { useState, type ReactNode } from "react";
import useSWR from "swr";

import { UserAvatar } from "@/components/applications/user-avatar";
import { SportIcon } from "@/components/brand/sport-icon";
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

/**
 * Liste des conversations, rafraîchie automatiquement (derniers messages, non lus).
 * Les séances à venir d'abord ; celles déjà terminées sont repliées (sauf message non lu ou conversation ouverte).
 */
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

  const upcoming = conversations.filter((conversation) => !conversation.activity.ended);
  const past = conversations.filter((conversation) => conversation.activity.ended);
  const pastNeedsAttention = past.some((conversation) => conversation.unreadCount > 0 || conversation.id === selectedId);

  const rows = (items: ConversationSummaryDTO[]) => (
    <ul className="divide-y">
      {items.map((conversation) => {
        const sport = getSport(conversation.activity.sportType);
        const { lastMessage, unreadCount } = conversation;
        const isSelected = conversation.id === selectedId;
        // Seul le message automatique d'acceptation : on invite à lancer la discussion.
        const isNew = !lastMessage || lastMessage.kind === "system";
        const preview = isNew
          ? "Nouvelle discussion : dis bonjour 👋"
          : `${lastMessage.senderId === currentUserId ? "Toi : " : ""}${lastMessage.content}`;

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
                  className="absolute -right-1 -bottom-1 flex size-6 items-center justify-center rounded-full bg-card shadow-sm ring-2 ring-background"
                >
                  <SportIcon sport={conversation.activity.sportType} className="size-4" />
                </span>
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <p className={cn("truncate", unreadCount > 0 ? "font-semibold" : "font-medium")}>
                    {conversation.otherUser.username}
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
                      isNew && unreadCount === 0 && "text-brand-text",
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

  return (
    <div>
      {upcoming.length > 0 && (
        <section aria-labelledby="conversations-upcoming">
          <h2 id="conversations-upcoming" className="px-4 pt-3 pb-1 font-display text-xs font-bold tracking-eyebrow text-gray-400 uppercase">
            Séances à venir
          </h2>
          {rows(upcoming)}
        </section>
      )}
      {past.length > 0 && <PastConversations count={past.length} defaultOpen={upcoming.length === 0 || pastNeedsAttention}>{rows(past)}</PastConversations>}
    </div>
  );
}

/** Groupe repliable des conversations de séances terminées. */
function PastConversations({ count, defaultOpen, children }: { count: number; defaultOpen: boolean; children: ReactNode }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="border-t">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="flex min-h-11 w-full items-center justify-between gap-2 px-4 py-2 font-display text-xs font-bold tracking-eyebrow text-gray-400 uppercase outline-none hover:text-ink focus-visible:bg-muted"
      >
        Séances terminées ({count})
        <ChevronDown className={cn("size-4 transition-transform motion-reduce:transition-none", open && "rotate-180")} aria-hidden />
      </button>
      {open && children}
    </section>
  );
}
