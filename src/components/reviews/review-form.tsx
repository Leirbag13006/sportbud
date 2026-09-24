"use client";

import { Check, Loader2, Pencil } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { UserAvatar } from "@/components/applications/user-avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { getSportLevelLabel } from "@/config/sport-levels";
import { submitReview } from "@/lib/reviews/actions";
import type { ActivityRole, ParticipantToReview } from "@/lib/reviews/types";
import { cn } from "@/lib/utils";
import { RatingStars } from "./rating-stars";
import { StarInput } from "./star-input";

/** Absence ou annulation : 1 étoile par défaut quand on choisit ce tag. */
const NO_SHOW = "Ne s'est pas présenté·e";
const CANCELLED = "Annulé sans prévenir";

/** Suggestions pour aller vite (ajoutées au commentaire), selon le rôle du membre noté. */
const QUICK_TAGS: Record<ActivityRole, string[]> = {
  participant: ["Ponctuel·le", "Super ambiance", "Bon niveau", "Fair-play", NO_SHOW, "En retard"],
  organizer: ["Bien organisé", "Accueillant·e", "Lieu au top", "Ponctuel·le", CANCELLED, "En retard"],
};
const SEVERE_TAGS = new Set([NO_SHOW, CANCELLED]);

interface ReviewFormProps {
  activityId: string;
  participant: ParticipantToReview;
  /** Rôle du membre noté : adapte les suggestions. */
  revieweeRole?: ActivityRole;
}

/** Note (1 à 5) + commentaire d'un membre après la séance (participant ou organisateur). */
export function ReviewForm({ activityId, participant, revieweeRole = "participant" }: ReviewFormProps) {
  const { user, review } = participant;
  const [editing, setEditing] = useState(review === null);
  const [rating, setRating] = useState(review?.rating ?? 0);
  const [comment, setComment] = useState(review?.comment ?? "");
  const [errors, setErrors] = useState<Record<string, string[] | undefined>>({});
  const [isPending, startTransition] = useTransition();
  const firstName = user.fullName.split(" ")[0];

  const addTag = (tag: string) => {
    setComment((current) => (current.includes(tag) ? current : current ? `${current.trim()} · ${tag}` : tag));
    // Absence ou annulation sans note choisie : 1 étoile par défaut (modifiable).
    if (SEVERE_TAGS.has(tag) && rating === 0) setRating(1);
    setErrors((previous) => ({ ...previous, comment: undefined, rating: undefined }));
  };

  const submit = () => {
    if (rating === 0) {
      setErrors({ rating: ["Choisis une note."] });
      return;
    }
    startTransition(async () => {
      const result = await submitReview({ activityId, revieweeId: user.id, rating, comment });
      if (result.ok) {
        toast.success(`Avis publié pour ${firstName}. Merci !`);
        setEditing(false);
        setErrors({});
      } else {
        setErrors(result.fieldErrors ?? {});
        if (result.error) toast.error(result.error);
      }
    });
  };

  return (
    <div className="rounded-card bg-card p-4 shadow-md">
      <div className="flex items-center gap-3">
        <UserAvatar user={user} />
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-sm font-bold text-ink">{user.fullName}</p>
          <p className="text-xs text-gray-400">
            {revieweeRole === "organizer" ? "Organisateur·rice" : getSportLevelLabel(user.sportLevel)}
          </p>
        </div>
        {!editing && (
          <Button variant="ghost" size="sm" onClick={() => setEditing(true)} aria-label={`Modifier l'avis sur ${user.fullName}`}>
            <Pencil aria-hidden />
            Modifier
          </Button>
        )}
      </div>

      {editing ? (
        <div className="mt-4 space-y-3">
          <div>
            <StarInput name={`rating-${user.id}`} value={rating} onChange={(value) => {
              setRating(value);
              setErrors((previous) => ({ ...previous, rating: undefined, comment: undefined }));
            }} invalid={Boolean(errors.rating)} />
            {errors.rating && <p className="mt-1 text-sm text-destructive">{errors.rating[0]}</p>}
          </div>

          <div className="flex flex-wrap gap-1.5">
            {QUICK_TAGS[revieweeRole].map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => addTag(tag)}
                className={cn(
                  "rounded-full border px-2.5 py-1 text-xs transition-colors outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring",
                  comment.includes(tag) && "border-mint-500 bg-mint-100 text-mint-700",
                )}
              >
                {tag}
              </button>
            ))}
          </div>

          <div>
            <label htmlFor={`comment-${user.id}`} className="sr-only">
              Commentaire sur {user.fullName}
            </label>
            <Textarea
              id={`comment-${user.id}`}
              value={comment}
              onChange={(event) => {
                setComment(event.target.value);
                setErrors((previous) => ({ ...previous, comment: undefined }));
              }}
              maxLength={500}
              rows={2}
              placeholder={rating > 0 && rating <= 2 ? "Explique ta note (obligatoire)" : `Un mot sur ${firstName} ? (facultatif)`}
              aria-invalid={Boolean(errors.comment)}
            />
            {errors.comment && <p className="mt-1 text-sm text-destructive">{errors.comment[0]}</p>}
          </div>

          <div className="flex justify-end gap-2">
            {review && (
              <Button variant="ghost" onClick={() => setEditing(false)} disabled={isPending}>
                Annuler
              </Button>
            )}
            <Button onClick={submit} disabled={isPending}>
              {isPending ? <Loader2 className="animate-spin" aria-hidden /> : <Check aria-hidden />}
              Publier l&apos;avis
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-3 flex items-start gap-2 text-sm">
          <RatingStars value={rating} className="mt-0.5 text-sm" />
          <span className="sr-only">{rating} sur 5</span>
          {comment && <p className="min-w-0 flex-1 text-pretty">{comment}</p>}
        </div>
      )}
    </div>
  );
}
