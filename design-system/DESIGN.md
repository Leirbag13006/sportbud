# SportLink — Design System

> Source : prototype visuel `reference/prototype.jpg`. Ce fichier est la référence de la direction artistique (DA) du site. **Toute UI générée doit respecter ces règles.** Les valeurs exactes sont dans `tokens.css` (CSS vanilla), `tailwind.config.js` (Tailwind v3) ou `theme.css` (Tailwind v4).

---

## 1. Essence de la marque

- **Nom** : SportLink — **Signature** : *Bouge. Rencontre. Partage.*
- **Promesse** : « Le sport nous rapproche, partout. » / « Plus que du sport, une communauté. »
- **Personnalité** : chaleureuse, dynamique, inclusive, locale, rassurante.
- **Valeurs** : Partage · Inclusion · Passion · Confiance.
- **Ambiance** : soirée sportive en ville au coucher du soleil (Aix-en-Provence), amis qui rient, énergie positive. Contraste nuit vert-noir + éclats menthe + lumière dorée des photos.

## 2. Logo

| Fichier | Usage |
|---|---|
| `logo/sportlink-logo-dark.svg` | Fond sombre (hero, header sombre, footer) — version principale |
| `logo/sportlink-logo-light.svg` | Fond clair (sections sable/blanc) |
| `logo/sportlink-icon.svg` | Favicon, avatar, icône d'app, filigrane |

- Construction : 2 silhouettes (une blanche, une menthe) qui se rejoignent autour d'un **pin de localisation**, posées sur un **anneau** (terrain), rayons d'énergie au-dessus.
- Wordmark : **Montserrat Black Italic (900)**, « Sport » blanc + « Link » menthe. Tagline en Inter italique, capitales espacées (tracking .32em).
- Zone de protection : hauteur du « S » tout autour. Taille mini : 24 px (icône), 120 px de large (logo complet).
- ❌ Ne pas déformer, recolorer hors palette, ajouter d'ombre, ni poser sur une photo chargée sans voile sombre.
- ⚠️ Les SVG sont une reconstruction vectorielle du prototype : remplacer par le fichier source officiel s'il existe, et vectoriser le texte avant mise en prod.

## 3. Couleurs

