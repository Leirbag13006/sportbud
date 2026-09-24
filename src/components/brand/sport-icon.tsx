import type { SVGProps } from "react";

import type { SportType } from "@/db/schema";

/**
 * Icônes de sport au style « line » du design system (trait 2 px, extrémités arrondies, grille 24 px).
 * Lucide n'ayant pas d'icône pour le foot, le basket ou les sports de raquette, elles sont dessinées ici
 * (d'après design-system/preview.html) ; les autres reprennent les tracés Lucide (licence ISC).
 *
 * Le contenu est une chaîne SVG statique : il sert aussi aux marqueurs Leaflet (HTML brut).
 */
export const SPORT_ICON_MARKUP: Record<SportType, string> = {
  football: '<circle cx="12" cy="12" r="9"/><path d="m12 7 4 3-1.5 4.5h-5L8 10z"/>',
  basketball:
    '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3v18M5.6 5.6c3 3 3 9.8 0 12.8M18.4 5.6c-3 3-3 9.8 0 12.8"/>',
  tennis: '<ellipse cx="10" cy="9" rx="6" ry="6"/><path d="M14.5 13.5 21 20"/><path d="M7 6.5l6 5M7.5 11.5l5-5"/>',
  padel:
    '<path d="M9.5 3.5a6 6 0 0 1 6 6c0 2.5-1.6 4.4-3.4 5.3L10.5 17h-2l-.9-.9 .1-1.9C5.8 13.1 3.5 11.2 3.5 9.5a6 6 0 0 1 6-6z"/><path d="m9 17-4.5 4.5"/><circle cx="9.5" cy="8" r=".6"/><circle cx="12" cy="10.5" r=".6"/><circle cx="7.5" cy="11" r=".6"/><circle cx="18.5" cy="18.5" r="2"/>',
  badminton:
    '<path d="M14 10 21 3"/><path d="M9.5 14.5 3 21"/><path d="m9.5 14.5 1-6 5 5z"/><path d="M10.5 8.5 14 4M12.5 10.5l4-3M15.5 13.5 20 10"/><circle cx="8" cy="16" r="1.8"/>',
  volleyball:
    '<path d="M11 7a16 16 20 0 1 10.98 4.362"/><path d="M12 12a13 13 0 0 1-8.66 5"/><path d="M16.83 13.634a16 16 0 0 1-9.267 7.328"/><path d="M20.66 17A13 13 0 0 0 12 12a13 13 0 0 1 0-10"/><path d="M8.17 15.366a16 16 0 0 1-1.713-11.69"/><circle cx="12" cy="12" r="10"/>',
  running: '<circle cx="14" cy="4" r="2"/><path d="m8 21 3-6 3 2v4M6 12l3-4 4 1 3 3 3 1M11 15l-2-3"/>',
  cycling:
    '<circle cx="18.5" cy="17.5" r="3.5"/><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="15" cy="5" r="1"/><path d="M12 17.5V14l-3-3 4-3 2 3h2"/>',
  swimming: '<path d="M2 12q2.5 2 5 0t5 0 5 0 5 0"/><path d="M2 19q2.5 2 5 0t5 0 5 0 5 0"/><path d="M2 5q2.5 2 5 0t5 0 5 0 5 0"/>',
  climbing: '<path d="m8 3 4 8 5-5 5 15H2L8 3z"/>',
  fitness: '<path d="M6 7v10M18 7v10M3 10v4M21 10v4M6 12h12"/>',
  other:
    '<path d="M11 12 5.12 2.2"/><path d="m13 12 5.88-9.8"/><path d="M8 7h8"/><circle cx="12" cy="17" r="5"/><path d="M12 18v-2h-.5"/>',
};

/** Attributs communs (sous forme de chaîne) pour les icônes injectées en HTML. */
export const SPORT_ICON_SVG_ATTRS =
  'viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"';

interface SportIconProps extends Omit<SVGProps<SVGSVGElement>, "children"> {
  sport: SportType;
}

/** Icône line d'un sport (décorative par défaut). */
export function SportIcon({ sport, className, ...props }: SportIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className ?? "size-5"}
      // Tracés statiques définis ci-dessus (aucune donnée utilisateur).
      dangerouslySetInnerHTML={{ __html: SPORT_ICON_MARKUP[sport] }}
      {...props}
    />
  );
}
