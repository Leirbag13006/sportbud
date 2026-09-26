"use client";

import { ArrowLeft, Ban, CalendarX, Loader2, LogOut, MapPin, MessageCircle, RotateCcw, SendHorizontal, UsersRound } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import useSWR, { useSWRConfig } from "swr";

import { UserAvatar } from "@/components/applications/user-avatar";
import { NOTIFICATIONS_KEY } from "@/components/layout/app-navigation";
import { SportIcon } from "@/components/brand/sport-icon";
import { UserSafetyMenu } from "@/components/safety/user-safety-menu";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getSportLevelLabel } from "@/config/sport-levels";
import { getSport } from "@/config/sports";
import { FetchError, fetcher, POLL_INTERVALS } from "@/lib/fetcher";
import { formatDay, formatDaySeparator, formatTime, isSameDay } from "@/lib/format";
import { markConversationRead, sendMessage } from "@/lib/messages/actions";
import type { ConversationWithMessagesDTO, GroupConversationDTO, MessageDTO, PrivateConversationDTO } from "@/lib/messages/types";
import { cn } from "@/lib/utils";
import { CONVERSATIONS_KEY } from "./conversation-list";

/** Message affiché localement avant confirmation du serveur (envoi optimiste). */
type LocalMessage = MessageDTO & { status?: "sending" | "failed" };

interface ChatViewProps {
  initialData: ConversationWithMessagesDTO;
  currentUserId: string;
}

/**
 * Écran de discussion (privée ou groupe de la séance) : messages rafraîchis toutes les 3 s,
 * envoi optimiste, lecture automatique.
 */
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

  // Conversation plus accessible entre-temps (désistement, séance supprimée) : retour à la liste.
  const isGone = error instanceof FetchError && error.status === 404;
  useEffect(() => {
    if (isGone) router.replace("/messages");
  }, [isGone, router]);

  // Lecture : dès qu'un message reçu n'est pas lu, on le marque comme lu puis on met à jour les badges.
  // Privé : état de lecture de chaque message. Groupe : le dernier message reçu (lecture enregistrée par membre).
  const isGroup = data.conversation.kind === "group";
  const lastReceived = data.messages.findLast((message) => message.senderId !== currentUserId);
  const unreadKey = isGroup
    ? (lastReceived?.id ?? null)
    : data.messages.some((message) => message.senderId !== currentUserId && !message.readAt)
      ? "unread"
      : null;
  useEffect(() => {
    if (!unreadKey) return;
    markConversationRead(conversationId).then(() => {
      if (!isGroup) mutate();
      mutateGlobal(NOTIFICATIONS_KEY);
      mutateGlobal(CONVERSATIONS_KEY);
    });
  }, [unreadKey, isGroup, conversationId, mutate, mutateGlobal]);

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

  const { conversation } = data;
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {conversation.kind === "group" ? (
        <>
          <GroupChatHeader conversation={conversation} currentUserId={currentUserId} />
          <MessageList
            messages={messages}
            currentUserId={currentUserId}
            label={`Discussion de groupe : ${conversation.activity.title}`}
            emptyText="Lance la discussion avec le groupe pour caler les derniers détails 👋"
            showSenders
            onRetry={send}
          />
          {conversation.activity.cancelled ? (
            <Notice icon={CalendarX}>Séance annulée : la discussion est close.</Notice>
          ) : (
            <Composer onSend={send} label="Message au groupe" placeholder="Écrire au groupe…" />
          )}
        </>
      ) : (
        <>
          <PrivateChatHeader conversation={conversation} onSafetyChange={() => void mutate()} />
          <MessageList
            messages={messages}
            currentUserId={currentUserId}
            label={`Conversation avec ${conversation.otherUser.username}`}
            emptyText={`Écris à ${conversation.otherUser.username} en privé 👋`}
            onRetry={send}
          />
          {conversation.blockStatus ? (
            <BlockedNotice status={conversation.blockStatus} />
          ) : conversation.withdrawn ? (
            <WithdrawnNotice myRole={conversation.myRole} />
          ) : (
            <Composer
              onSend={send}
              label={`Message à ${conversation.otherUser.username}`}
              placeholder={`Écrire à ${conversation.otherUser.username}…`}
            />
          )}
        </>
      )}
    </div>
  );
}

