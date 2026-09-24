@AGENTS.md

# Direction artistique — SportLink

- La DA est définie dans `design-system/DESIGN.md` : **le lire avant toute création ou modification d'UI** et le respecter strictement. Référence visuelle : `design-system/reference/prototype.jpg`.
- Les valeurs (couleurs, typos, rayons, ombres) viennent uniquement des tokens, déclarés dans `src/app/globals.css` (`@theme`, repris de `design-system/theme.css`) : classes `night-*`, `mint-*`, `sand-*`, `ink`, `gray-400/600`, `sunset-*`, `rounded-card`, `shadow-md/lg/glow`, `bg-hero`… **Aucune couleur hexadécimale en dur dans les composants.**
- Menthe `mint-500` = accent (CTA, dernier mot des titres, icônes) ; jamais en grand aplat ni en texte sur fond clair → utiliser `text-brand-text` (mint-700). Texte sur bouton menthe : nuit.
- Titres Montserrat (`font-display`, 800–900), texte Inter, accroche Caveat (`font-script`, 1× par page max). Barre menthe sous les titres de section : classe `sl-bar`. Fonds sombres signature : classe `sl-dark`.
- Icônes : Lucide (line) ; icônes de sport : `src/components/brand/sport-icon.tsx`. Logo : `src/components/layout/logo.tsx` (`variant="dark"` sur fond sombre, `"light"` sur fond clair).
- Mobile-first, accessible (contraste AA, focus visible, cibles ≥ 44 px, `prefers-reduced-motion`), microcopy en français avec tutoiement.
