"use client";

import { Loader2 } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { UserAvatar } from "@/components/applications/user-avatar";
import { Button } from "@/components/ui/button";
import { unblockUser } from "@/lib/safety/actions";
import type { BlockedUser } from "@/lib/safety/types";

const dateFormatter = new Intl.DateTimeFormat("fr-FR", { timeZone: "Europe/Paris", day: "numeric", month: "long", year: "numeric" });

/** Membres bloqués, avec un bouton pour les débloquer. */
export function BlockedUsersList({ users }: { users: BlockedUser[] }) {
  if (users.length === 0) return <p className="text-sm text-gray-400">Tu n&apos;as bloqué personne.</p>;

  return (
    <ul className="divide-y">
      {users.map((user) => (
        <BlockedUserRow key={user.id} user={user} />
      ))}
    </ul>
  );
}

function BlockedUserRow({ user }: { user: BlockedUser }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const unblock = () =>
    startTransition(async () => {
      const result = await unblockUser(user.id);
      if (result.ok) toast.success(`${user.username} est débloqué·e.`);
      else setError(result.error ?? "Impossible de débloquer ce membre.");
    });

  return (
    <li className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
      <UserAvatar user={user} className="size-9 text-xs" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-ink">{user.username}</p>
        <p className="text-xs text-gray-400">Bloqué·e le {dateFormatter.format(user.blockedAt)}</p>
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>
      <Button variant="outline" size="sm" onClick={unblock} disabled={isPending}>
        {isPending && <Loader2 className="animate-spin" aria-hidden />}
        Débloquer
      </Button>
    </li>
  );
}
