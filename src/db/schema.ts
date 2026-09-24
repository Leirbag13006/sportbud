/**
 * Schéma de la base SQLite (Drizzle ORM).
 * Toute modification ici doit être suivie de `npm run db:generate` puis `npm run db:migrate`.
 *
 * Les dates sont stockées en millisecondes (entiers) et manipulées comme des objets Date.
 */
import { relations, sql } from "drizzle-orm";
import { check, index, integer, real, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

// -----------------------------------------------------------------------------
// Valeurs énumérées (partagées avec l'interface et la validation)
// -----------------------------------------------------------------------------

export const SPORT_LEVEL_VALUES = ["beginner", "intermediate", "pro"] as const;
export const SPORT_TYPE_VALUES = [
  "football", "basketball", "tennis", "padel", "badminton", "volleyball",
  "running", "cycling", "swimming", "climbing", "fitness", "other",
] as const;
export const ACTIVITY_STATUS_VALUES = ["open", "full", "cancelled"] as const;
export const APPLICATION_STATUS_VALUES = ["pending", "accepted", "rejected"] as const;
/** text = message écrit par un membre ; system = notification automatique (ex. candidature acceptée). */
export const MESSAGE_KIND_VALUES = ["text", "system"] as const;

/** Liste SQL pour les contraintes CHECK : ('a', 'b', …). */
const sqlList = (values: readonly string[]) => sql.raw(`(${values.map((v) => `'${v}'`).join(", ")})`);

const id = () => text("id").primaryKey().$defaultFn(() => crypto.randomUUID());
const createdAt = () =>
  integer("created_at", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date());
const updatedAt = () =>
  integer("updated_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date())
    .$onUpdateFn(() => new Date());

// -----------------------------------------------------------------------------
// Utilisateurs et sessions
// -----------------------------------------------------------------------------

export const users = sqliteTable(
  "users",
  {
    id: id(),
    email: text("email").notNull(),
    passwordHash: text("password_hash").notNull(),
    fullName: text("full_name").notNull(),
    bio: text("bio"),
    sportLevel: text("sport_level", { enum: SPORT_LEVEL_VALUES }).notNull().default("beginner"),
    /** Photo de profil : image WebP redimensionnée côté navigateur, stockée en data URL (~30 Ko). */
    avatarUrl: text("avatar_url"),
    /** Sports favoris (5 max), affichés sur le profil. */
    favoriteSports: text("favorite_sports", { mode: "json" }).$type<SportType[]>().notNull().default(sql`'[]'`),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    uniqueIndex("users_email_unique").on(t.email),
    check("users_sport_level_check", sql`${t.sportLevel} in ${sqlList(SPORT_LEVEL_VALUES)}`),
    check("users_full_name_length", sql`length(trim(${t.fullName})) between 2 and 80`),
    check("users_bio_length", sql`${t.bio} is null or length(${t.bio}) <= 500`),
  ],
);

/**
 * Sessions de connexion. L'identifiant stocké est le hash SHA-256 du jeton du cookie :
 * une fuite de la base ne permet pas d'usurper une session.
 */
export const sessions = sqliteTable(
  "sessions",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
    createdAt: createdAt(),
  },
  (t) => [index("sessions_user_id_idx").on(t.userId)],
);

// -----------------------------------------------------------------------------
// Activités
// -----------------------------------------------------------------------------

export const activities = sqliteTable(
  "activities",
  {
    id: id(),
    creatorId: text("creator_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    sportType: text("sport_type", { enum: SPORT_TYPE_VALUES }).notNull(),
    description: text("description"),
    /** Nom libre du lieu (« City stade du parc »). */
    locationName: text("location_name"),
    /** Adresse postale, issue du géocodage ou saisie par le créateur (200 car. max, validé par Zod). */
    address: text("address"),
    /** Prix par personne en centimes (0 = gratuit). Réglé directement à l'organisateur. */
    priceCents: integer("price_cents").notNull().default(0),
    /** Vrai si chaque participant doit apporter son matériel. */
    equipmentRequired: integer("equipment_required", { mode: "boolean" }).notNull().default(false),
    /** Précision sur le matériel (« raquette + chaussures de salle »), 120 car. max (validé par Zod). */
    equipmentNote: text("equipment_note"),
    lat: real("lat").notNull(),
    lng: real("lng").notNull(),
    startsAt: integer("starts_at", { mode: "timestamp_ms" }).notNull(),
    durationMinutes: integer("duration_minutes").notNull().default(60),
    /** null = ouvert à tous les niveaux. */
    requiredLevel: text("required_level", { enum: SPORT_LEVEL_VALUES }),
    spotsTotal: integer("spots_total").notNull(),
    spotsAvailable: integer("spots_available").notNull(),
    status: text("status", { enum: ACTIVITY_STATUS_VALUES }).notNull().default("open"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    index("activities_status_starts_at_idx").on(t.status, t.startsAt),
    index("activities_creator_id_idx").on(t.creatorId),
    check("activities_sport_type_check", sql`${t.sportType} in ${sqlList(SPORT_TYPE_VALUES)}`),
    check(
      "activities_required_level_check",
      sql`${t.requiredLevel} is null or ${t.requiredLevel} in ${sqlList(SPORT_LEVEL_VALUES)}`,
    ),
    check("activities_status_check", sql`${t.status} in ${sqlList(ACTIVITY_STATUS_VALUES)}`),
    check("activities_lat_range", sql`${t.lat} between -90 and 90`),
    check("activities_lng_range", sql`${t.lng} between -180 and 180`),
    check("activities_duration_range", sql`${t.durationMinutes} between 15 and 720`),
    check("activities_spots_total_range", sql`${t.spotsTotal} between 1 and 50`),
    check("activities_spots_available_range", sql`${t.spotsAvailable} between 0 and ${t.spotsTotal}`),
    // Cohérence places / statut : une activité non annulée est 'full' si et seulement si elle n'a plus de place.
    check(
      "activities_status_matches_spots",
      sql`${t.status} = 'cancelled' or (${t.status} = 'full') = (${t.spotsAvailable} = 0)`,
    ),
    check("activities_description_length", sql`${t.description} is null or length(${t.description}) <= 500`),
  ],
);

// -----------------------------------------------------------------------------
// Candidatures
// -----------------------------------------------------------------------------

export const applications = sqliteTable(
  "applications",
  {
    id: id(),
    activityId: text("activity_id")
      .notNull()
      .references(() => activities.id, { onDelete: "cascade" }),
    applicantId: text("applicant_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    status: text("status", { enum: APPLICATION_STATUS_VALUES }).notNull().default("pending"),
    /** Mot facultatif du candidat au créateur. */
    message: text("message"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    // Une seule candidature par personne et par activité.
    uniqueIndex("applications_activity_applicant_unique").on(t.activityId, t.applicantId),
    index("applications_applicant_id_idx").on(t.applicantId),
    check("applications_status_check", sql`${t.status} in ${sqlList(APPLICATION_STATUS_VALUES)}`),
    check("applications_message_length", sql`${t.message} is null or length(${t.message}) <= 300`),
  ],
);

// -----------------------------------------------------------------------------
// Avis : l'organisateur note chaque participant après la séance (1 à 5 étoiles + commentaire)
// -----------------------------------------------------------------------------

export const reviews = sqliteTable(
  "reviews",
  {
    id: id(),
    activityId: text("activity_id")
      .notNull()
      .references(() => activities.id, { onDelete: "cascade" }),
    /** Auteur de l'avis (l'organisateur). */
    reviewerId: text("reviewer_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    /** Membre noté (un participant accepté). */
    revieweeId: text("reviewee_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    rating: integer("rating").notNull(),
    comment: text("comment"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    // Un seul avis par participant et par séance.
    uniqueIndex("reviews_activity_reviewee_unique").on(t.activityId, t.revieweeId),
    index("reviews_reviewee_id_idx").on(t.revieweeId),
    check("reviews_rating_range", sql`${t.rating} between 1 and 5`),
    check("reviews_comment_length", sql`${t.comment} is null or length(${t.comment}) <= 500`),
    check("reviews_not_self", sql`${t.reviewerId} <> ${t.revieweeId}`),
  ],
);

// -----------------------------------------------------------------------------
// Messages (une conversation = une candidature acceptée, entre créateur et candidat)
// -----------------------------------------------------------------------------

export const messages = sqliteTable(
  "messages",
  {
    id: id(),
    applicationId: text("application_id")
      .notNull()
      .references(() => applications.id, { onDelete: "cascade" }),
    senderId: text("sender_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    content: text("content").notNull(),
    kind: text("kind", { enum: MESSAGE_KIND_VALUES }).notNull().default("text"),
    /** null = pas encore lu par le destinataire. */
    readAt: integer("read_at", { mode: "timestamp_ms" }),
    createdAt: createdAt(),
  },
  (t) => [
    index("messages_application_id_created_at_idx").on(t.applicationId, t.createdAt),
    check("messages_content_length", sql`length(trim(${t.content})) between 1 and 2000`),
  ],
);

// -----------------------------------------------------------------------------
// Relations (pour les requêtes imbriquées : db.query.activities.findMany({ with: … }))
// -----------------------------------------------------------------------------

export const usersRelations = relations(users, ({ many }) => ({
  activities: many(activities),
  applications: many(applications),
  sessions: many(sessions),
  reviewsReceived: many(reviews, { relationName: "reviewee" }),
  reviewsWritten: many(reviews, { relationName: "reviewer" }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  activity: one(activities, { fields: [reviews.activityId], references: [activities.id] }),
  reviewer: one(users, { fields: [reviews.reviewerId], references: [users.id], relationName: "reviewer" }),
  reviewee: one(users, { fields: [reviews.revieweeId], references: [users.id], relationName: "reviewee" }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const activitiesRelations = relations(activities, ({ one, many }) => ({
  creator: one(users, { fields: [activities.creatorId], references: [users.id] }),
  applications: many(applications),
  reviews: many(reviews),
}));

export const applicationsRelations = relations(applications, ({ one, many }) => ({
  activity: one(activities, { fields: [applications.activityId], references: [activities.id] }),
  applicant: one(users, { fields: [applications.applicantId], references: [users.id] }),
  messages: many(messages),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  application: one(applications, { fields: [messages.applicationId], references: [applications.id] }),
  sender: one(users, { fields: [messages.senderId], references: [users.id] }),
}));

// -----------------------------------------------------------------------------
// Types dérivés
// -----------------------------------------------------------------------------

export type User = typeof users.$inferSelect;
/** Utilisateur sans données sensibles, sûr à transmettre aux composants. */
export type PublicUser = Omit<User, "passwordHash">;
export type Activity = typeof activities.$inferSelect;
export type Application = typeof applications.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type Review = typeof reviews.$inferSelect;

export type SportLevel = (typeof SPORT_LEVEL_VALUES)[number];
export type SportType = (typeof SPORT_TYPE_VALUES)[number];
