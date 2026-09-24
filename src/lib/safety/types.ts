import type { PublicUser, ReportReason } from "@/db/schema";

/** Blocage entre l'utilisateur et un autre membre : par moi, par lui, ou aucun. */
export type BlockStatus = "by-me" | "by-them" | null;

/** Membre bloqué, affiché dans les réglages du profil. */
export type BlockedUser = Pick<PublicUser, "id" | "fullName" | "avatarUrl"> & { blockedAt: Date };

/** Motifs de signalement, dans l'ordre d'affichage. */
export const REPORT_REASONS: { value: ReportReason; label: string; description: string }[] = [
  { value: "no_show", label: "Absences répétées", description: "Ne vient pas aux séances sans prévenir." },
  { value: "inappropriate", label: "Comportement déplacé", description: "Propos ou attitude irrespectueux." },
  { value: "harassment", label: "Harcèlement ou menaces", description: "Messages insistants, intimidation." },
  { value: "fake_profile", label: "Faux profil ou arnaque", description: "Identité douteuse, demande d'argent." },
  { value: "unsafe", label: "Mise en danger", description: "Comportement risqué pendant une séance." },
  { value: "other", label: "Autre", description: "Précise la situation ci-dessous." },
];
