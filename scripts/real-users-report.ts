/**
 * Rapport en lecture seule : les vrais comptes (hors comptes démo) et ce qu'ils ont fait dans l'app.
 * Ne modifie rien.
 *
 * En local : npx tsx scripts/real-users-report.ts
 * En ligne : DATABASE_URL=libsql://… DATABASE_AUTH_TOKEN=… npx tsx scripts/real-users-report.ts
 */
import { createClient } from "@libsql/client";

import { DEMO_EMAIL_DOMAIN } from "./lib/demo-data";

const client = createClient({ url: process.env.DATABASE_URL ?? "file:local.db", authToken: process.env.DATABASE_AUTH_TOKEN });

const day = (ms: unknown) => (typeof ms === "number" ? new Date(ms).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" }) : "—");

async function main() {
  const { rows } = await client.execute({
    sql: `
      select u.username, u.created_at, u.onboarded_at,
        (select count(*) from activities a where a.creator_id = u.id) as seances_creees,
        (select count(*) from applications ap where ap.applicant_id = u.id) as candidatures,
        (select count(*) from messages m where m.sender_id = u.id and m.kind = 'text') as messages,
        (select count(*) from reviews r where r.reviewer_id = u.id) as avis_donnes,
        (select count(*) from reviews r where r.reviewee_id = u.id) as avis_recus,
        (select max(s.created_at) from sessions s where s.user_id = u.id) as derniere_connexion
      from users u
      where u.email not like ?
      order by u.created_at`,
    args: [`%${DEMO_EMAIL_DOMAIN}`],
  });
  const demo = await client.execute({ sql: "select count(*) as n from users where email like ?", args: [`%${DEMO_EMAIL_DOMAIN}`] });

  console.log(`${rows.length} vrais comptes · ${demo.rows[0]!.n} comptes démo\n`);
  console.table(
    rows.map((r) => ({
      pseudo: r.username,
      inscrit: day(r.created_at),
      "accueil fini": r.onboarded_at ? "oui" : "non",
      "séances créées": r.seances_creees,
      candidatures: r.candidatures,
      messages: r.messages,
      "avis donnés": r.avis_donnes,
      "avis reçus": r.avis_recus,
      "dernière connexion": day(r.derniere_connexion),
    })),
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
