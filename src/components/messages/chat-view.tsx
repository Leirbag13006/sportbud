"use client";

import { ArrowLeft, Loader2, MapPin, RotateCcw, SendHorizontal } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import useSWR, { useSWRConfig } from "swr";

import { UserAvatar } from "@/components/applications/user-avatar";
import { NOTIFICATIONS_KEY } from "@/components/layout/app-navigation";
import { Button } from "@/components/ui/button";
import { getSport } from "@/config/sports";
import { FetchError, fetcher, POLL_INTERVALS } from "@/lib/fetcher";
import { formatDay, formatDaySeparator, formatTime, isSameDay } from "@/lib/format";
import { markConversationRead, sendMessage } from "@/lib/messages/actions";
import type { ConversationWithMessagesDTO, MessageDTO } from "@/lib/messages/types";
import { cn } from "@/lib/utils";
import { CONVERSATIONS_KEY } from "./conversation-list";

/** Message affiché localement avant confirmation du serveur (envoi optimiste). */
type LocalMessage = MessageDTO & { status?: "sending" | "failed" };

interface ChatViewProps {
  initialData: ConversationWithMessagesDTO;
  currentUserId: string;
}

/** Écran de discussion : messages rafraîchis toutes les 2 s, envoi optimiste, lecture automatique. */
export function ChatView({ initialData, currentUserId }: ChatViewProps) {
  const router = useRouter();
  const { mutate: mutateGlobal } = useSWRConfig();
  const conversationId = initialData.conversation.id;
  const key = `/api/conversations/${conversationId}/messages`;

  const { data = initialData, error, mutate } = useSWR<ConversationWithMessagesDTO>(key, fetcher, {
    fallbackData: initialData,
    refreshInterval: POLL_INTERVALS.chat,
  });

  // Messages envoyés pas encore confirmés (ou en échec), affichés à la suite de ceux du serveur.
  const [localMessages, setLocalMessages] = useState<LocalMessage[]>([]);
  const messages: LocalMessage[] = [
    ...data.messages,
    ...localMessages.filter((local) => !data.messages.some((message) => message.id === local.id)),
  ];

  // Conversation supprimée entre-temps (désistement du participant) : retour à la liste.
  const isGone = error instanceof FetchError && error.status === 404;
  useEffect(() => {
    if (isGone) router.replace("/messages");
  }, [isGone, router]);

  // Lecture : dès qu'un message reçu n'est pas lu, on le marque comme lu puis on met à jour les badges.
  const hasUnread = data.messages.some((message) => message.senderId !== currentUserId && !message.readAt);
  useEffect(() => {
    if (!hasUnread) return;
    markConversationRead(conversationId).then(() => {
      mutate();
      mutateGlobal(NOTIFICATIONS_KEY);
      mutateGlobal(CONVERSATIONS_KEY);
    });
  }, [hasUnread, conversationId, mutate, mutateGlobal]);

  const send = async (content: string, retryOf?: string) => {
    const tempId = retryOf ?? `local-${crypto.randomUUID()}`;
    const optimistic: LocalMessage = {
      id: tempId,
      senderId: currentUserId,
      content,
      kind: "text",
      createdAt: new Date().toISOString(),
      readAt: null,
      status: "sending",
    };
    setLocalMessages((current) => [...current.filter((message) => message.id !== tempId), optimistic]);

    const result = await sendMessage(conversationId, content).catch(() => null);
    if (!result?.ok) {
      setLocalMessages((current) =>
        current.map((message) => (message.id === tempId ? { ...message, status: "failed" } : message)),
      );
      return;
    }

    // Remplace le message temporaire par la version serveur. Le cache SWR peut encore être vide
    // (seules les données initiales sont affichées) : on part alors des données affichées.
    await mutate(
      (current) => {
        const base = current ?? data;
        if (base.messages.some((message) => message.id === result.message.id)) return base;
        return { ...base, messages: [...base.messages, result.message] };
      },
      { revalidate: false },
    );
    setLocalMessages((current) => current.filter((message) => message.id !== tempId));
    mutateGlobal(CONVERSATIONS_KEY);
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <ChatHeader data={data} />
      <MessageList messages={messages} currentUserId={currentUserId} otherUser={data.conversation.otherUser} onRetry={send} />
      <Composer onSend={send} otherName={data.conversation.otherUser.fullName.split(" ")[0]!} />
    </div>
  );
}

/** En-tête : retour (mobile), interlocuteur et activité concernée. */
function ChatHeader({ data }: { data: ConversationWithMessagesDTO }) {
  const { conversation } = data;
  const sport = getSport(conversation.activity.sportType);
  const startsAt = new Date(conversation.activity.startsAt);

  return (
    <header className="flex shrink-0 items-center gap-3 border-b bg-background px-3 py-2 pt-[max(0.5rem,env(safe-area-inset-top))] md:px-4">
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        aria-label="Retour aux conversations"
        nativeButton={false}
        render={<Link href="/messages" />}
      >
        <ArrowLeft />
      </Button>
      <UserAvatar user={conversation.otherUser} />
      <div className="min-w-0 flex-1">
        <h1 className="truncate font-semibold">{conversation.otherUser.fullName}</h1>
        <p className="truncate text-xs text-muted-foreground">
          {conversation.myRole === "creator" ? "Participant" : "Organisateur"} · {sport.emoji} {sport.label},{" "}
          {formatDay(startsAt).toLowerCase()} à {formatTime(startsAt)}
        </p>
      </div>
      <Button
        variant="outline"
        size="sm"
        nativeButton={false}
        render={<Link href={`/?activity=${conversation.activity.id}`} />}
      >
        <MapPin aria-hidden />
        <span className="hidden sm:inline">Voir l&apos;activité</span>
      </Button>
    </header>
  );
}

