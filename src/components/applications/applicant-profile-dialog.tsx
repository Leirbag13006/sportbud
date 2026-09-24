"use client";

import { CalendarDays } from "lucide-react";
import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getSportLevelLabel } from "@/config/sport-levels";
import type { ApplicantProfile } from "@/lib/applications/types";
import { UserAvatar } from "./user-avatar";

const memberSince = new Intl.DateTimeFormat("fr-FR", { month: "long", year: "numeric" });

interface ApplicantProfileDialogProps {
  applicant: ApplicantProfile | null;
  onClose: () => void;
  /** Boutons d'action affichés en bas (Accepter / Refuser). */
  actions?: ReactNode;
}

/** Profil public d'un candidat, consulté par le créateur avant de répondre. */
export function ApplicantProfileDialog({ applicant, onClose, actions }: ApplicantProfileDialogProps) {
  return (
    <Dialog open={applicant !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-sm">
        {applicant && (
          <>
            <DialogHeader className="items-center text-center">
              <UserAvatar user={applicant} className="size-20 text-xl" />
              <DialogTitle className="text-lg">{applicant.fullName}</DialogTitle>
              <DialogDescription className="flex flex-col items-center gap-2">
                <Badge variant="secondary">{getSportLevelLabel(applicant.sportLevel)}</Badge>
                <span className="flex items-center gap-1.5 text-xs">
                  <CalendarDays className="size-3.5" aria-hidden />
                  Membre depuis {memberSince.format(applicant.createdAt)}
                </span>
              </DialogDescription>
            </DialogHeader>

            <div className="rounded-lg bg-muted/60 p-3">
              <p className="text-xs font-medium text-muted-foreground">Bio</p>
              <p className="mt-1 text-sm whitespace-pre-line">
                {applicant.bio || "Ce membre n'a pas encore écrit de bio."}
              </p>
            </div>

            {actions && <DialogFooter className="gap-2 sm:justify-center">{actions}</DialogFooter>}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
