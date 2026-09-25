/**
 * Supprime les comptes démo (@demo.sportmates.local) et tout ce qui s'y rattache : leurs séances,
 * candidatures, messages, avis, signalements, blocages, succès et sessions. Les vrais comptes restent.
 * Sans --confirm, affiche seulement ce qui serait supprimé.
 *
 * En local : npx tsx scripts/remove-demo-data.ts [--confirm]
 * En ligne : DATABASE_URL=libsql://… DATABASE_AUTH_TOKEN=… npx tsx scripts/remove-demo-data.ts [--confirm]
 */
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";

import * as schema from "../src/db/schema";
import { DEMO_EMAIL_DOMAIN, removeDemoData } from "./lib/demo-data";

const url = process.env.DATABASE_URL ?? "file:local.db";
const client = createClient({ url, authToken: process.env.DATABASE_AUTH_TOKEN });
const db = drizzle({ client, schema });

async function main() {
  const like = `%${DEMO_EMAIL_DOMAIN}`;
  const count = async (sql: string) => Number((await client.execute({ sql, args: [like] })).rows[0]!.n);
  const demoUsers = await count("select count(*) as n from users where email like ?");
  const demoActivities = await count("select count(*) as n from activities a join users u on u.id = a.creator_id where u.email like ?");
  const realUsers = await count("select count(*) as n from users where email not like ?");

  console.log(`Base : ${url.startsWith("file:") ? url : url.replace(/^(libsql:\/\/[^.]+).*/, "$1…")}`);
  console.log(`À supprimer : ${demoUsers} comptes démo et leurs ${demoActivities} séances (avec candidatures, messages, avis…).`);
  console.log(`Conservés : ${realUsers} vrais comptes.`);
  if (!process.argv.includes("--confirm")) {
    console.log("\nRien n'a été supprimé. Relance avec --confirm pour supprimer.");
    return;
  }
  const removed = await db.transaction((tx) => removeDemoData(tx));
  console.log(`\n${removed} comptes démo supprimés.`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