/** Remplace la zone de saisie quand l'envoi n'est plus possible. */
function Notice({ icon: Icon, children }: { icon: typeof Ban; children: string }) {
  return (
    <p className="flex shrink-0 items-center justify-center gap-2 border-t bg-muted/40 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] text-center text-sm text-gray-600">
      <Icon className="size-4 shrink-0" aria-hidden />
      {children}
    </p>
  );
}

/** L'un des deux membres a bloqué l'autre. */
function BlockedNotice({ status }: { status: "by-me" | "by-them" }) {
  return (
    <Notice icon={Ban}>
      {status === "by-me"
        ? "Tu as bloqué ce membre. Débloque-le depuis le menu ⋯ pour lui écrire à nouveau."
        : "Tu ne peux plus écrire à ce membre."}
    </Notice>
  );
}

/** Le participant s'est désisté. */
function WithdrawnNotice({ myRole }: { myRole: "creator" | "participant" }) {
  return (
    <Notice icon={LogOut}>
      {myRole === "creator"
        ? "Ce participant a quitté la séance : la conversation est close."
        : "Tu as quitté cette séance : la conversation est close."}
    </Notice>
  );
}

/** Retour à la liste (mobile). */
function BackButton() {
  return (
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
  );
}

const headerClass =
  "flex shrink-0 items-center gap-3 border-b bg-background px-3 py-2 pt-[max(0.5rem,env(safe-area-inset-top))] md:px-4";

/** Lien vers la fiche de la séance dans l'Explorer. */
function ActivityLink({ activityId }: { activityId: string }) {
  return (
    <Button variant="outline" size="sm" nativeButton={false} render={<Link href={`/?activity=${activityId}`} />}>
      <MapPin aria-hidden />
      <span className="hidden sm:inline">Voir l&apos;activité</span>
    </Button>
  );
}

/** En-tête d'une conversation privée : interlocuteur, activité concernée et options (signaler / bloquer). */
function PrivateChatHeader({ conversation, onSafetyChange }: { conversation: PrivateConversationDTO; onSafetyChange: () => void }) {
  const sport = getSport(conversation.activity.sportType);
  const startsAt = new Date(conversation.activity.startsAt);

  return (
    <header className={headerClass}>
      <BackButton />
      <UserAvatar user={conversation.otherUser} />
      <div className="min-w-0 flex-1">
        <h1 className="truncate font-semibold">{conversation.otherUser.username}</h1>
        <p className="truncate text-xs text-muted-foreground">
          {conversation.myRole === "creator" ? "Participant" : "Organisateur"} · {sport.label},{" "}
          {formatDay(startsAt).toLowerCase()} à {formatTime(startsAt)} · Privé
        </p>
      </div>
      <ActivityLink activityId={conversation.activity.id} />
      <UserSafetyMenu
        user={conversation.otherUser}
        blockStatus={conversation.blockStatus}
        onChange={onSafetyChange}
      />
    </header>
  );
}

