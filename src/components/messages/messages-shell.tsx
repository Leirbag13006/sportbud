"use client";

import { useSelectedLayoutSegment } from "next/navigation";
import type { ReactNode } from "react";

import type { ConversationSummaryDTO } from "@/lib/messages/types";
import { cn } from "@/lib/utils";
import { ConversationList } from "./conversation-list";

interface MessagesShellProps {
  initialConversations: ConversationSummaryDTO[];
  currentUserId: string;
  children: ReactNode;
}

/**
 * Mise en page de la messagerie.
 * Desktop : liste des conversations à gauche, conversation ouverte à droite.
 * Mobile : la liste, ou la conversation ouverte en plein écran.
 */
export function MessagesShell({ initialConversations, currentUserId, children }: MessagesShellProps) {
  // Segment enfant = identifiant de la conversation ouverte (/messages/[id]), sinon null.
  const selectedId = useSelectedLayoutSegment();

  return (
    <div className="flex min-h-0 flex-1">
      <aside
        aria-label="Conversations"
        className={cn(
          "min-h-0 w-full flex-col overflow-y-auto md:w-80 md:shrink-0 md:border-r lg:w-96",
          selectedId ? "hidden md:flex" : "flex",
        )}
      >
        <header className="sticky top-0 z-10 border-b bg-background/95 px-4 pt-[env(safe-area-inset-top)] backdrop-blur">
          <h1 className="flex h-14 items-center text-lg font-semibold tracking-tight">Messages</h1>
        </header>
        <ConversationList
          initialConversations={initialConversations}
          selectedId={selectedId}
          currentUserId={currentUserId}
        />
      </aside>

      <section className={cn("min-h-0 min-w-0 flex-1 flex-col", selectedId ? "flex" : "hidden md:flex")}>
        {children}
      </section>
    </div>
  );
}
