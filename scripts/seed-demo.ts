import { hashSync } from "bcryptjs";
import { db } from "../src/db";
import {
  activities,
  applications,
  blocks,
  messages,
  passwordResetTokens,
  reports,
  reviews,
  sessions,
  userAchievements,
  users,
} from "../src/db/schema";
import type { Audience, SportType } from "../src/db/schema";

const DEMO_PASSWORD = "SportMates2026";
const AIX = { lat: 43.5297, lng: 5.4474 };
const now = new Date();
const passwordHash = hashSync(DEMO_PASSWORD, 10);

const people = [
  ["Camille", "camille.run", "female", "running", "beginner", "Toujours partante pour un footing tranquille au coucher du soleil."],
  ["Hugo", "hugo.padel", "male", "padel", "intermediate", "Padel, bonne humeur et quelques conseils si tu débutes."],
  ["Inès", "ines.volley", "female", "volleyball", "intermediate", "Je cherche des joueuses et joueurs réguliers autour d'Aix."],
  ["Thomas", "thomas.five", "male", "football", "pro", "Ancien joueur en club, je monte des matchs fair-play."],
  ["Nora", "nora.fitness", "female", "fitness", "beginner", "Mobilité, renforcement doux et séances accessibles à tous les niveaux."],
  ["Léo", "leo.tennis", "male", "tennis", "intermediate", "Un échange après le travail ? Je suis souvent aux Milles."],
  ["Sarah", "sarah.climb", "female", "climbing", "intermediate", "Escalade en salle et sorties falaise quand la météo le permet."],
  ["Mathis", "mathis.basket", "male", "basketball", "pro", "Basket entre passionnés, sans prise de tête."],
  ["Zoé", "zoe.cycling", "female", "cycling", "intermediate", "Balades vélo autour de la Sainte-Victoire."],
  ["Arthur", "arthur.bad", "male", "badminton", "beginner", "Je reprends le badminton, objectif : progresser en s'amusant."],
  ["Lina", "lina.foot", "female", "football", "intermediate", "Des matchs féminins bienveillants dans le coin."],
  ["Maxime", "maxime.swim", "male", "swimming", "intermediate", "Natation le matin, rythme régulier et motivant."],
  ["Emma", "emma.padel", "female", "padel", "pro", "Padel niveau confirmé, toujours un créneau à partager."],
  ["Jules", "jules.run", "male", "running", "beginner", "Courir sans pression, découvrir de nouveaux parcours."],
  ["Manon", "manon.tennis", "female", "tennis", "beginner", "Tennis loisir et bonne énergie, même après une longue pause."],
  ["Rayan", "rayan.fitness", "male", "fitness", "intermediate", "Séances renfo en plein air au parc de la Torse."],
  ["Clara", "clara.volley", "female", "volleyball", "pro", "Volley niveau confirmé, recherche une équipe régulière."],
  ["Baptiste", "baptiste.cycling", "male", "cycling", "intermediate", "Sorties vélo tranquilles et pauses café obligatoires."],
  ["Julie", "julie.bad", "female", "badminton", "intermediate", "Badminton loisir, je préfère les matchs serrés aux gros smashs."],
  ["Antoine", "antoine.football", "male", "football", "beginner", "Nouveau sur Aix, partant pour rencontrer du monde autour du foot."],
] as const;

const activitiesSeed = [
  ["running", "Foot du dimanche autour de la Torse", 2, 4, 2, 9, "all", 0, false],
  ["padel", "Deux places pour un padel après le travail", 3, 2, 1, 18, "all", 900, false],
  ["volleyball", "Volley entre femmes - niveau intermédiaire", 4, 5, 3, 19, "women", 0, false],
  ["football", "Five du jeudi soir", 1, 8, 2, 20, "all", 800, false],
  ["yoga", "Yoga doux au parc", 5, 6, 4, 10, "women", 0, true],
  ["tennis", "Tennis loisir, court réservé", 2, 2, 1, 18, "all", 600, true],
  ["climbing", "Session bloc à la salle", 4, 3, 2, 19, "all", 1200, true],
  ["basketball", "Basket 3x3 au Val de l'Arc", 3, 6, 2, 18, "men", 0, false],
  ["cycling", "Boucle vélo Sainte-Victoire", 6, 5, 3, 8, "all", 0, false],
  ["badminton", "Badminton débutant - mardi", 3, 4, 2, 19, "all", 500, true],
  ["football", "Foot entre femmes au stade Ruocco", 7, 10, 5, 18, "women", 0, false],
  ["running", "Running découverte 5 km", 8, 8, 4, 9, "all", 0, false],
  ["padel", "Padel confirmé du samedi", 9, 4, 2, 10, "all", 1000, false],
  ["fitness", "Renforcement en plein air", 10, 8, 3, 18, "all", 0, true],
  ["volleyball", "Volley entre hommes - niveau avancé", 11, 6, 2, 19, "men", 0, false],
] as const;