interface MessageListProps {
  messages: LocalMessage[];
  currentUserId: string;
  otherUser: ConversationWithMessagesDTO["conversation"]["otherUser"];
  onRetry: (content: string, retryOf: string) => void;
}

/** Fil de messages avec séparateurs de jour ; défile automatiquement vers le bas. */
function MessageList({ messages, currentUserId, otherUser, onRetry }: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const isNearBottom = useRef(true);
  const lastMessage = messages.at(-1);

  // Défile vers le dernier message s'il est de moi ou si l'utilisateur était déjà en bas du fil.
  useLayoutEffect(() => {
    const element = scrollRef.current;
    if (!element) return;
    if (isNearBottom.current || lastMessage?.senderId === currentUserId) {
      element.scrollTop = element.scrollHeight;
    }
  }, [lastMessage?.id, lastMessage?.senderId, currentUserId]);

  return (
    <div
      ref={scrollRef}
      onScroll={(event) => {
        const element = event.currentTarget;
        isNearBottom.current = element.scrollHeight - element.scrollTop - element.clientHeight < 80;
      }}
      role="log"
      aria-live="polite"
      aria-label={`Conversation avec ${otherUser.fullName}`}
      className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-muted/30 px-3 py-4 md:px-6"
    >
      {messages.length === 0 && (
        <p className="py-12 text-center text-sm text-muted-foreground">
          Dis bonjour à {otherUser.fullName.split(" ")[0]} pour organiser votre séance 👋
        </p>
      )}

      <ol className="mx-auto flex max-w-2xl flex-col gap-1">
        {messages.map((message, index) => {
          const previous = messages[index - 1];
          const date = new Date(message.createdAt);
          const showDay = !previous || !isSameDay(new Date(previous.createdAt), date);
          const isMine = message.senderId === currentUserId;
          // Regroupe visuellement les messages consécutifs d'une même personne.
          const isGrouped = !showDay && previous?.senderId === message.senderId && previous.kind === message.kind;

          return (
            <li key={message.id} className="flex flex-col">
              {showDay && (
                <p className="my-3 self-center rounded-full bg-background px-3 py-1 text-xs font-medium text-muted-foreground shadow-xs">
                  {formatDaySeparator(date)}
                </p>
              )}

              {message.kind === "system" ? (
                <p className="my-2 self-center rounded-lg bg-brand-soft px-3 py-2 text-center text-xs text-primary">
                  🎉 {message.content}
                </p>
              ) : (
                <div className={cn("flex max-w-[80%] flex-col", isMine ? "items-end self-end" : "items-start self-start", !isGrouped && "mt-2")}>
                  <p
                    className={cn(
                      "rounded-2xl px-3.5 py-2 text-sm break-words whitespace-pre-wrap",
                      isMine ? "rounded-br-md bg-primary text-primary-foreground" : "rounded-bl-md bg-background shadow-xs",
                      message.status === "sending" && "opacity-70",
                      message.status === "failed" && "bg-destructive/10 text-destructive",
                    )}
                  >
                    {message.content}
                  </p>
                  <span className="mt-0.5 px-1 text-[11px] text-muted-foreground">
                    {message.status === "sending" ? (
                      "Envoi…"
                    ) : message.status === "failed" ? (
                      <button
                        type="button"
                        onClick={() => onRetry(message.content, message.id)}
                        className="inline-flex items-center gap-1 font-medium text-destructive underline-offset-2 hover:underline"
                      >
                        <RotateCcw className="size-3" aria-hidden />
                        Échec de l&apos;envoi, réessayer
                      </button>
                    ) : (
                      <>
                        {formatTime(date)}
                        {isMine && message.id === lastMessage?.id && message.readAt && " · Lu"}
                      </>
                    )}
                  </span>
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

/** Zone de saisie : Entrée envoie, Maj+Entrée ajoute une ligne. */
function Composer({ onSend, otherName }: { onSend: (content: string) => Promise<void>; otherName: string }) {
  const [value, setValue] = useState("");
  const [isSending, setIsSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const canSend = value.trim().length > 0 && !isSending;

  const submit = async (event?: FormEvent) => {
    event?.preventDefault();
    if (!canSend) return;
    const content = value.trim();
    setValue("");
    setIsSending(true);
    await onSend(content);
    setIsSending(false);
    textareaRef.current?.focus();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    // Pas d'envoi pendant une composition IME (accents, emojis sur certains claviers).
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      void submit();
    }
  };

  return (
    <form
      onSubmit={submit}
      className="flex shrink-0 items-end gap-2 border-t bg-background p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:px-6"
    >
      <label htmlFor="message-input" className="sr-only">
        Message à {otherName}
      </label>
      <textarea
        id="message-input"
        ref={textareaRef}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={handleKeyDown}
        rows={1}
        maxLength={2000}
        placeholder={`Écrire à ${otherName}…`}
        className="field-sizing-content max-h-32 min-h-10 flex-1 resize-none rounded-2xl border bg-muted/40 px-4 py-2 text-base outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm"
      />
      <Button type="submit" size="icon" disabled={!canSend} aria-label="Envoyer" className="size-10 shrink-0 rounded-full">
        {isSending ? <Loader2 className="animate-spin" /> : <SendHorizontal />}
      </Button>
    </form>
  );
}
