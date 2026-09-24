import { CalendarCheck, House, MessageCircle, User, type LucideIcon } from "lucide-react";

/** Clés des onglets pouvant afficher un badge de notification. */
export type NavBadgeKey = "messages" | "activities";

/** Compteurs de notifications par onglet (rafraîchis en continu, cf. AppNavigation). */
export type NavBadges = Partial<Record<NavBadgeKey, number>>;

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Si défini, l'onglet affiche le compteur correspondant. */
  badgeKey?: NavBadgeKey;
}

/**
 * Onglets de navigation, dans l'ordre d'affichage. Sur mobile, le bouton « + » (création)
 * s'intercale au centre, entre les deux premiers et les deux derniers.
 */
export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Explorer", icon: House },
  { href: "/messages", label: "Messages", icon: MessageCircle, badgeKey: "messages" },
  { href: "/activities", label: "Activités", icon: CalendarCheck, badgeKey: "activities" },
  { href: "/profile", label: "Profil", icon: User },
];

/** Lien de création d'activité : ouvre l'Explorer en mode « choix du lieu ». */
export function getCreateActivityHref() {
  // Valeur unique à chaque clic : relance la création même si l'Explorer est déjà affiché.
  return `/?create=${Date.now()}`;
}

/** Une entrée est active sur sa route exacte ou sur l'une de ses sous-routes. */
export function isNavItemActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}
