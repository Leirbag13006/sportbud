# SportMates

*Bouge. Rencontre. Partage.* — Web app de mise en relation de partenaires de sport (liste d'activités et carte interactive).

**Stack** : Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · shadcn/ui · SQLite (Drizzle ORM + libSQL) · Leaflet + MapLibre (fond de carte vectoriel OpenFreeMap aux couleurs SportMates, `src/config/map-style`)

## Lancer le projet

Prérequis : Node.js 20 ou plus récent.

```bash
npm install
npm run dev
```

Puis ouvrir http://localhost:3000 et créer un compte.

La base de données est un simple fichier `local.db` créé automatiquement à la racine
(les migrations sont appliquées à chaque `npm run dev`). Aucune configuration n'est nécessaire.

## Base de données

| Commande | Rôle |
|---|---|
| `npm run db:studio` | Explorer et modifier les données dans le navigateur (Drizzle Studio) |
| `npm run db:reset` | Supprimer toutes les données et repartir d'une base vide |
| `npm run db:generate` | Générer une migration SQL après une modification de `src/db/schema.ts` |
| `npm run db:migrate` | Appliquer les migrations en attente |

Le schéma est défini dans `src/db/schema.ts`, les migrations SQL générées sont dans `drizzle/`.

## Structure

```
src/
├── app/
│   ├── (app)/          # Pages connectées : carte, messages, profil (+ navigation)
│   ├── (auth)/         # Connexion, inscription et leurs Server Actions
│   └── auth/           # Routes techniques (session expirée)
├── components/         # Composants UI (ui/ = shadcn), formulaires, layout
├── config/             # Navigation, niveaux sportifs…
├── db/                 # Schéma Drizzle et connexion à la base
├── lib/                # Authentification (sessions, mots de passe), validation Zod
└── proxy.ts            # Redirections selon l'état de connexion
```

## Design system

La direction artistique est dans `design-system/` (kit livré sous le nom provisoire « SportLink ») (`DESIGN.md`, tokens, logos, prototype de référence).
Les tokens sont intégrés à Tailwind dans `src/app/globals.css` ; les consignes pour l'IA sont dans `CLAUDE.md`.

## Écran Explorer

L'accueil affiche les activités disponibles en **liste de cartes** (photo du sport, niveau, date,
participants, distance, bouton Rejoindre) ou sur la **carte** (bouton Liste / Carte, mémorisé dans
l'URL `?view=map`). Les filtres (sport, distance, date, niveau, places disponibles, tri) s'appliquent
aux deux vues. Les distances sont calculées dans le navigateur à partir de la position de l'utilisateur.

Photos des sports : licence CC0 (domaine public), voir `public/sports/CREDITS.md`.

## Pages publiques

- **Accueil** `/` : pour un visiteur, la landing (inscription) avec les 6 prochaines séances.
- **Séances** `/seances` (filtre `?sport=`) et **page d'une séance** `/seances/[id]`, partageable (WhatsApp,
  bouton « Partager » de la fiche dans l'app) avec une image d'aperçu générée (`opengraph-image.tsx`).
  Lieu approximatif uniquement (la ville) : adresse, description et participants restent réservés aux membres
  (`src/lib/activities/public.ts`). « Rejoindre » mène à l'inscription puis rouvre la séance dans l'app (`?next=`).

## Authentification

Mots de passe hachés avec bcrypt, sessions stockées en base (jeton aléatoire dans un cookie
`httpOnly`, seul son hash SHA-256 est enregistré), durée de 30 jours prolongée à l'usage.

- **Mot de passe oublié** : lien à usage unique valable 1 h (hash stocké, 3 demandes/h max), envoyé par
  SMTP (variables `SMTP_*` dans `.env.example`) ; sans SMTP, le lien est écrit dans les logs du serveur.
  La réinitialisation ferme toutes les sessions du compte.
- **Limite de connexion** : 5 échecs par compte ou 20 par adresse IP en 15 min bloquent la connexion
  (empreintes dans `login_attempts`, purgées après 24 h) ; une réinitialisation du mot de passe lève le blocage.
- **Suppression du compte** (profil › Zone sensible), confirmée par le mot de passe : effacement en cascade.
- **Parcours d'accueil** `/welcome` après l'inscription : sports favoris, niveau, ville (centre de l'exploration).

## Confiance et sécurité

- Avis dans les deux sens après chaque séance (organisateur ↔ participants), 1 à 5 étoiles + commentaire.
- Menu « ⋯ » sur un membre : **signaler** (motif + précisions, enregistré dans `reports`) ou **bloquer**
  (activités masquées dans les deux sens, candidatures en attente refusées, messagerie coupée).

## Messagerie et notifications « temps réel »

- **Groupe de la séance** (`/messages/g-<id de la séance>`, tables `group_messages` et `group_chat_reads`) :
  l'organisateur et tous les participants acceptés. Il s'ouvre au premier participant accepté ; arrivées, départs,
  modifications et annulation y sont annoncés par un message automatique.
- **Conversation privée** organisateur ↔ participant (`/messages/<id de la candidature>`, table `messages`),
  accessible depuis la liste des membres du groupe ; elle n'apparaît dans la liste qu'une fois un message écrit.

Le temps réel repose sur un rafraîchissement périodique (SWR) de routes API JSON :

| Donnée | Route | Fréquence |
|---|---|---|
| Conversation ouverte | `GET /api/conversations/[id]/messages` | 3 s |
| Liste des conversations | `GET /api/conversations` | 10 s |
| Badges + toasts (messages non lus, candidatures) | `GET /api/notifications` | 10 s |

Ce choix fonctionne partout (serveur local comme hébergement serverless), contrairement à une
connexion push en mémoire. Le rafraîchissement se met en pause quand l'onglet est masqué et
reprend immédiatement au retour. L'envoi d'un message est optimiste (affichage immédiat).

## Mise en ligne

Le site est déployé sur **Vercel** (offre gratuite Hobby) avec une base **Turso** (SQLite hébergé, région
`aws-eu-west-1`) : **https://sport-mates.vercel.app**

Chaque `git push` sur `main` redéploie automatiquement le site (dépôt GitHub relié au projet Vercel).

- Variables d'environnement (Vercel → Settings → Environment Variables, Production) :
  `DATABASE_URL` et `DATABASE_AUTH_TOKEN` (jeton : `turso db tokens create sportlink`).
- À chaque déploiement, le script `vercel-build` applique les migrations à la base Turso puis construit le site.
- Déployer manuellement : `npx vercel deploy --prod` (le fichier `.vercelignore` exclut la base locale et les secrets).
- Les données en ligne sont indépendantes de `local.db` (comptes de test locaux).
