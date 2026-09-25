/**
 * Données de démonstration autour d'Aix-en-Provence : 20 membres fictifs, des séances à venir
 * et passées (avec avis), des candidatures et des conversations.
 *
 * Seuls les comptes démo (e-mail en @demo.sportmates.local) et tout ce qui s'y rattache sont
 * supprimés puis recréés : les vrais comptes sont conservés. Relancer le script rafraîchit les dates.
 *
 * En local : npm run db:seed:demo
 * En ligne : DATABASE_URL=libsql://… DATABASE_AUTH_TOKEN=… npm run db:seed:demo
 */
import { hashSync } from "bcryptjs";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { activities, applications, messages, reviews, users } from "../src/db/schema";
import type { Audience, Gender, SportLevel, SportType } from "../src/db/schema";
import * as schema from "../src/db/schema";
import { DEMO_EMAIL_DOMAIN, removeDemoData } from "./lib/demo-data";

const db = drizzle({
  client: createClient({
    url: process.env.DATABASE_URL ?? "file:local.db",
    authToken: process.env.DATABASE_AUTH_TOKEN,
  }),
  schema,
});

const DEMO_PASSWORD = "SportMates2026";
const AIX = { lat: 43.5297, lng: 5.4474 };
const now = new Date();
const DAY_MS = 24 * 3600 * 1000;

// -----------------------------------------------------------------------------
// Membres
// -----------------------------------------------------------------------------

interface Person {
  fullName: string;
  username: string;
  gender: Gender;
  level: SportLevel;
  sports: SportType[];
  bio: string;
}

const people: Person[] = [
  { fullName: "Camille", username: "camille.run", gender: "female", level: "beginner", sports: ["running", "fitness"], bio: "Toujours partante pour un footing tranquille au coucher du soleil." },
  { fullName: "Hugo", username: "hugo.padel", gender: "male", level: "intermediate", sports: ["padel", "tennis"], bio: "Padel, bonne humeur et quelques conseils si tu débutes." },
  { fullName: "Inès", username: "ines.volley", gender: "female", level: "intermediate", sports: ["volleyball", "running"], bio: "Je cherche des joueuses régulières pour du volley autour d'Aix." },
  { fullName: "Thomas", username: "thomas.five", gender: "male", level: "pro", sports: ["football", "running"], bio: "Ancien joueur en club, j'organise des matchs fair-play." },
  { fullName: "Nora", username: "nora.fitness", gender: "female", level: "beginner", sports: ["fitness", "running", "swimming"], bio: "Mobilité, renforcement doux et séances accessibles à toutes." },
  { fullName: "Léo", username: "leo.tennis", gender: "male", level: "intermediate", sports: ["tennis", "padel"], bio: "Un échange après le travail ? Je joue souvent aux Milles." },
  { fullName: "Sarah", username: "sarah.climb", gender: "female", level: "intermediate", sports: ["climbing", "cycling"], bio: "Escalade en salle, et sorties falaise quand la météo le permet." },
  { fullName: "Mathis", username: "mathis.basket", gender: "male", level: "pro", sports: ["basketball", "football"], bio: "Basket entre passionnés, sans prise de tête." },
  { fullName: "Zoé", username: "zoe.cycling", gender: "female", level: "intermediate", sports: ["cycling", "running", "volleyball"], bio: "Balades à vélo autour de la Sainte-Victoire." },
  { fullName: "Arthur", username: "arthur.bad", gender: "male", level: "beginner", sports: ["badminton", "tennis"], bio: "Je reprends le badminton, objectif : progresser en s'amusant." },
  { fullName: "Lina", username: "lina.foot", gender: "female", level: "intermediate", sports: ["football", "volleyball"], bio: "Des matchs féminins bienveillants dans le coin." },
  { fullName: "Maxime", username: "maxime.swim", gender: "male", level: "intermediate", sports: ["swimming", "cycling", "fitness"], bio: "Natation le matin, rythme régulier et motivant." },
  { fullName: "Emma", username: "emma.padel", gender: "female", level: "pro", sports: ["padel", "tennis", "football"], bio: "Padel niveau confirmé, toujours un créneau à partager." },
  { fullName: "Jules", username: "jules.run", gender: "male", level: "beginner", sports: ["running", "fitness", "football"], bio: "Courir sans pression et découvrir de nouveaux parcours." },
  { fullName: "Manon", username: "manon.tennis", gender: "female", level: "beginner", sports: ["tennis", "badminton", "fitness"], bio: "Tennis loisir et bonne énergie, même après une longue pause." },
  { fullName: "Rayan", username: "rayan.fitness", gender: "male", level: "intermediate", sports: ["fitness", "basketball"], bio: "Séances de renfo en plein air au parc de la Torse." },
  { fullName: "Clara", username: "clara.volley", gender: "female", level: "pro", sports: ["volleyball", "climbing", "padel"], bio: "Volley niveau confirmé, je cherche une équipe régulière." },
  { fullName: "Baptiste", username: "baptiste.cycling", gender: "male", level: "intermediate", sports: ["cycling", "swimming"], bio: "Sorties vélo tranquilles, pauses café obligatoires." },
  { fullName: "Julie", username: "julie.bad", gender: "female", level: "intermediate", sports: ["badminton", "padel", "volleyball"], bio: "Badminton loisir : je préfère les matchs serrés aux gros smashs." },
  { fullName: "Antoine", username: "antoine.football", gender: "male", level: "beginner", sports: ["football", "running"], bio: "Nouveau sur Aix, partant pour rencontrer du monde autour du foot." },
];

