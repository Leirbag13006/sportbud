"use client";

import { Camera, Loader2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition, type FormEvent } from "react";
import { toast } from "sonner";

import { UserAvatar } from "@/components/applications/user-avatar";
import { SportLevelPicker } from "@/components/auth/sport-level-picker";
import { SportIcon } from "@/components/brand/sport-icon";
import { FormAlert } from "@/components/forms/form-alert";
import { FormField } from "@/components/forms/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SPORTS } from "@/config/sports";
import type { PublicUser, SportLevel, SportType } from "@/db/schema";
import { resizeImageToDataUrl } from "@/lib/image";
import { updateProfile } from "@/lib/profile/actions";
import { cn } from "@/lib/utils";
import { MAX_FAVORITE_SPORTS } from "@/lib/validations/profile";

type EditableUser = Pick<PublicUser, "fullName" | "bio" | "sportLevel" | "avatarUrl" | "favoriteSports">;

/** Formulaire d'édition du profil : photo, nom, niveau, sports favoris, bio. */
export function ProfileForm({ user }: { user: EditableUser }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fullName, setFullName] = useState(user.fullName);
  const [bio, setBio] = useState(user.bio ?? "");
  const [favorites, setFavorites] = useState<SportType[]>(user.favoriteSports);
  const [avatar, setAvatar] = useState<"keep" | "remove" | string>("keep");
  const [isResizing, setIsResizing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[] | undefined>>({});
  const [formError, setFormError] = useState<string>();
  const [isPending, startTransition] = useTransition();

  // Aperçu : nouvelle photo, photo actuelle ou initiales.
  const previewUrl = avatar === "remove" ? null : avatar === "keep" ? user.avatarUrl : avatar;

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Choisis une image (JPEG, PNG, WebP…).");
      return;
    }
    setIsResizing(true);
    try {
      setAvatar(await resizeImageToDataUrl(file));
      setErrors((previous) => ({ ...previous, avatar: undefined }));
    } catch {
      toast.error("Impossible de lire cette image, essaie avec une autre.");
    } finally {
      setIsResizing(false);
    }
  };

  const toggleFavorite = (sport: SportType) => {
    setFavorites((current) => {
      if (current.includes(sport)) return current.filter((item) => item !== sport);
      if (current.length >= MAX_FAVORITE_SPORTS) {
        toast.info(`${MAX_FAVORITE_SPORTS} sports favoris maximum.`);
        return current;
      }
      return [...current, sport];
    });
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const sportLevel = String(new FormData(event.currentTarget).get("sportLevel") ?? "") as SportLevel;
    startTransition(async () => {
      const result = await updateProfile({ fullName, bio, sportLevel, favoriteSports: favorites, avatar });
      if (result.ok) {
        toast.success("Profil mis à jour !");
        router.push("/profile");
      } else {
        setErrors(result.fieldErrors ?? {});
        setFormError(result.error ?? "Vérifie les champs en rouge.");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-8">
      <FormAlert message={formError} />

      {/* Photo */}
      <section className="flex flex-col items-center gap-4 rounded-card bg-card p-5 shadow-md sm:flex-row">
        <div className="relative">
          <UserAvatar user={{ fullName: fullName || user.fullName, avatarUrl: previewUrl }} className="size-24 text-2xl ring-4 ring-mint-100" />
          {isResizing && (
            <span className="absolute inset-0 flex items-center justify-center rounded-full bg-night-950/50">
              <Loader2 className="size-6 animate-spin text-white" aria-label="Traitement de la photo" />
            </span>
          )}
        </div>
        <div className="flex flex-1 flex-col items-center gap-2 sm:items-start">
          <p className="font-display font-bold text-ink">Photo de profil</p>
          <p className="text-center text-sm sm:text-left">
            Un visage souriant rassure tes futurs partenaires. Elle est recadrée automatiquement.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={isResizing}>
              <Camera aria-hidden />
              {previewUrl ? "Changer la photo" : "Ajouter une photo"}
            </Button>
            {previewUrl && (
              <Button type="button" variant="ghost" size="sm" onClick={() => setAvatar("remove")}>
                <Trash2 aria-hidden />
                Retirer
              </Button>
            )}
          </div>
          {errors.avatar && <p className="text-sm text-destructive">{errors.avatar[0]}</p>}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="sr-only"
            tabIndex={-1}
            aria-hidden
            onChange={(event) => {
              void handleFile(event.target.files?.[0]);
              event.target.value = "";
            }}
          />
        </div>
      </section>

      <section className="space-y-5 rounded-card bg-card p-5 shadow-md">
        <FormField id="fullName" label="Prénom et nom" errors={errors.fullName}>
          <Input
            id="fullName"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            autoComplete="name"
            aria-invalid={Boolean(errors.fullName)}
            aria-describedby="fullName-message"
            className="h-10"
          />
        </FormField>

        <fieldset className="space-y-2">
          <legend className="text-sm font-medium">Ton niveau sportif</legend>
          <SportLevelPicker name="sportLevel" defaultValue={user.sportLevel} invalid={Boolean(errors.sportLevel)} />
        </fieldset>

        <fieldset className="space-y-2">
          <legend className="text-sm font-medium">
            Tes sports favoris <span className="font-normal text-gray-400">({favorites.length}/{MAX_FAVORITE_SPORTS})</span>
          </legend>
          <div className="flex flex-wrap gap-2">
            {SPORTS.map((sport) => {
              const selected = favorites.includes(sport.value);
              return (
                <button
                  key={sport.value}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => toggleFavorite(sport.value)}
                  className={cn(
                    "flex h-10 items-center gap-1.5 rounded-full border px-3 text-sm transition-colors outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring",
                    selected && "border-mint-500 bg-mint-100 font-semibold text-mint-700 hover:bg-mint-100",
                  )}
                >
                  <SportIcon sport={sport.value} className="size-5" />
                  {sport.label}
                </button>
              );
            })}
          </div>
        </fieldset>

        <FormField id="bio" label="Bio" errors={errors.bio} hint={`${bio.length}/500 — ton style de jeu, tes disponibilités, ce que tu recherches…`}>
          <Textarea
            id="bio"
            value={bio}
            onChange={(event) => setBio(event.target.value)}
            maxLength={500}
            rows={4}
            placeholder="Ex. Joueuse de padel du dimanche, toujours partante pour un five en semaine après 19h !"
            aria-invalid={Boolean(errors.bio)}
            aria-describedby="bio-message"
          />
        </FormField>
      </section>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="ghost" onClick={() => router.push("/profile")} disabled={isPending}>
          Annuler
        </Button>
        <Button type="submit" disabled={isPending || isResizing}>
          {isPending && <Loader2 className="animate-spin" aria-hidden />}
          Enregistrer
        </Button>
      </div>
    </form>
  );
}
