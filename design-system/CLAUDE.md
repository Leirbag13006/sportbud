# Instructions pour Claude Code — DA SportLink

Copie ce bloc dans le `CLAUDE.md` à la racine de ton projet (ou garde ce fichier et le dossier `design-system/` tel quel).

## Direction artistique
- La DA du site est définie dans `design-system/DESIGN.md`. **Lis-le avant toute création ou modification d'UI** et respecte-le strictement.
- Les valeurs (couleurs, typos, rayons, ombres, espacements) viennent **uniquement** des tokens :
  - CSS vanilla : `design-system/tokens.css` (variables `--sl-*` / `--color-*` + classes `.sl-*`)
  - Tailwind v3 : `design-system/tailwind.config.js` · Tailwind v4 : `design-system/theme.css`
- **Aucune couleur hexadécimale en dur** dans les composants : utilise les tokens.
- Logos : `design-system/logo/` (version `-dark` sur fond sombre, `-light` sur fond clair, `icon` pour favicon).
- Référence visuelle : `design-system/reference/prototype.jpg` — en cas de doute, reproduis ce rendu.

## Rappels clés
- Alternance de sections sombre (nuit + halo menthe) / clair (sable).
- Menthe `#2FE0A0` = accent (CTA, dernier mot des titres, icônes), jamais en grand aplat ni en texte sur fond clair (utiliser `mint-700`).
- Titres Montserrat 800–900, texte Inter, accroche manuscrite Caveat (1× par page max).
- Barre menthe 40×4 px sous chaque titre de section (`.sl-bar`).
- Icônes Lucide en style line ; chips de sport = cercles à contour menthe.
- Boutons primaires : fond menthe, texte nuit, radius 10 px, ≥ 44 px de haut.
- Mobile-first, accessible (contraste AA, focus visible, `prefers-reduced-motion`).
- Microcopy en français, tutoiement dans l'app, ton chaleureux et inclusif.

## Vérification
Avant de terminer une tâche UI, compare le rendu à `reference/prototype.jpg` et à `design-system/preview.html`.