type Username = (typeof people)[number]["username"];

// -----------------------------------------------------------------------------
// Lieux (positions approximatives, quartiers d'Aix-en-Provence)
// -----------------------------------------------------------------------------

const places = {
  jourdan: { name: "Parc Jourdan", address: "Avenue Anatole France, 13100 Aix-en-Provence", lat: 43.5213, lng: 5.4432 },
  torse: { name: "Parc de la Torse", address: "Avenue des Infirmeries, 13100 Aix-en-Provence", lat: 43.5251, lng: 5.4636 },
  troisSautets: { name: "Bords de l'Arc – Pont des Trois Sautets", address: "Route de Nice, 13100 Aix-en-Provence", lat: 43.5129, lng: 5.4721 },
  rotonde: { name: "Départ : fontaine de la Rotonde", address: "Place du Général de Gaulle, 13100 Aix-en-Provence", lat: 43.5263, lng: 5.4452 },
  valDeLArc: { name: "Complexe sportif du Val de l'Arc", address: "Chemin des Infirmeries, 13100 Aix-en-Provence", lat: 43.5188, lng: 5.4698 },
  jasDeBouffanCity: { name: "City stade du Jas de Bouffan", address: "Jas de Bouffan, 13090 Aix-en-Provence", lat: 43.5283, lng: 5.4188 },
  jasDeBouffanGym: { name: "Gymnase du Jas de Bouffan", address: "Jas de Bouffan, 13090 Aix-en-Provence", lat: 43.5262, lng: 5.4152 },
  saintMitre: { name: "Terrain de basket de Saint-Mitre", address: "Quartier Saint-Mitre, 13090 Aix-en-Provence", lat: 43.5326, lng: 5.4196 },
  tennisMilles: { name: "Courts de tennis des Milles", address: "Les Milles, 13290 Aix-en-Provence", lat: 43.5043, lng: 5.3854 },
  climbMilles: { name: "Salle d'escalade des Milles", address: "Pôle d'activités des Milles, 13290 Aix-en-Provence", lat: 43.4931, lng: 5.3862 },
  padel: { name: "Terrains de padel du Pont de l'Arc", address: "Pont de l'Arc, 13090 Aix-en-Provence", lat: 43.5121, lng: 5.4428 },
  piscine: { name: "Piscine du Val de l'Arc", address: "Chemin des Infirmeries, 13100 Aix-en-Provence", lat: 43.5173, lng: 5.4679 },
} as const;