/** En-tête du groupe de la séance : titre, date et liste des membres (avec accès au privé). */
function GroupChatHeader({ conversation, currentUserId }: { conversation: GroupConversationDTO; currentUserId: string }) {
  const [membersOpen, setMembersOpen] = useState(false);
  const sport = getSport(conversation.activity.sportType);
  const startsAt = new Date(conversation.activity.startsAt);
  const others = conversation.members.filter((member) => member.id !== currentUserId);

  return (
    <header className={headerClass}>
      <BackButton />
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-soft">
        <SportIcon sport={conversation.activity.sportType} className="size-6" />
      </span>
      <div className="min-w-0 flex-1">
        <h1 className="truncate font-semibold">{conversation.activity.title}</h1>
        <p className="truncate text-xs text-muted-foreground">
          Groupe · {sport.label}, {formatDay(startsAt).toLowerCase()} à {formatTime(startsAt)}
        </p>
      </div>
      <Button variant="outline" size="sm" onClick={() => setMembersOpen(true)} aria-label={`Membres du groupe (${conversation.members.length})`}>
        <UsersRound aria-hidden />
        {conversation.members.length}
      </Button>
      <ActivityLink activityId={conversation.activity.id} />

      <Dialog open={membersOpen} onOpenChange={setMembersOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Membres du groupe</DialogTitle>
            <DialogDescription>
              L&apos;organisateur et les participants acceptés. Tu peux aussi écrire en privé à l&apos;organisateur
              (ou, si tu organises, à chaque participant).
            </DialogDescription>
          </DialogHeader>
          <ul className="divide-y">
            {others.map((member) => (
              <li key={member.id} className="flex items-center gap-3 py-2.5">
                <UserAvatar user={member} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{member.username}</p>
                  <p className="text-xs text-muted-foreground">
                    {member.role === "creator" ? "Organisateur" : "Participant"} · {getSportLevelLabel(member.sportLevel)}
                  </p>
                </div>
                {member.privateConversationId && (
                  <Button
                    variant="outline"
                    size="sm"
                    nativeButton={false}
                    render={<Link href={`/messages/${member.privateConversationId}`} />}
                  >
                    <MessageCircle aria-hidden />
                    Privé
                  </Button>
                )}
              </li>
            ))}
          </ul>
        </DialogContent>
      </Dialog>
    </header>
  );
}

interface MessageListProps {
  messages: LocalMessage[];
  currentUserId: string;
  /** Nom accessible du fil. */
  label: string;
  emptyText: string;
  /** Groupe : nom et photo de l'auteur au-dessus de ses messages. */
  showSenders?: boolean;
  onRetry: (content: string, retryOf: string) => void;
}

/** Fil de messages avec séparateurs de jour ; défile automatiquement vers le bas. */
function MessageList({ messages, currentUserId, label, emptyText, showSenders = false, onRetry }: MessageListProps) {
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
      aria-label={label}
      className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-muted/30 px-3 py-4 md:px-6"
    >
      {messages.length === 0 && (
        <p className="py-12 text-center text-sm text-muted-foreground">
          {emptyText}
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
                <p className="my-2 self-center rounded-lg bg-brand-soft px-3 py-2 text-center text-xs text-brand-text">
                  🎉 {message.content}
                </p>
              ) : (
                <div className={cn("flex max-w-[80%] flex-col", isMine ? "items-end self-end" : "items-start self-start", !isGrouped && "mt-2")}>
                  {showSenders && !isMine && !isGrouped && message.sender && (
                    <span className="mb-1 flex items-center gap-1.5 px-1 text-xs font-medium text-gray-600">
                      <UserAvatar user={message.sender} className="size-5 text-[8px]" />
                      {message.sender.username}
                    </span>
                  )}
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
                        {!showSenders && isMine && message.id === lastMessage?.id && message.readAt && " · Lu"}
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
function Composer({ onSend, label, placeholder }: { onSend: (content: string) => Promise<void>; label: string; placeholder: string }) {
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
        {label}
      </label>
      <textarea
        id="message-input"
        ref={textareaRef}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={handleKeyDown}
        rows={1}
        maxLength={2000}
        placeholder={placeholder}
        className="field-sizing-content max-h-32 min-h-10 flex-1 resize-none rounded-2xl border bg-muted/40 px-4 py-2 text-base outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm"
      />
      <Button type="submit" size="icon" disabled={!canSend} aria-label="Envoyer" className="size-10 shrink-0 rounded-full">
        {isSending ? <Loader2 className="animate-spin" /> : <SendHorizontal />}
      </Button>
    </form>
  );
}
