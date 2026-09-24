@AGENTS.md

# Direction artistique — SportMates

- La marque s'appelle **SportMates** (logo « Sport**Mates** », signature « Bouge. Rencontre. Partage. »). Le kit `design-system/` a été livré sous le nom provisoire « SportLink » : n'utiliser ce nom nulle part dans l'interface.

- La DA est définie dans `design-system/DESIGN.md` : **le lire avant toute création ou modification d'UI** et le respecter strictement. Référence visuelle : `design-system/reference/prototype.jpg`.
- Les valeurs (couleurs, typos, rayons, ombres) viennent uniquement des tokens, déclarés dans `src/app/globals.css` (`@theme`, repris de `design-system/theme.css`) : classes `night-*`, `mint-*`, `sand-*`, `ink`, `gray-400/600`, `sunset-*`, `rounded-card`, `shadow-md/lg/glow`, `bg-hero`… **Aucune couleur hexadécimale en dur dans les composants.**
- Menthe `mint-500` = accent (CTA, dernier mot des titres, icônes) ; jamais en grand aplat ni en texte sur fond clair → utiliser `text-brand-text` (mint-700). Texte sur bouton menthe : nuit.
- Titres Montserrat (`font-display`, 800–900), texte Inter, accroche Caveat (`font-script`, 1× par page max). Barre menthe sous les titres de section : classe `sl-bar`. Fonds sombres signature : classe `sl-dark`.
- Photos : toujours en noir et blanc (classe `sl-photo`) ; fonds photo via `src/components/brand/photo-backdrop.tsx` (flou, voile nuit, halo menthe, grain `sl-grain`). La couleur vient uniquement de l'interface (menthe, rose « entre femmes », bleu « entre hommes »).
- Touche « faite main » (avec parcimonie, 1 à 2 par écran) : traits menthe dessinés (`Scribble`, `Marked` pour souligner / entourer un mot d'accent), annotation manuscrite Caveat avec flèche (`Annotation`), bandeau défilant `Marquee`, tampon rond `Stamp`. Tous décoratifs (aria-hidden) et figés si `prefers-reduced-motion`.
- Icônes : Lucide (line) ; icônes de sport : `src/components/brand/sport-icon.tsx`. Logo : `src/components/layout/logo.tsx` (`variant="dark"` sur fond sombre, `"light"` sur fond clair).
- Mobile-first, accessible (contraste AA, focus visible, cibles ≥ 44 px, `prefers-reduced-motion`), microcopy en français avec tutoiement.