type Place = (typeof places)[keyof typeof places];

// -----------------------------------------------------------------------------
// Séances
// -----------------------------------------------------------------------------

interface ActivitySeed {
  creator: Username;
  sport: SportType;
  description: string;
  place: Place;
  /** Jour relatif à aujourd'hui (négatif = séance passée). */
  day: number;
  time: string;
  durationMinutes: number;
  /** null = tous niveaux. */
  level: SportLevel | null;
  audience: Audience;
  /** Places recherchées (hors organisateur). */
  spots: number;
  accepted: Username[];
  pending?: Username[];
  priceCents?: number;
  equipment?: string;
}

const upcoming: ActivitySeed[] = [
  { creator: "thomas.five", sport: "football", description: "Five du jeudi soir : matchs de 5 contre 5, fair-play avant tout. Chasubles fournies.", place: places.jasDeBouffanCity, day: 1, time: "20:00", durationMinutes: 90, level: null, audience: "all", spots: 9, accepted: ["mathis.basket", "antoine.football", "lina.foot", "jules.run", "emma.padel"], pending: ["rayan.fitness"] },
  { creator: "rayan.fitness", sport: "fitness", description: "Circuit renfo en plein air : gainage, squats et fractionné. Adapté à tous les niveaux.", place: places.torse, day: 1, time: "18:30", durationMinutes: 60, level: null, audience: "all", spots: 8, accepted: ["jules.run", "maxime.swim", "nora.fitness"] },
  { creator: "camille.run", sport: "running", description: "Footing tranquille de 6 km au coucher du soleil, allure discussion.", place: places.jourdan, day: 2, time: "18:30", durationMinutes: 60, level: "beginner", audience: "all", spots: 4, accepted: ["jules.run", "nora.fitness"], pending: ["antoine.football"] },
  { creator: "leo.tennis", sport: "tennis", description: "Échange en simple après le travail, court réservé.", place: places.tennisMilles, day: 2, time: "18:00", durationMinutes: 90, level: "intermediate", audience: "all", spots: 1, accepted: ["hugo.padel"], priceCents: 600, equipment: "Raquette de tennis" },
  { creator: "hugo.padel", sport: "padel", description: "Il reste deux places pour un padel en double après le travail, terrain réservé.", place: places.padel, day: 3, time: "18:00", durationMinutes: 90, level: "intermediate", audience: "all", spots: 3, accepted: ["leo.tennis"], pending: ["julie.bad"], priceCents: 900, equipment: "Raquette de padel (prêt possible)" },
  { creator: "mathis.basket", sport: "basketball", description: "Basket 3x3 entre hommes, niveau confirmé : matchs rythmés en 21 points.", place: places.saintMitre, day: 3, time: "18:30", durationMinutes: 90, level: "pro", audience: "men", spots: 5, accepted: ["thomas.five"] },
  { creator: "arthur.bad", sport: "badminton", description: "Badminton pour débutants : échanges, petits matchs et conseils. Volants fournis.", place: places.jasDeBouffanGym, day: 3, time: "19:00", durationMinutes: 90, level: "beginner", audience: "all", spots: 3, accepted: ["manon.tennis"], pending: ["camille.run"], priceCents: 500, equipment: "Raquette (prêt possible) et chaussures de salle" },
  { creator: "ines.volley", sport: "volleyball", description: "Volley entre femmes, niveau intermédiaire : échauffement puis matchs à 4 contre 4.", place: places.torse, day: 4, time: "19:00", durationMinutes: 90, level: "intermediate", audience: "women", spots: 7, accepted: ["lina.foot", "julie.bad", "zoe.cycling"] },
  { creator: "manon.tennis", sport: "tennis", description: "Tennis entre femmes pour débutantes : échanges en fond de court, sans pression.", place: places.tennisMilles, day: 2, time: "18:00", durationMinutes: 60, level: "beginner", audience: "women", spots: 1, accepted: [], equipment: "Raquette de tennis (prêt possible)" },
  { creator: "sarah.climb", sport: "climbing", description: "Session de bloc en salle, tous niveaux : on s'assure les uns les autres. Entrée à régler sur place.", place: places.climbMilles, day: 4, time: "19:00", durationMinutes: 120, level: null, audience: "all", spots: 3, accepted: ["clara.volley", "zoe.cycling"], priceCents: 1200, equipment: "Chaussons d'escalade (location sur place)" },
  { creator: "nora.fitness", sport: "fitness", description: "Mobilité douce et renforcement entre femmes, idéal pour (re)commencer.", place: places.jourdan, day: 5, time: "10:00", durationMinutes: 60, level: "beginner", audience: "women", spots: 8, accepted: ["camille.run", "manon.tennis"], equipment: "Tapis de sol" },
  { creator: "maxime.swim", sport: "swimming", description: "45 minutes de longueurs à allure régulière avant le travail.", place: places.piscine, day: 5, time: "07:30", durationMinutes: 60, level: "intermediate", audience: "all", spots: 3, accepted: ["baptiste.cycling"], priceCents: 350, equipment: "Bonnet et lunettes de natation" },
  { creator: "zoe.cycling", sport: "cycling", description: "Boucle de 55 km vers le lac du Bimont, rythme régulier avec une pause café.", place: places.rotonde, day: 6, time: "08:30", durationMinutes: 180, level: "intermediate", audience: "all", spots: 5, accepted: ["baptiste.cycling", "maxime.swim", "sarah.climb"], equipment: "Vélo de route et casque obligatoires" },
  { creator: "camille.run", sport: "running", description: "Running entre femmes : 5 km autour du parc de la Torse, on court ensemble et on finit ensemble.", place: places.torse, day: 6, time: "18:30", durationMinutes: 45, level: "beginner", audience: "women", spots: 5, accepted: ["nora.fitness", "manon.tennis"] },
  { creator: "julie.bad", sport: "badminton", description: "Double mixte de badminton, niveau intermédiaire. Terrain réservé.", place: places.valDeLArc, day: 6, time: "19:30", durationMinutes: 90, level: "intermediate", audience: "all", spots: 3, accepted: ["hugo.padel"], priceCents: 500, equipment: "Raquette et chaussures de salle" },
  { creator: "lina.foot", sport: "football", description: "Foot entre femmes, tous niveaux : la bienveillance avant la performance.", place: places.valDeLArc, day: 7, time: "18:30", durationMinutes: 90, level: null, audience: "women", spots: 9, accepted: ["ines.volley", "clara.volley", "emma.padel", "camille.run"], pending: ["zoe.cycling"] },
  { creator: "jules.run", sport: "running", description: "Découverte 5 km le long de l'Arc, ouvert aux débutants. On attend tout le monde.", place: places.troisSautets, day: 8, time: "09:00", durationMinutes: 45, level: "beginner", audience: "all", spots: 8, accepted: ["camille.run", "antoine.football", "nora.fitness"] },
  { creator: "emma.padel", sport: "padel", description: "Padel niveau confirmé du samedi matin, matchs en double.", place: places.padel, day: 9, time: "10:00", durationMinutes: 90, level: "pro", audience: "all", spots: 3, accepted: ["clara.volley"], priceCents: 1000, equipment: "Raquette de padel" },
];

