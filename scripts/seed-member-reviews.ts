/**
 * Donne à un vrai membre quelques avis 5 étoiles de comptes démo, pour une démonstration en direct.
 * Crée deux séances passées organisées par des comptes démo, où le membre est participant accepté,
 * puis les avis des autres participants sur lui.
 *
 * Tout est rattaché aux comptes démo : `npm run db:seed:demo` l'efface. Relancer ce script remplace
 * les séances et avis qu'il a déjà créés pour ce membre (pas de doublons).
 *
 * En local : npx tsx scripts/seed-member-reviews.ts <pseudo>
 * En ligne : DATABASE_URL=libsql://… DATABASE_AUTH_TOKEN=… npx tsx scripts/seed-member-reviews.ts <pseudo>
 */
import { createClient } from "@libsql/client";
import { and, inArray, like, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/libsql";

import * as schema from "../src/db/schema";
import { activities, applications, messages, reviews, users } from "../src/db/schema";
import type { SportType } from "../src/db/schema";

const db = drizzle({
  client: createClient({ url: process.env.DATABASE_URL ?? "file:local.db", authToken: process.env.DATABASE_AUTH_TOKEN }),
  schema,
});

const DEMO_EMAIL_DOMAIN = "@demo.sportmates.local";
const DAY_MS = 24 * 3600 * 1000;

interface SessionSeed {
  organizer: string;
  others: string[];
  sport: SportType;
  description: string;
  place: { name: string; address: string; lat: number; lng: number };
  daysAgo: number;
  hour: number;
  reviews: Record<string, string>;
}

const SESSIONS: SessionSeed[] = [
  {
    organizer: "hugo.padel",
    others: ["emma.padel", "leo.tennis"],
    sport: "padel",
    description: "Padel en double, niveau intermédiaire : échauffement puis matchs en deux sets.",
    place: { name: "Complexe sportif du Val de l'Arc", address: "Chemin des Infirmeries, 13100 Aix-en-Provence", lat: 43.5188, lng: 5.4698 },
    daysAgo: 5,
    hour: 18,
    reviews: {
      "hugo.padel": "Super partenaire, ponctuel et toujours de bonne humeur. À refaire !",
      "emma.padel": "Très bon niveau et super ambiance, merci pour la partie.",
      "leo.tennis": "Fair-play et motivant, on a passé un super moment.",
    },
  },
  {
    organizer: "camille.run",
    others: ["jules.run"],
    sport: "running",
    description: "Footing tranquille au coucher du soleil, allure discussion.",
    place: { name: "Parc Jourdan", address: "Avenue Anatole France, 13100 Aix-en-Provence", lat: 43.5213, lng: 5.4432 },
    daysAgo: 12,
    hour: 19,
    reviews: {
      "camille.run": "Ponctuel et super sympa, on a gardé le rythme tout du long.",
      "jules.run": "Top pour courir à plusieurs, je recommande !",
    },
  },
];

async function main() {
  const target = process.argv[2]?.trim();
  if (!target) throw new Error("Indique le pseudo du membre : npx tsx scripts/seed-member-reviews.ts <pseudo>");

  const member = await db.query.users.findFirst({ where: sql`lower(${users.username}) = lower(${target})` });
  if (!member) {
    const close = await db.select({ username: users.username }).from(users).where(like(users.username, `%${target}%`)).limit(10);
    throw new Error(`Aucun membre « ${target} ».${close.length ? ` Pseudos proches : ${close.map((u) => u.username).join(", ")}` : ""}`);
  }
  if (member.email.endsWith(DEMO_EMAIL_DOMAIN)) throw new Error("Ce script sert à noter un vrai membre, pas un compte démo.");

  const demoNames = [...new Set(SESSIONS.flatMap((s) => [s.organizer, ...s.others]))];
  const demoUsers = await db.select({ id: users.id, username: users.username }).from(users).where(inArray(users.username, demoNames));
  const idOf = (username: string) => {
    const found = demoUsers.find((u) => u.username === username);
    if (!found) throw new Error(`Compte démo introuvable : ${username} (lance d'abord npm run db:seed:demo).`);
    return found.id;
  };

  await db.transaction(async (tx) => {
    // Séances déjà créées par ce script pour ce membre (même texte, organisées par un compte démo) : on les remplace (les avis et candidatures suivent en cascade).
    const previous = await tx
      .select({ id: activities.id })
      .from(activities)
      .innerJoin(applications, sql`${applications.activityId} = ${activities.id}`)
      .where(and(inArray(activities.description, SESSIONS.map((s) => s.description)), inArray(activities.creatorId, demoUsers.map((u) => u.id)), sql`${applications.applicantId} = ${member.id}`));
    if (previous.length) await tx.delete(activities).where(inArray(activities.id, previous.map((a) => a.id)));

    for (const seed of SESSIONS) {
      const startsAt = new Date(Date.now() - seed.daysAgo * DAY_MS);
      startsAt.setHours(seed.hour, 0, 0, 0);
      const participants = [member.id, ...seed.others.map(idOf)];
      const organizerId = idOf(seed.organizer);
      const [activity] = await tx
        .insert(activities)
        .values({
          creatorId: organizerId,
          sportType: seed.sport,
          description: seed.description,
          locationName: seed.place.name,
          address: seed.place.address,
          lat: seed.place.lat,
          lng: seed.place.lng,
          startsAt,
          durationMinutes: 90,
          requiredLevel: null,
          spotsTotal: participants.length,
          spotsAvailable: 0,
          status: "full",
          createdAt: new Date(startsAt.getTime() - 3 * DAY_MS),
        })
        .returning({ id: activities.id });

      const apps = await tx
        .insert(applications)
        .values(participants.map((applicantId) => ({ activityId: activity!.id, applicantId, status: "accepted" as const, createdAt: new Date(startsAt.getTime() - 2 * DAY_MS) })))
        .returning({ id: applications.id });
      // Comme dans l'application : chaque acceptation ouvre la conversation par un message système.
      await tx.insert(messages).values(apps.map((a) => ({
        applicationId: a.id, senderId: organizerId, kind: "system" as const,
        content: "Candidature acceptée ! Vous pouvez maintenant discuter pour vous organiser.",
        readAt: new Date(startsAt.getTime() - 2 * DAY_MS + 3600 * 1000), createdAt: new Date(startsAt.getTime() - 2 * DAY_MS),
      })));

      await tx.insert(reviews).values(Object.entries(seed.reviews).map(([author, comment], i) => ({
        activityId: activity!.id, reviewerId: idOf(author), revieweeId: member.id, rating: 5, comment,
        createdAt: new Date(startsAt.getTime() + (3 + i) * 3600 * 1000),
      })));
    }
  });

  const count = SESSIONS.reduce((n, s) => n + Object.keys(s.reviews).length, 0);
  console.log(`${count} avis 5 étoiles ajoutés pour ${member.username} (${SESSIONS.length} séances passées).`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
