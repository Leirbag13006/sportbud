"use client";

import { Loader2, MapPin, Minus, Plus } from "lucide-react";
import { useState, useTransition, type FormEvent } from "react";
import { toast } from "sonner";

import { SportIcon } from "@/components/brand/sport-icon";
import { FormAlert } from "@/components/forms/form-alert";
import { FormField } from "@/components/forms/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { SPORT_LEVELS } from "@/config/sport-levels";
import { SPORTS } from "@/config/sports";
import { AUDIENCE_OPTIONS, canJoinAudience } from "@/config/audience";
import type { Audience, Gender, SportType } from "@/db/schema";
import { createActivity, updateActivity } from "@/lib/activities/actions";
import type { ActivityWithCreator } from "@/lib/activities/types";
import { formatDuration } from "@/lib/format";
import { cn } from "@/lib/utils";
import { MAX_SPOTS } from "@/lib/validations/activity";

const DURATIONS = [30, 45, 60, 90, 120, 150, 180, 240];

const SPORT_ITEMS = Object.fromEntries(SPORTS.map((sport) => [sport.value, sport.label]));
const DURATION_ITEMS = Object.fromEntries(DURATIONS.map((minutes) => [String(minutes), formatDuration(minutes)]));
const LEVEL_OPTIONS = [{ value: "any", label: "Tous niveaux" }, ...SPORT_LEVELS];

/** Champ du formulaire → clé d'erreur renvoyée par la validation serveur. */
const FIELD_ERROR_KEYS: Record<keyof ActivityFormValues, string> = {
  sportType: "sportType",
  date: "startsAt",
  time: "startsAt",
  duration: "durationMinutes",
  spots: "spotsTotal",
  level: "requiredLevel",
  pricing: "price",
  price: "price",
  equipment: "equipmentRequired",
  equipmentNote: "equipmentNote",
  audience: "audience",
  address: "address",
  locationName: "locationName",
  description: "description",
};

