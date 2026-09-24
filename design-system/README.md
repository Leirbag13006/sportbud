# SportLink — Design system (kit Claude Code)

À déposer dans ton projet sous `design-system/` :

```
design-system/
├── CLAUDE.md          → instructions à copier dans le CLAUDE.md racine du projet
├── DESIGN.md          → guide complet de la DA (Claude Code le lit avant chaque UI)
├── tokens.css         → variables CSS + classes .sl-* (CSS vanilla)
├── tailwind.config.js → thème Tailwind v3
├── theme.css          → thème Tailwind v4 (@theme)
├── preview.html       → planche visuelle de contrôle
├── logo/              → logo sombre, clair, icône (SVG)
└── reference/prototype.jpg
```

Prompt de départ pour Claude Code :
> Lis design-system/DESIGN.md et design-system/CLAUDE.md, puis applique cette DA à tout le site (tokens, typos, composants, logo). Compare ton rendu à design-system/reference/prototype.jpg.
