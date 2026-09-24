"use client";

import { Check, Loader2, MessageCircle, X } from "lucide-react";
import Link from "next/link";
import { useState, useTransition, type ReactNode } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { getSportLevelLabel } from "@/config/sport-levels";
import { respondToApplication } from "@/lib/applications/actions";
import type { ReceivedApplication } from "@/lib/applications/types";
import { RatingSummaryBadge } from "@/components/reviews/rating-stars";
import { ApplicantProfileDialog } from "./applicant-profile-dialog";
import { ApplicationStatusBadge } from "./application-status-badge";
import { UserAvatar } from "./user-avatar";

interface ReceivedApplicationRowProps {
  application: ReceivedApplication;
  /** Plus de place : l'acceptation est désactivée. */
  isFull: boolean;
  /** Contexte affiché sous le nom (ex. l'activité concernée, dans le tableau de bord). */
  context?: ReactNode;
}

/**
 * Candidature reçue : candidat (profil consultable), statut et boutons Accepter / Refuser.
 */
export function ReceivedApplicationRow({ application, isFull, context }: ReceivedApplicationRowProps) {
  const [showProfile, setShowProfile] = useState(false);
  const [pendingDecision, setPendingDecision] = useState<"accepted" | "rejected" | null>(null);
  const [, startTransition] = useTransition();
  const { applicant } = application;
  const firstName = applicant.fullName.split(" ")[0];

  const respond = (decision: "accepted" | "rejected") => {
    setPendingDecision(decision);
    startTransition(async () => {
      const result = await respondToApplication(application.id, decision);
      setPendingDecision(null);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setShowProfile(false);
      if (decision === "accepted") {
        toast.success(`${firstName} fait partie de l'activité !`, {
          description: "Vous pourrez bientôt discuter dans la messagerie.",
        });
      } else {
        toast(`Candidature de ${firstName} refusée.`);
      }
    });
  };

  const isPending = application.status === "pending";
  const busy = pendingDecision !== null;

  const actions = isPending && (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => respond("rejected")}
        disabled={busy}
        aria-label={`Refuser la candidature de ${applicant.fullName}`}
      >
        {pendingDecision === "rejected" ? <Loader2 className="animate-spin" /> : <X />}
        Refuser
      </Button>
      <Button
        size="sm"
        onClick={() => respond("accepted")}
        disabled={busy || isFull}
        title={isFull ? "Plus de place disponible" : undefined}
        aria-label={`Accepter la candidature de ${applicant.fullName}`}
      >
        {pendingDecision === "accepted" ? <Loader2 className="animate-spin" /> : <Check />}
        Accepter
      </Button>
    </>
  );

  return (
    <li className="flex flex-wrap items-center gap-3 rounded-card bg-card p-3 shadow-md">
      <button
        type="button"
        onClick={() => setShowProfile(true)}
        className="flex min-w-0 flex-1 items-center gap-3 rounded-lg text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        aria-label={`Voir le profil de ${applicant.fullName}`}
      >
        <UserAvatar user={applicant} />
        <span className="min-w-0">
          <span className="block truncate font-display text-sm font-bold text-ink">{applicant.fullName}</span>
          <span className="block truncate text-xs text-muted-foreground">
            {context ?? getSportLevelLabel(applicant.sportLevel)} · Voir le profil
          </span>
          <RatingSummaryBadge rating={application.applicantRating} className="mt-0.5" />
        </span>
      </button>

      {isPending ? (
        <div className="flex gap-2">{actions}</div>
      ) : (
        <div className="flex items-center gap-2">
          <ApplicationStatusBadge status={application.status} />
          {application.status === "accepted" && (
            <Button
              variant="outline"
              size="icon-sm"
              aria-label={`Discuter avec ${applicant.fullName}`}
              title="Discuter"
              nativeButton={false}
              render={<Link href={`/messages/${application.id}`} />}
            >
              <MessageCircle />
            </Button>
          )}
        </div>
      )}

      <ApplicantProfileDialog
        applicant={showProfile ? applicant : null}
        rating={application.applicantRating}
        reviews={application.applicantReviews}
        badges={application.applicantBadges}
        onClose={() => setShowProfile(false)}
        actions={actions || undefined}
      />
    </li>
  );
}
