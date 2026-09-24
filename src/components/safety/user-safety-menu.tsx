"use client";

import { Ban, Flag, Loader2, MoreHorizontal, ShieldCheck } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import type { ReportReason } from "@/db/schema";
import { blockUser, reportUser, unblockUser } from "@/lib/safety/actions";
import { REPORT_REASONS, type BlockStatus } from "@/lib/safety/types";
import { cn } from "@/lib/utils";

interface UserSafetyMenuProps {
  user: { id: string; fullName: string };
  /** Blocage actuel (connu dans la messagerie) ; sinon le menu propose de bloquer. */
  blockStatus?: BlockStatus;
  /** Appelé après un blocage réussi (ex. fermer la fiche de l'activité). */
  onBlocked?: () => void;
  /** Appelé après un blocage ou un déblocage (ex. rafraîchir la conversation). */
  onChange?: () => void;
  className?: string;
}

/** Menu « ⋯ » d'un membre : le signaler à l'équipe ou le bloquer / débloquer. */
export function UserSafetyMenu({ user, blockStatus = null, onBlocked, onChange, className }: UserSafetyMenuProps) {
  const [dialog, setDialog] = useState<"report" | "block" | null>(null);
  const [isPending, startTransition] = useTransition();
  const firstName = user.fullName.split(" ")[0];

  const unblock = () =>
    startTransition(async () => {
      const result = await unblockUser(user.id);
      if (result.ok) {
        toast.success(`${firstName} est débloqué·e.`);
        onChange?.();
      } else {
        toast.error(result.error ?? "Impossible de débloquer ce membre.");
      }
    });

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="ghost" size="icon" className={className} aria-label={`Options pour ${user.fullName}`} />
          }
        >
          {isPending ? <Loader2 className="animate-spin" aria-hidden /> : <MoreHorizontal aria-hidden />}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-auto min-w-52">
          <DropdownMenuItem onClick={() => setDialog("report")}>
            <Flag aria-hidden />
            Signaler {firstName}
          </DropdownMenuItem>
          {blockStatus === "by-me" ? (
            <DropdownMenuItem onClick={unblock}>
              <ShieldCheck aria-hidden />
              Débloquer {firstName}
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem variant="destructive" onClick={() => setDialog("block")}>
              <Ban aria-hidden />
              Bloquer {firstName}
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <ReportDialog user={user} open={dialog === "report"} onClose={() => setDialog(null)} />
      <BlockDialog
        user={user}
        open={dialog === "block"}
        onClose={() => setDialog(null)}
        onBlocked={() => {
          setDialog(null);
          onBlocked?.();
          onChange?.();
        }}
      />
    </>
  );
}

interface SafetyDialogProps {
  user: { id: string; fullName: string };
  open: boolean;
  onClose: () => void;
}

/** Signalement : motif + précisions, envoyé à l'équipe de modération. */
function ReportDialog({ user, open, onClose }: SafetyDialogProps) {
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [details, setDetails] = useState("");
  const [errors, setErrors] = useState<Record<string, string[] | undefined>>({});
  const [isPending, startTransition] = useTransition();

  const close = () => {
    onClose();
    setReason(null);
    setDetails("");
    setErrors({});
  };

  const submit = () => {
    if (!reason) {
      setErrors({ reason: ["Choisis un motif."] });
      return;
    }
    startTransition(async () => {
      const result = await reportUser({ reportedId: user.id, reason, details });
      if (result.ok) {
        toast.success("Merci. Notre équipe examine ton signalement sous 24 h.");
        close();
      } else {
        setErrors(result.fieldErrors ?? {});
        if (result.error) toast.error(result.error);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !next && close()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-lg font-extrabold">Signaler {user.fullName}</DialogTitle>
          <DialogDescription>
            Ton signalement est confidentiel : {user.fullName.split(" ")[0]} ne saura pas qu&apos;il vient de toi.
          </DialogDescription>
        </DialogHeader>

        <fieldset>
          <legend className="sr-only">Motif du signalement</legend>
          <div className="grid gap-2" role="radiogroup">
            {REPORT_REASONS.map((option) => (
              <label
                key={option.value}
                className={cn(
                  "flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors has-focus-visible:ring-3 has-focus-visible:ring-ring",
                  reason === option.value ? "border-mint-500 bg-mint-100/60" : "hover:bg-muted",
                )}
              >
                <input
                  type="radio"
                  name="report-reason"
                  value={option.value}
                  checked={reason === option.value}
                  onChange={() => {
                    setReason(option.value);
                    setErrors({});
                  }}
                  className="mt-0.5 accent-mint-600"
                />
                <span className="text-sm">
                  <span className="block font-semibold text-ink">{option.label}</span>
                  <span className="text-gray-400">{option.description}</span>
                </span>
              </label>
            ))}
          </div>
          {errors.reason && <p className="mt-1 text-sm text-destructive">{errors.reason[0]}</p>}
        </fieldset>

        <div>
          <label htmlFor="report-details" className="text-sm font-medium">
            Précisions {reason === "other" ? "(obligatoire)" : "(facultatif)"}
          </label>
          <Textarea
            id="report-details"
            value={details}
            onChange={(event) => {
              setDetails(event.target.value);
              setErrors((previous) => ({ ...previous, details: undefined }));
            }}
            maxLength={1000}
            rows={3}
            className="mt-1.5"
            placeholder="Que s'est-il passé ?"
            aria-invalid={Boolean(errors.details)}
          />
          {errors.details && <p className="mt-1 text-sm text-destructive">{errors.details[0]}</p>}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={close} disabled={isPending}>
            Annuler
          </Button>
          <Button onClick={submit} disabled={isPending}>
            {isPending ? <Loader2 className="animate-spin" aria-hidden /> : <Flag aria-hidden />}
            Envoyer le signalement
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** Confirmation de blocage, avec ses conséquences. */
function BlockDialog({ user, open, onClose, onBlocked }: SafetyDialogProps & { onBlocked: () => void }) {
  const [isPending, startTransition] = useTransition();
  const firstName = user.fullName.split(" ")[0];

  const confirm = () =>
    startTransition(async () => {
      const result = await blockUser(user.id);
      if (result.ok) {
        toast.success(`${firstName} est bloqué·e.`);
        onBlocked();
      } else {
        toast.error(result.error ?? "Impossible de bloquer ce membre.");
      }
    });

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-lg font-extrabold">Bloquer {user.fullName} ?</DialogTitle>
          <DialogDescription>Tu pourras le débloquer à tout moment depuis ton profil.</DialogDescription>
        </DialogHeader>
        <ul className="list-disc space-y-1.5 pl-5 text-sm">
          <li>Vous ne verrez plus vos activités respectives.</li>
          <li>Les candidatures en attente entre vous seront refusées.</li>
          <li>Vous ne pourrez plus vous écrire.</li>
        </ul>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={isPending}>
            Annuler
          </Button>
          <Button variant="destructive" onClick={confirm} disabled={isPending}>
            {isPending ? <Loader2 className="animate-spin" aria-hidden /> : <Ban aria-hidden />}
            Bloquer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