const past: ActivitySeed[] = [
  { creator: "thomas.five", sport: "football", description: "Five du jeudi soir : matchs de 5 contre 5, fair-play avant tout.", place: places.jasDeBouffanCity, day: -2, time: "20:00", durationMinutes: 90, level: null, audience: "all", spots: 9, accepted: ["mathis.basket", "antoine.football", "rayan.fitness"] },
  { creator: "camille.run", sport: "running", description: "Footing tranquille de 6 km, allure discussion.", place: places.jourdan, day: -3, time: "18:30", durationMinutes: 60, level: "beginner", audience: "all", spots: 4, accepted: ["jules.run", "nora.fitness"] },
  { creator: "nora.fitness", sport: "fitness", description: "Mobilité douce et renforcement entre femmes.", place: places.jourdan, day: -4, time: "10:00", durationMinutes: 60, level: "beginner", audience: "women", spots: 8, accepted: ["camille.run", "manon.tennis"] },
  { creator: "hugo.padel", sport: "padel", description: "Padel en double après le travail.", place: places.padel, day: -5, time: "18:00", durationMinutes: 90, level: "intermediate", audience: "all", spots: 3, accepted: ["leo.tennis", "julie.bad"], priceCents: 900, equipment: "Raquette de padel" },
  { creator: "ines.volley", sport: "volleyball", description: "Volley entre femmes, niveau intermédiaire.", place: places.torse, day: -6, time: "19:00", durationMinutes: 90, level: "intermediate", audience: "women", spots: 7, accepted: ["lina.foot", "julie.bad", "zoe.cycling"] },
  { creator: "zoe.cycling", sport: "cycling", description: "Boucle vers le lac du Bimont avec pause café.", place: places.rotonde, day: -8, time: "08:30", durationMinutes: 180, level: "intermediate", audience: "all", spots: 5, accepted: ["baptiste.cycling", "sarah.climb"], equipment: "Vélo de route et casque obligatoires" },
];

