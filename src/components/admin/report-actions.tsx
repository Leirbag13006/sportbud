"use client";

import { Ban, Check, Loader2, RotateCcw } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { dismissReport, suspendUser, unsuspendUser, type AdminActionResult } from "@/lib/admin/actions";

interface ReportActionsProps {
  reportId: string;
  user: { id: string; username: string; suspended: boolean };
  resolved: boolean;
}

/** Actions de modération sur un signalement : classer, suspendre le membre, lever la suspension. */
export function ReportActions({ reportId, user, resolved }: ReportActionsProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const run = (action: () => Promise<AdminActionResult>, success: string) =>
    startTransition(async () => {
      const result = await action();
      if (result.ok) {
        toast.success(success);
        setConfirmOpen(false);
      } else toast.error(result.error);
    });

  return (
    <div className="flex flex-wrap gap-2">
      {!resolved && (
        <Button variant="outline" size="sm" disabled={isPending} onClick={() => run(() => dismissReport(reportId), "Signalement classé.")}>
          <Check aria-hidden />
          Classer sans suite
        </Button>
      )}
      {user.suspended ? (
        <Button
          variant="outline"
          size="sm"
          disabled={isPending}
          onClick={() => run(() => unsuspendUser(user.id), `Suspension de ${user.username} levée.`)}
        >
          <RotateCcw aria-hidden />
          Lever la suspension
        </Button>
      ) : (
        <Button variant="destructive" size="sm" disabled={isPending} onClick={() => setConfirmOpen(true)}>
          <Ban aria-hidden />
          Suspendre {user.username}
        </Button>
      )}

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Suspendre {user.username} ?</DialogTitle>
            <DialogDescription>
              Le membre est déconnecté et ne peut plus se connecter. Ses séances à venir sont annulées (les participants
              sont prévenus) et tous ses signalements en cours sont marqués comme traités. Tu pourras lever la suspension
              ensuite, mais les séances annulées le resteront.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" disabled={isPending} />}>Annuler</DialogClose>
            <Button
              variant="destructive"
              disabled={isPending}
              onClick={() => run(() => suspendUser(user.id), `Compte de ${user.username} suspendu.`)}
            >
              {isPending && <Loader2 className="animate-spin" aria-hidden />}
              Suspendre le compte
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