### Palette
| Token | Hex | Rôle |
|---|---|---|
| `night-950` | `#050F0D` | Fond le plus profond (hero, bas de page) |
| `night-900` | `#0A1A17` | Fond sombre par défaut |
| `night-800` | `#10271F` | Cartes / blocs sur fond sombre (ex. encart « Plus qu'une application ») |
| `night-700` | `#173A31` | Bordures sur sombre |
| `teal-600` | `#0E5A4C` | Halo, dégradés |
| **`mint-500`** | **`#2FE0A0`** | **Primaire** : CTA, mot accentué des titres, icônes, barres de titre |
| `mint-600` | `#1FB982` | Hover CTA, logo sur clair |
| `mint-700` | `#087A55` | Texte/lien menthe **sur fond clair** (contraste AA) |
| `mint-100` | `#DDFBEF` | Fond des pastilles d'icônes sur clair |
| `sand-50` | `#F6F7F5` | Fond des sections claires |
| `ink` | `#0E1A18` | Titres sur clair |
| `gray-600` | `#4A5754` | Texte courant sur clair |
| `gray-400` | `#6B7975` | Méta (distance, horaire) |
| `sunset-500` | `#F29A3E` | Accent chaud **ponctuel** (badge « nouveau », alerte douce) |

### Règles
- **Proportions** : ~60 % nuit (sombre) / ~30 % clair (sable/blanc) / ~10 % menthe. Le menthe est un **éclat**, jamais un aplat de grande surface.
- Alterner les sections **sombre → clair → sombre** comme le prototype (hero sombre, bloc « raison d'être / mission / valeurs » clair, « Comment ça marche ? » sombre).
- Sur bouton menthe : texte **`night-950`** (pas blanc — contraste insuffisant).
- Sur fond clair, ne jamais écrire en `mint-500` : utiliser `mint-700`.
- Sunset uniquement pour de petits accents ; il vient surtout des photos.

### Dégradés & effets
- **Hero** : halo radial menthe/teal en haut à gauche sur dégradé nuit (`--sl-gradient-hero` / `bg-hero`).
- **Swoosh** : trait lumineux menthe en diagonale derrière les titres ou sous le script (`--sl-gradient-swoosh`).
- **Photo** : toujours un voile `photo-fade` (nuit → transparent) côté texte pour garantir la lisibilité.
- **Glow** : `shadow-glow` pour les éléments actifs sur fond sombre (chip sélectionné, focus).

## 4. Typographie

| Rôle | Police | Graisse | Exemple prototype |
|---|---|---|---|
| Display / titres | **Montserrat** | 800–900 | « Le sport nous rapproche, partout. » |
| Logo | Montserrat Italic | 900 | « SportLink » |
| Texte courant | **Inter** | 400 (500–600 pour emphase) | paragraphes, cartes |
| Tagline / eyebrow | Inter italique ou Montserrat 700, CAPITALES espacées | 400/700 | « BOUGE. RENCONTRE. PARTAGE. », « PLUS QUE DU SPORT… » |
| Script (accroche) | **Caveat** | 700, rotation −8° | « Mêmes passions. Nouvelles rencontres. » |

Échelle : hero `clamp(2.5rem→4.5rem)` · h1 `3rem` · h2 `2rem` · h3 `1.25rem` · h4 `1.0625rem` · body `1rem` · small `.875rem` · xs `.75rem`. Interlignage titres 1.05–1.25, texte 1.55.

**Règles**
- Titre hero sur 2–3 lignes, **dernier mot en menthe** avec point final (« partout. »).
- Chaque titre de section est suivi d'une **petite barre menthe** (40×4 px, arrondie) → classe `.sl-bar`.
- Le script Caveat : **une seule fois par page maximum**, sur photo/fond sombre, en blanc, accompagné d'un swoosh menthe.
- Tutoiement dans l'UI produit (« Choisis ta ville », « Filtre selon tes envies »), vouvoiement possible dans le discours de marque (« Trouvez des partenaires… »). Rester cohérent au sein d'une même page.

## 5. Iconographie

- Style **line** (trait 1.75–2 px, extrémités arrondies) — recommandé : **Lucide** (`lucide-react` / `lucide`).
- Icônes de sport dans des **cercles à contour menthe** sur fond sombre translucide (`.sl-sport-chip`) : basket, running, foot, tennis/padel, muscu, « … ».
- Icônes de valeurs dans des **pastilles pleines `mint-100`** avec icône `mint-700` (`.sl-icon-badge`) : users (Partage), handshake (Inclusion), person-running (Passion), shield-check (Confiance).
- Étapes « Comment ça marche » : **cercle menthe numéroté** + ligne verticale menthe qui relie les étapes + icône line blanche.

## 6. Photographie

- Personnes réelles, 20–35 ans, **groupes mixtes et divers**, sourires, complicité, tenue de sport.
- **Golden hour / coucher de soleil**, tons chauds orangés, ville en arrière-plan (Aix, Sainte-Victoire).
- Cadrage serré sur les visages pour l'émotion, ou silhouette de dos face au paysage pour l'aspiration.
- Toujours fondre la photo dans le fond nuit (dégradé latéral) — jamais de photo « en boîte » avec bord dur dans le hero.

## 7. Composants

### Boutons
- **Primaire** : fond menthe, texte nuit, Montserrat 700, radius 10 px, hauteur ≥ 44 px. Hover `mint-600`. (« Rejoindre »)
- **Secondaire / outline** : bordure menthe 2 px, texte `mint-700` sur clair ou menthe sur sombre. (« Contacter »)
- **Petit** (dans les cartes) : hauteur 32 px, texte xs.
- Focus visible : outline `mint-300` 3 px.

### Carte d'activité (liste app)
- Fond blanc, radius 16 px, ombre `md`, padding 12–16 px.
- Vignette photo à gauche (radius 10 px) · titre Montserrat 700 (« Recherche 2 joueurs ») · méta Inter xs gris (sport • niveau, date • heure) · distance avec pin · avatars empilés · CTA petit à droite en bas.

### Chips / filtres de sport
- Rangée horizontale scrollable, cercles 48 px, contour menthe ; l'actif est plein menthe + label menthe en dessous.

### Bloc éditorial sombre (« Plus qu'une application, un état d'esprit. »)
- Fond `night-800`, radius 16–24 px, illustration line menthe (montagnes) en haut, titre blanc + fin en menthe, petite barre menthe, texte on-dark.

### Barre de localisation
- Pin + nom de ville en Montserrat 700 blanc, souvent au-dessus d'une rangée de chips de sport.

### Navigation app (bottom bar)
- Fond nuit, 5 items (Explorer, Messages, **+** central en cercle menthe plein, Créer, Profil), item actif en menthe.

### Bandeau bénéfices
- 3 colonnes icône line blanche + label court centré (« Des villes plus actives », « Des gens plus connectés », « Une vie plus riche »).

## 8. Mise en page

- Conteneur max 1200 px, gouttières `clamp(16px, 4vw, 40px)`.
- Espacement base 4 : 4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96. Sections : 64–96 px de padding vertical.
- Grilles : section clair en 3–4 colonnes (raison d'être / mission+vision / valeurs / encart sombre) → 1 colonne en mobile.
- Mockup téléphone qui **chevauche** deux sections (effet de profondeur), comme sur le prototype.
- Mobile-first, pas de scroll horizontal hors rangées de chips.

## 9. Mouvement

- Transitions 150–250 ms, easing `cubic-bezier(.2,.8,.2,1)`.
- Apparition au scroll : fade + translateY(16px), léger décalage entre éléments.
- Hover cartes : élévation `shadow-lg` + translateY(−2px).
- Respecter `prefers-reduced-motion`.

## 10. Accessibilité

- Texte sur sombre : blanc ≥ 82 % d'opacité. Menthe `#2FE0A0` sur `night-900` : contraste ≈ 10,5:1 ✅. Nuit sur menthe ≈ 11:1 ✅. `mint-700` sur blanc ≈ 5,3:1 ✅. `gray-400` sur blanc ≈ 4,7:1 ✅. **`mint-500` sur blanc ≈ 1.7:1 ❌ → interdit pour du texte.**
- Cibles tactiles ≥ 44 px, focus toujours visible, `alt` descriptif sur les photos, icônes décoratives `aria-hidden`.

## 11. Ton de voix (microcopy)

- Court, énergique, inclusif, positif. Verbes d'action : *Rejoindre, Contacter, Créer, Trouver, Bouger.*
- Exemples : « Tous niveaux bienvenus ! », « Discute, fixe un lieu, un horaire et c'est parti ! »
- Éviter le jargon compétitif ; l'accent est mis sur la rencontre, pas la performance.

## 12. Do / Don't

✅ Fond nuit + éclats menthe · dernier mot du titre en menthe · barre menthe sous les titres · photos golden hour fondues · icônes line · cartes blanches arrondies.
❌ Menthe en grand aplat · texte menthe sur blanc · plus de 3 polices · ombres dures · photos de stock froides/studio · coins carrés.