const organizerReviews = [
  "Super séance, organisation au top !",
  "Très bonne ambiance, je reviendrai avec plaisir.",
  "Ponctuel, sympa et motivant.",
  "Séance bien pensée, on progresse sans se prendre la tête.",
];
const participantReviews = ["Ponctuel et fair-play, merci !", "Super énergie, à refaire.", "Très agréable, bon niveau de jeu."];

// Quelques échanges après l'acceptation, pour que la messagerie ne soit pas vide.
const chats: { creator: Username; applicant: Username; lines: [from: "creator" | "applicant", text: string][] }[] = [
  { creator: "thomas.five", applicant: "antoine.football", lines: [["applicant", "Salut ! Je peux venir avec des chaussures stabilisées ?"], ["creator", "Oui, c'est un synthétique, parfait. Rendez-vous 19h50 devant le city stade."], ["applicant", "Top, à jeudi !"]] },
  { creator: "camille.run", applicant: "jules.run", lines: [["creator", "Hello ! On se retrouve à l'entrée du parc, côté avenue Anatole France."], ["applicant", "Parfait, je serai là 5 minutes avant."]] },
  { creator: "ines.volley", applicant: "lina.foot", lines: [["applicant", "J'amène un ballon en plus ?"], ["creator", "Volontiers, merci ! Le filet est déjà installé."]] },
  { creator: "hugo.padel", applicant: "leo.tennis", lines: [["creator", "Terrain réservé, 9 € chacun à régler sur place."], ["applicant", "Ça marche, j'ai hâte de m'y remettre !"]] },
];

// -----------------------------------------------------------------------------

function dateIn(days: number, time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  const date = new Date(now);
  date.setDate(date.getDate() + days);
  date.setHours(hours!, minutes!, 0, 0);
  return date;
}

