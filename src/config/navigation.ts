import { MapPin, MessageCircle, User, type LucideIcon } from "lucide-react";

/** Clés des onglets pouvant afficher un badge de notification. */
export type NavBadgeKey = "messages";

/** Compteurs de notifications par onglet (branchés sur Supabase Realtime à l'étape 6). */
export type NavBadges = Partial<Record<NavBadgeKey, number>>;

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Si défini, l'onglet affiche le compteur correspondant. */
  badgeKey?: NavBadgeKey;
}

/** Entrées de navigation (header desktop et Bottom Bar mobile), dans l'ordre d'affichage. */
export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Carte", icon: MapPin },
  { href: "/messages", label: "Messages", icon: MessageCircle, badgeKey: "messages" },
  { href: "/profile", label: "Profil", icon: User },
];

/** Une entrée est active sur sa route exacte ou sur l'une de ses sous-routes. */
export function isNavItemActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}
