import type { Audience, Gender } from "@/db/schema";

/** Genres proposés (facultatif, jamais affiché aux autres membres). */
export const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: "female", label: "Femme" },
  { value: "male", label: "Homme" },
  { value: "other", label: "Autre / je préfère ne pas dire" },
];

/** Publics d'une activité. */
export const AUDIENCE_OPTIONS: { value: Audience; label: string; short: string }[] = [
  { value: "all", label: "Tout le monde", short: "Mixte" },
  { value: "women", label: "Entre femmes", short: "Entre femmes" },
  { value: "men", label: "Entre hommes", short: "Entre hommes" },
];

/** Genre requis pour un public restreint. */
const REQUIRED_GENDER: Record<Exclude<Audience, "all">, Gender> = { women: "female", men: "male" };

/** Vrai si un membre de ce genre peut rejoindre (ou organiser) une activité de ce public. */
export function canJoinAudience(audience: Audience, gender: Gender | null) {
  return audience === "all" || REQUIRED_GENDER[audience] === gender;
}

/**
 * Vrai si l'activité doit apparaître dans l'exploration du membre : les séances restreintes
 * à l'autre genre sont masquées ; sans genre renseigné, elles restent visibles (non rejoignables).
 */
export function isAudienceVisible(audience: Audience, gender: Gender | null) {
  if (audience === "all" || gender === null || gender === "other") return true;
  return canJoinAudience(audience, gender);
}

export function getAudienceLabel(audience: Audience) {
  return AUDIENCE_OPTIONS.find((option) => option.value === audience)?.label ?? audience;
}