/** Date locale au format des champs HTML : AAAA-MM-JJ. */
function toDateInputValue(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** Valeurs saisies dans le formulaire (conservées par le parent pendant le choix du lieu). */
export interface ActivityFormValues {
  sportType: SportType | null;
  date: string;
  time: string;
  duration: string;
  spots: number;
  level: string;
  /** Séance gratuite ou payante (prix par personne en euros, saisi librement). */
  pricing: "free" | "paid";
  price: string;
  /** Matériel fourni par l'organisateur (ou rien à apporter) / à apporter par chacun. */
  equipment: "provided" | "bring";
  equipmentNote: string;
  /** Public : tout le monde, entre femmes, entre hommes. */
  audience: Audience;
  /** Adresse exacte : remplie automatiquement quand l'épingle est placée, modifiable. */
  address: string;
  locationName: string;
  description: string;
}

/** Valeurs initiales : aujourd'hui (ou demain), dans environ 2 heures, à l'heure pleine. */
export function createDefaultFormValues(): ActivityFormValues {
  const start = new Date();
  start.setHours(start.getHours() + 2, 0, 0, 0);
  return {
    sportType: null,
    date: toDateInputValue(start),
    time: `${String(start.getHours()).padStart(2, "0")}:00`,
    duration: "60",
    spots: 1,
    level: "any",
    pricing: "free",
    price: "",
    equipment: "provided",
    equipmentNote: "",
    audience: "all",
    address: "",
    locationName: "",
    description: "",
  };
}

/** Valeurs du formulaire pré-remplies depuis une activité existante (modification). */
export function formValuesFromActivity(activity: ActivityWithCreator): ActivityFormValues {
  const start = activity.startsAt;
  return {
    sportType: activity.sportType,
    date: toDateInputValue(start),
    time: `${String(start.getHours()).padStart(2, "0")}:${String(start.getMinutes()).padStart(2, "0")}`,
    duration: String(activity.durationMinutes),
    spots: activity.spotsTotal,
    level: activity.requiredLevel ?? "any",
    pricing: activity.priceCents > 0 ? "paid" : "free",
    price: activity.priceCents > 0 ? String(activity.priceCents / 100).replace(".", ",") : "",
    equipment: activity.equipmentRequired ? "bring" : "provided",
    equipmentNote: activity.equipmentNote ?? "",
    audience: activity.audience,
    address: activity.address ?? "",
    locationName: activity.locationName ?? "",
    description: activity.description ?? "",
  };
}

interface CreateActivityFormProps {
  location: [number, number];
  values: ActivityFormValues;
  onValuesChange: (values: ActivityFormValues) => void;
  onEditLocation: () => void;
  /** Appelé après publication (création) ou enregistrement (modification). */
  onCreated: (activityId: string) => void;
  /** Genre de l'organisateur : conditionne les séances entre femmes / entre hommes. */
  creatorGender: Gender | null;
  /** Activité modifiée ; absent = création. */
  editingActivityId?: string | null;
}

/** Formulaire de création (ou de modification) d'activité. Le lieu est choisi sur la carte. */
export function CreateActivityForm({
  location,
  values,
  onValuesChange,
  onEditLocation,
  onCreated,
  creatorGender,
  editingActivityId = null,
}: CreateActivityFormProps) {
  const {
    sportType,
    date,
    time,
    duration,
    spots,
    level,
    pricing,
    price,
    equipment,
    equipmentNote,
    audience,
    address,
    locationName,
    description,
  } = values;
  const isEditing = editingActivityId !== null;
  const [errors, setErrors] = useState<Record<string, string[] | undefined>>({});
  const [formError, setFormError] = useState<string>();
  const [pending, startTransition] = useTransition();

  /** Met à jour un champ et efface l'erreur qui lui correspond côté serveur. */
  const update = <K extends keyof ActivityFormValues>(key: K, value: ActivityFormValues[K]) => {
    onValuesChange({ ...values, [key]: value });
    const errorKey = FIELD_ERROR_KEYS[key];
    if (errors[errorKey]) setErrors((previous) => ({ ...previous, [errorKey]: undefined }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Date et heure saisies en heure locale → instant absolu (ISO, UTC) envoyé au serveur.
    const startsAt = date && time ? new Date(`${date}T${time}`).toISOString() : "";
    const formData = new FormData();
    formData.set("sportType", sportType ?? "");
    formData.set("startsAt", startsAt);
    formData.set("durationMinutes", duration);
    formData.set("spotsTotal", String(spots));
    formData.set("requiredLevel", level);
    formData.set("price", pricing === "paid" ? price : "0");
    formData.set("equipmentRequired", equipment === "bring" ? "yes" : "no");
    formData.set("equipmentNote", equipment === "bring" ? equipmentNote : "");
    formData.set("audience", audience);
    formData.set("address", address);
    formData.set("locationName", locationName);
    formData.set("description", description);
    formData.set("lat", String(location[0]));
    formData.set("lng", String(location[1]));

    startTransition(async () => {
      const result = editingActivityId
        ? await updateActivity(editingActivityId, formData).then((r) => (r.ok ? { ...r, activityId: editingActivityId } : r))
        : await createActivity(formData);
      if (result.ok) {
        if (isEditing) {
          toast.success("Modifications enregistrées !", { description: "Les participants sont prévenus des changements." });
        } else {
          toast.success("Activité publiée !", { description: "Elle est maintenant visible sur la carte." });
        }
        onCreated(result.activityId);
      } else {
        setErrors(result.fieldErrors ?? {});
        setFormError(result.error ?? (result.fieldErrors ? "Vérifie les champs en rouge." : undefined));
      }
    });
  };

  const today = toDateInputValue(new Date());

  return (
    <form onSubmit={handleSubmit} noValidate className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-4 pt-2 pb-4">
        <FormAlert message={formError} />

        {/* Lieu : épingle posée sur la carte + adresse exacte (pré-remplie, modifiable) */}
        <FormField
          id="address"
          label="Adresse exacte"
          errors={errors.address ?? errors.lat}
          hint="Remplie automatiquement depuis l'épingle. Tu peux la préciser."
          labelAction={
            <Button type="button" variant="link" size="sm" className="h-auto p-0" onClick={onEditLocation}>
              <MapPin aria-hidden />
              Modifier sur la carte
            </Button>
          }
        >
          <Input
            id="address"
            value={address}
            onChange={(event) => update("address", event.target.value)}
            maxLength={200}
            autoComplete="off"
            placeholder="Ex. 10 Rue Paradis, 13001 Marseille"
            aria-describedby="address-message"
            className="h-10"
          />
        </FormField>

        <FormField id="sportType" label="Sport" errors={errors.sportType}>
          <Select
            items={SPORT_ITEMS}
            value={sportType}
            onValueChange={(value) => update("sportType", value as SportType | null)}
          >
            <SelectTrigger
              id="sportType"
              aria-invalid={Boolean(errors.sportType)}
              aria-describedby="sportType-message"
              className="h-10 w-full"
            >
              <SelectValue placeholder="Choisis un sport" />
            </SelectTrigger>
            <SelectContent>
              {SPORTS.map((sport) => (
                <SelectItem key={sport.value} value={sport.value}>
                  <SportIcon sport={sport.value} className="size-5" />
                  {sport.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>

        <div className="grid grid-cols-2 gap-3">
          <FormField id="date" label="Date" errors={errors.startsAt}>
            <Input
              id="date"
              type="date"
              min={today}
              value={date}
              onChange={(event) => update("date", event.target.value)}
              aria-invalid={Boolean(errors.startsAt)}
              aria-describedby="date-message"
              className="h-10"
              required
            />
          </FormField>
          <FormField id="time" label="Heure">
            <Input
              id="time"
              type="time"
              step={300}
              value={time}
              onChange={(event) => update("time", event.target.value)}
              aria-invalid={Boolean(errors.startsAt)}
              className="h-10"
              required
            />
          </FormField>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <FormField id="duration" label="Durée" errors={errors.durationMinutes}>
            <Select items={DURATION_ITEMS} value={duration} onValueChange={(value) => value && update("duration", value)}>
              <SelectTrigger id="duration" className="h-10 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DURATIONS.map((minutes) => (
                  <SelectItem key={minutes} value={String(minutes)}>
                    {formatDuration(minutes)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <FormField id="spots" label="Personnes recherchées" errors={errors.spotsTotal}>
            <SpotsStepper value={spots} onChange={(value) => update("spots", value)} />
          </FormField>
        </div>

        <fieldset className="space-y-2">
          <legend className="text-sm font-medium">Niveau requis</legend>
          <div className="flex flex-wrap gap-2">
            {LEVEL_OPTIONS.map((option) => (
              <label
                key={option.value}
                className="cursor-pointer rounded-full border px-3 py-1.5 text-sm transition-colors hover:bg-muted has-checked:border-primary has-checked:bg-brand-soft has-checked:font-medium has-checked:text-brand-text has-focus-visible:ring-3 has-focus-visible:ring-ring/50"
              >
                <input
                  type="radio"
                  name="requiredLevel"
                  value={option.value}
                  checked={level === option.value}
                  onChange={() => update("level", option.value)}
                  className="sr-only"
                />
                {option.label}
              </label>
            ))}
          </div>
        </fieldset>

        {/* Prix par personne : gratuit, ou montant réglé directement à l'organisateur */}
        <fieldset className="space-y-2">
          <legend className="text-sm font-medium">Prix par personne</legend>
          <div className="grid grid-cols-2 gap-2">
            {(
              [
                ["free", "Gratuit"],
                ["paid", "Payant"],
              ] as const
            ).map(([value, label]) => (
              <ChoiceCard key={value} name="pricing" checked={pricing === value} onChange={() => update("pricing", value)}>
                {label}
              </ChoiceCard>
            ))}
          </div>
          {pricing === "paid" && (
            <FormField id="price" label="Montant par personne" errors={errors.price} hint="Terrain, location de court… à régler sur place.">
              <div className="relative">
                <Input
                  id="price"
                  inputMode="decimal"
                  placeholder="8"
                  value={price}
                  onChange={(event) => update("price", event.target.value.replace(/[^\d.,]/g, ""))}
                  aria-invalid={Boolean(errors.price)}
                  aria-describedby="price-message"
                  className="h-10 pr-10"
                />
                <span aria-hidden className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-sm text-gray-400">
                  €
                </span>
              </div>
            </FormField>
          )}
        </fieldset>

        {/* Matériel */}
        <fieldset className="space-y-2">
          <legend className="text-sm font-medium">Matériel</legend>
          <div className="grid grid-cols-2 gap-2">
            {(
              [
                ["provided", "Fourni / rien à apporter"],
                ["bring", "À apporter"],
              ] as const
            ).map(([value, label]) => (
              <ChoiceCard key={value} name="equipment" checked={equipment === value} onChange={() => update("equipment", value)}>
                {label}
              </ChoiceCard>
            ))}
          </div>
          {equipment === "bring" && (
            <FormField id="equipmentNote" label="Quoi apporter ? (facultatif)" errors={errors.equipmentNote}>
              <Input
                id="equipmentNote"
                value={equipmentNote}
                onChange={(event) => update("equipmentNote", event.target.value)}
                maxLength={120}
                placeholder="Ex. raquette et chaussures de salle"
                aria-describedby="equipmentNote-message"
                className="h-10"
              />
            </FormField>
          )}
        </fieldset>

        {/* Public : séances entre femmes / entre hommes, réservées au genre correspondant */}
        <fieldset className="space-y-2">
          <legend className="text-sm font-medium">Ouvert à</legend>
          <div className="grid grid-cols-3 gap-2">
            {AUDIENCE_OPTIONS.map((option) => (
              <ChoiceCard
                key={option.value}
                name="audience"
                checked={audience === option.value}
                disabled={!canJoinAudience(option.value, creatorGender)}
                onChange={() => update("audience", option.value)}
              >
                {option.label}
              </ChoiceCard>
            ))}
          </div>
          {errors.audience ? (
            <p className="text-sm text-destructive" role="alert">
              {errors.audience[0]}
            </p>
          ) : (
            creatorGender !== "female" &&
            creatorGender !== "male" && (
              <p className="text-sm text-muted-foreground">
                Pour une séance entre femmes ou entre hommes, indique ton genre dans ton profil (jamais affiché).
              </p>
            )
          )}
        </fieldset>

        <FormField
          id="locationName"
          label="Nom du lieu (facultatif)"
          errors={errors.locationName}
          hint="Ex. « City stade du parc Borély, terrain 2 »"
        >
          <Input
            id="locationName"
            value={locationName}
            onChange={(event) => update("locationName", event.target.value)}
            maxLength={120}
            aria-describedby="locationName-message"
            className="h-10"
          />
        </FormField>

        <FormField id="description" label="Message aux participants (facultatif)" errors={errors.description}>
          <Textarea
            id="description"
            value={description}
            onChange={(event) => update("description", event.target.value)}
            maxLength={500}
            rows={3}
            placeholder="Niveau de jeu, matériel à apporter, point de rendez-vous…"
            aria-describedby="description-message"
          />
        </FormField>
      </div>

      <div className="border-t p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <Button type="submit" disabled={pending} className="h-11 w-full text-base">
          {pending ? (
            <>
              <Loader2 className="animate-spin" aria-hidden />
              {isEditing ? "Enregistrement…" : "Publication…"}
            </>
          ) : isEditing ? (
            "Enregistrer les modifications"
          ) : (
            "Publier l'activité"
          )}
        </Button>
      </div>
    </form>
  );
}

interface SpotsStepperProps {
  value: number;
  onChange: (value: number) => void;
}

/** Compteur – / + pour le nombre de personnes recherchées. */
function SpotsStepper({ value, onChange }: SpotsStepperProps) {
  const buttonClass = "size-10 shrink-0 rounded-lg";

  return (
    <div className="flex h-10 items-center gap-1">
      <Button
        type="button"
        variant="outline"
        className={buttonClass}
        onClick={() => onChange(Math.max(1, value - 1))}
        disabled={value <= 1}
        aria-label="Une personne de moins"
      >
        <Minus />
      </Button>
      <output
        id="spots"
        aria-live="polite"
        className={cn("flex-1 text-center text-base font-semibold tabular-nums")}
      >
        {value}
      </output>
      <Button
        type="button"
        variant="outline"
        className={buttonClass}
        onClick={() => onChange(Math.min(MAX_SPOTS, value + 1))}
        disabled={value >= MAX_SPOTS}
        aria-label="Une personne de plus"
      >
        <Plus />
      </Button>
    </div>
  );
}

interface ChoiceCardProps {
  name: string;
  checked: boolean;
  disabled?: boolean;
  onChange: () => void;
  children: React.ReactNode;
}

/** Choix exclusif en carte (bouton radio natif stylé, accessible au clavier). */
function ChoiceCard({ name, checked, disabled, onChange, children }: ChoiceCardProps) {
  return (
    <label
      className={cn(
        "flex min-h-11 cursor-pointer items-center justify-center rounded-lg border px-3 py-2 text-center text-sm transition-colors hover:bg-muted has-focus-visible:ring-3 has-focus-visible:ring-ring",
        checked && "border-mint-500 bg-mint-100 font-semibold text-mint-700 hover:bg-mint-100",
        disabled && "cursor-not-allowed opacity-45 hover:bg-transparent",
      )}
    >
      <input type="radio" name={name} checked={checked} disabled={disabled} onChange={onChange} className="sr-only" />
      {children}
    </label>
  );
}
