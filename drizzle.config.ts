import { defineConfig } from "drizzle-kit";

/** Configuration de drizzle-kit (génération et application des migrations SQL). */
export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  // Le dialecte "turso" (libSQL) accepte aussi bien un fichier local (file:…) qu'une base distante.
  dialect: "turso",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "file:local.db",
    authToken: process.env.DATABASE_AUTH_TOKEN,
  },
});
