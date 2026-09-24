# SportBud

Web app de mise en relation de partenaires de sport autour d'une carte interactive.

**Stack** : Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · shadcn/ui · SQLite (Drizzle ORM + libSQL)

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

## Authentification

Mots de passe hachés avec bcrypt, sessions stockées en base (jeton aléatoire dans un cookie
`httpOnly`, seul son hash SHA-256 est enregistré), durée de 30 jours prolongée à l'usage.

## Mise en ligne (optionnel)

Un fichier SQLite ne fonctionne pas sur un hébergeur serverless (Vercel…). Créer une base
[Turso](https://turso.tech) (gratuite) puis définir `DATABASE_URL` et `DATABASE_AUTH_TOKEN`
(voir `.env.example`) : le code fonctionne sans modification.
