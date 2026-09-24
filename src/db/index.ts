import "server-only";

import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";

import * as schema from "./schema";

/**
 * Connexion à la base.
 * - En local : fichier SQLite (par défaut `file:local.db` à la racine du projet).
 * - En ligne : base Turso, en renseignant DATABASE_URL (libsql://…) et DATABASE_AUTH_TOKEN.
 */
function createDb() {
  const client = createClient({
    url: process.env.DATABASE_URL ?? "file:local.db",
    authToken: process.env.DATABASE_AUTH_TOKEN,
  });
  return drizzle({ client, schema });
}

// En développement, le rechargement à chaud réexécute ce module :
// on réutilise la connexion existante pour ne pas en ouvrir une nouvelle à chaque modification.
const globalForDb = globalThis as unknown as { db?: ReturnType<typeof createDb> };

export const db = globalForDb.db ?? createDb();
if (process.env.NODE_ENV !== "production") globalForDb.db = db;
