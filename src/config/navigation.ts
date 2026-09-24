import { MapPin, MessageCircle, User, type LucideIcon } from "lucide-react";

/** Clés des onglets pouvant afficher un badge de notification. */
export type NavBadgeKey = "messages";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Si défini, l'onglet affiche le compteur correspondant. */
  badgeKey?: NavBadgeKey;
}

/** Onglets de la Bottom Navigation Bar, dans l'ordre d'affichage. */
export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Carte", icon: MapPin },
  { href: "/messages", label: "Messages", icon: MessageCircle, badgeKey: "messages" },
  { href: "/profile", label: "Profil", icon: User },
];