/** Vérifie la cohérence d'une séance (genre, niveau, sport, places) avant insertion. */
function checkActivity(seed: ActivitySeed, byUsername: Map<string, Person>) {
  const fail = (reason: string) => {
    throw new Error(`Séance incohérente (${seed.creator}, ${seed.sport}, jour ${seed.day}) : ${reason}`);
  };
  const creator = byUsername.get(seed.creator)!;
  if (!creator.sports.includes(seed.sport)) fail("sport absent des favoris de l'organisateur");
  const members = [...seed.accepted, ...(seed.pending ?? [])];
  if (new Set([seed.creator, ...members]).size !== members.length + 1) fail("participant en double");
  if (seed.accepted.length > seed.spots) fail("plus d'acceptés que de places");
  for (const username of [seed.creator, ...members]) {
    const person = byUsername.get(username) ?? fail(`membre inconnu ${username}`);
    if (seed.audience === "women" && person.gender !== "female") fail(`${username} n'est pas une femme`);
    if (seed.audience === "men" && person.gender !== "male") fail(`${username} n'est pas un homme`);
    if (seed.level && person.level !== seed.level) fail(`niveau de ${username} différent du niveau requis`);
  }
}

async function main() {
  const byUsername = new Map(people.map((person) => [person.username, person]));
  for (const seed of [...upcoming, ...past]) checkActivity(seed, byUsername);
  const passwordHash = hashSync(DEMO_PASSWORD, 10);

  await db.transaction(async (tx) => {
    // --- Suppression des données démo existantes (les vrais comptes ne sont pas touchés) ---
    const replaced = await removeDemoData(tx);

    // --- Membres ---
    const createdUsers = await tx
      .insert(users)
      .values(
        people.map((person, index) => {
          const joinedAt = new Date(now.getTime() - (60 - index * 2) * DAY_MS);
          return {
            email: `${person.username}${DEMO_EMAIL_DOMAIN}`,
            passwordHash,
            fullName: person.fullName,
            username: person.username,
            gender: person.gender,
            bio: person.bio,
            sportLevel: person.level,
            favoriteSports: person.sports,
            city: "Aix-en-Provence",
            homeLat: AIX.lat + ((index % 5) - 2) * 0.004,
            homeLng: AIX.lng + ((index % 4) - 2) * 0.005,
            // Portrait CC0 (public/avatars, crédits dans public/avatars/CREDITS.md), du genre du profil.
            avatarUrl: `/avatars/${person.username}.webp`,
            onboardedAt: joinedAt,
            createdAt: joinedAt,
          };
        }),
      )
      .returning({ id: users.id, username: users.username });
    const userId = new Map(createdUsers.map((user) => [user.username, user.id]));
    const idOf = (username: Username) => userId.get(username)!;

    // --- Séances, candidatures et messages système ---
    const insertActivities = async (seeds: ActivitySeed[]) => {
      const rows = await tx
        .insert(activities)
        .values(
          seeds.map((seed) => {
            const spotsAvailable = seed.spots - seed.accepted.length;
            const startsAt = dateIn(seed.day, seed.time);
            return {
              creatorId: idOf(seed.creator),
              sportType: seed.sport,
              description: seed.description,
              locationName: seed.place.name,
              address: seed.place.address,
              priceCents: seed.priceCents ?? 0,
              equipmentRequired: seed.equipment !== undefined,
              equipmentNote: seed.equipment ?? null,
              audience: seed.audience,
              lat: seed.place.lat,
              lng: seed.place.lng,
              startsAt,
              durationMinutes: seed.durationMinutes,
              requiredLevel: seed.level,
              spotsTotal: seed.spots,
              spotsAvailable,
              status: spotsAvailable === 0 ? ("full" as const) : ("open" as const),
              // Publiée quelques jours avant la séance (jamais dans le futur).
              createdAt: new Date(Math.min(now.getTime(), startsAt.getTime() - 5 * DAY_MS)),
            };
          }),
        )
        .returning({ id: activities.id, createdAt: activities.createdAt });

      const applicationRows = seeds.flatMap((seed, index) => {
        const activity = rows[index]!;
        const appliedAt = new Date(activity.createdAt.getTime() + 3600 * 1000);
        return [
          ...seed.accepted.map((username) => ({ activityId: activity.id, applicantId: idOf(username), status: "accepted" as const, createdAt: appliedAt })),
          ...(seed.pending ?? []).map((username) => ({
            activityId: activity.id,
            applicantId: idOf(username),
            status: "pending" as const,
            message: "Salut ! Je serais ravi·e de me joindre à vous.",
            createdAt: new Date(Math.min(now.getTime(), appliedAt.getTime() + DAY_MS)),
          })),
        ];
      });
      const insertedApplications =
        applicationRows.length > 0
          ? await tx
              .insert(applications)
              .values(applicationRows)
              .returning({ id: applications.id, activityId: applications.activityId, applicantId: applications.applicantId, status: applications.status, createdAt: applications.createdAt })
          : [];

      // Comme dans l'application : chaque acceptation ouvre la conversation par un message système.
      const creatorByActivity = new Map(seeds.map((seed, index) => [rows[index]!.id, idOf(seed.creator)]));
      const accepted = insertedApplications.filter((application) => application.status === "accepted");
      if (accepted.length > 0) {
        await tx.insert(messages).values(
          accepted.map((application) => ({
            applicationId: application.id,
            senderId: creatorByActivity.get(application.activityId)!,
            kind: "system" as const,
            content: "Candidature acceptée ! Vous pouvez maintenant discuter pour vous organiser.",
            readAt: new Date(application.createdAt.getTime() + 3 * 3600 * 1000),
            createdAt: new Date(application.createdAt.getTime() + 2 * 3600 * 1000),
          })),
        );
      }
      return { rows, applications: accepted };
    };

    const upcomingResult = await insertActivities(upcoming);
    const pastResult = await insertActivities(past);

    // --- Avis dans les deux sens sur les séances passées ---
    const reviewRows = past.flatMap((seed, index) => {
      const activityId = pastResult.rows[index]!.id;
      const organizer = idOf(seed.creator);
      return seed.accepted.flatMap((username, position) => [
        { activityId, reviewerId: idOf(username), revieweeId: organizer, rating: position % 3 === 2 ? 4 : 5, comment: organizerReviews[(index + position) % organizerReviews.length] },
        { activityId, reviewerId: organizer, revieweeId: idOf(username), rating: 5, comment: participantReviews[(index + position) % participantReviews.length] },
      ]);
    });
    await tx.insert(reviews).values(reviewRows);

    // --- Conversations ---
    const allSeeds = [...upcoming, ...past];
    const allRows = [...upcomingResult.rows, ...pastResult.rows];
    const allApplications = [...upcomingResult.applications, ...pastResult.applications];
    const chatRows = chats.flatMap((chat) => {
      const seedIndex = allSeeds.findIndex((seed) => seed.creator === chat.creator && seed.accepted.includes(chat.applicant) && seed.day > 0);
      const activityId = allRows[seedIndex]!.id;
      const application = allApplications.find((row) => row.activityId === activityId && row.applicantId === idOf(chat.applicant))!;
      const start = application.createdAt.getTime() + 3 * 3600 * 1000;
      return chat.lines.map(([from, content], position) => {
        const createdAt = new Date(Math.min(now.getTime() - 60_000, start + position * 20 * 60 * 1000));
        return {
          applicationId: application.id,
          senderId: from === "creator" ? idOf(chat.creator) : idOf(chat.applicant),
          kind: "text" as const,
          content,
          readAt: createdAt,
          createdAt,
        };
      });
    });
    await tx.insert(messages).values(chatRows);

    console.log(
      `Seed démo terminé : ${people.length} comptes, ${upcoming.length} séances à venir, ${past.length} passées, ` +
        `${reviewRows.length} avis, ${chatRows.length} messages (${replaced} anciens comptes démo remplacés).`,
    );
  });

  console.log(`Connexion : <pseudo>${DEMO_EMAIL_DOMAIN} (ex. camille.run${DEMO_EMAIL_DOMAIN}), mot de passe ${DEMO_PASSWORD}`);
}

main().catch((error) => {
  console.error("Le seed démo a échoué.", error);
  process.exitCode = 1;
});
