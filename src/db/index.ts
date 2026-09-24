import "server-only";

import { createClient, type Client } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";

import * as schema from "./schema";

/**
 * Connexion à la base.
 * - En local : fichier SQLite (par défaut `file:local.db` à la racine du projet).
 * - En ligne : base Turso, en renseignant DATABASE_URL (libsql://…) et DATABASE_AUTH_TOKEN.
 */
function createDbClient() {
  return createClient({
    url: process.env.DATABASE_URL ?? "file:local.db",
    authToken: process.env.DATABASE_AUTH_TOKEN,
  });
}

// En développement, le rechargement à chaud réexécute ce module : on réutilise la connexion
// existante. L'instance Drizzle, elle, est recréée pour toujours refléter le schéma à jour.
const globalForDb = globalThis as unknown as { dbClient?: Client };

const client = globalForDb.dbClient ?? createDbClient();
if (process.env.NODE_ENV !== "production") globalForDb.dbClient = client;

export const db = drizzle({ client, schema });