function avatarUrl(name: string, index: number) {
  const colors = ["#2FE0A0", "#F29A3E", "#7DD3FC", "#C4B5FD", "#F9A8D4"];
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160"><rect width="160" height="160" rx="80" fill="${colors[index % colors.length]}"/><circle cx="80" cy="62" r="28" fill="#0A1A17"/><path d="M34 140c5-31 23-46 46-46s41 15 46 46" fill="#0A1A17"/><text x="80" y="153" text-anchor="middle" font-family="Arial" font-size="15" font-weight="700" fill="#0A1A17">${initials}</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

function dateIn(days: number, hour: number) {
  const date = new Date(now);
  date.setDate(date.getDate() + days);
  date.setHours(hour, 0, 0, 0);
  return date;
}

async function main() {
  await db.transaction(async (tx) => {
    await tx.delete(messages);
    await tx.delete(reviews);
    await tx.delete(reports);
    await tx.delete(blocks);
    await tx.delete(userAchievements);
    await tx.delete(passwordResetTokens);
    await tx.delete(sessions);
    await tx.delete(applications);
    await tx.delete(activities);
    await tx.delete(users);

    const createdUsers = await tx
      .insert(users)
      .values(
        people.map(([fullName, username, gender, sport, level, bio], index) => ({
          email: `${username}@demo.sportmates.local`,
          passwordHash,
          fullName,
          username,
          gender: gender as "female" | "male",
          bio,
          sportLevel: level as "beginner" | "intermediate" | "pro",
          favoriteSports: [sport],
          city: "Aix-en-Provence",
          homeLat: AIX.lat + (index % 4) * 0.002,
          homeLng: AIX.lng + (index % 5) * 0.002,
          avatarUrl: avatarUrl(fullName, index),
          onboardedAt: new Date(now.getTime() - 30 * 24 * 3600 * 1000),
        })),
      )
      .returning({ id: users.id });

    const activityRows = await tx
      .insert(activities)
      .values(
        activitiesSeed.map(([sportType, description, day, spotsTotal, acceptedCount, hour, audience, priceCents, equipmentRequired], index) => ({
          creatorId: createdUsers[index % createdUsers.length]!.id,
          sportType: sportType as SportType,
          description,
          locationName: ["Parc de la Torse", "Aix Padel", "Complexe du Val de l'Arc", "Stade Ruocco"][index % 4],
          address: "Aix-en-Provence",
          priceCents,
          equipmentRequired,
          equipmentNote: equipmentRequired ? "Prévoir sa tenue et son matériel" : null,
          audience: audience as Audience,
          lat: AIX.lat + ((index % 5) - 2) * 0.004,
          lng: AIX.lng + ((index % 4) - 2) * 0.004,
          startsAt: dateIn(day, hour),
          durationMinutes: 90,
          requiredLevel: (index % 3 === 0 ? "beginner" : "intermediate") as "beginner" | "intermediate",
          spotsTotal,
          spotsAvailable: spotsTotal - acceptedCount,
          status: "open" as const,
        })),
      )
      .returning({ id: activities.id });

    const applicationRows = [];
    for (let index = 0; index < activityRows.length; index += 1) {
      const activity = activityRows[index]!;
      const seed = activitiesSeed[index]!;
      const creatorIndex = index % createdUsers.length;
      for (let participant = 1; participant <= seed[4]; participant += 1) {
        const applicant = createdUsers[(creatorIndex + participant) % createdUsers.length]!;
        applicationRows.push({
          activityId: activity.id,
          applicantId: applicant.id,
          status: "accepted" as const,
        });
      }
    }
    await tx.insert(applications).values(applicationRows);

    const completedActivities = await tx
      .insert(activities)
      .values(
        [0, 1, 2, 3, 4, 5].map((index) => ({
          creatorId: createdUsers[index]!.id,
          sportType: people[index]![3] as SportType,
          description: "Une séance conviviale entre membres de SportMates.",
          locationName: "Aix-en-Provence",
          address: "Aix-en-Provence",
          priceCents: 0,
          equipmentRequired: false,
          equipmentNote: null,
          audience: "all" as const,
          lat: AIX.lat,
          lng: AIX.lng,
          startsAt: dateIn(-index - 2, 18),
          durationMinutes: 90,
          requiredLevel: "beginner" as const,
          spotsTotal: 4,
          spotsAvailable: 2,
          status: "open" as const,
        })),
      )
      .returning({ id: activities.id });

    await tx.insert(applications).values(
      completedActivities.map((activity, index) => ({
        activityId: activity.id,
        applicantId: createdUsers[(index + 1) % createdUsers.length]!.id,
        status: "accepted" as const,
      })),
    );

    await tx.insert(reviews).values(
      completedActivities.flatMap((activity, index) => {
        const reviewer = createdUsers[(index + 1) % createdUsers.length]!.id;
        const reviewee = createdUsers[index]!.id;
        return [
          {
            activityId: activity.id,
            reviewerId: reviewer,
            revieweeId: reviewee,
            rating: 5,
            comment: ["Super séance, organisation au top !", "Très bonne ambiance, je reviendrai avec plaisir.", "Ponctuel, sympa et motivant."][index % 3],
          },
        ];
      }),
    );
  });

  console.log(`Seed démo terminé : ${people.length} comptes, ${activitiesSeed.length + 6} activités.`);
  console.log(`Mot de passe des comptes démo : ${DEMO_PASSWORD}`);
}

main().catch((error) => {
  console.error("Le seed démo a échoué.", error);
  process.exitCode = 1;
});
