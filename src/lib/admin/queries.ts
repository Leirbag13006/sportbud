import "server-only";

import { count, desc, inArray, isNotNull, isNull } from "drizzle-orm";

import { db } from "@/db";
import { reports } from "@/db/schema";

const userColumns = { id: true, username: true, avatarUrl: true } as const;

/** Signalements à traiter (open) ou déjà traités (done), les plus récents d'abord. */
export async function getReports(tab: "open" | "done") {
  const rows = await db.query.reports.findMany({
    columns: { id: true, reason: true, details: true, resolution: true, resolvedAt: true, createdAt: true },
    with: {
      reporter: { columns: userColumns },
      reported: { columns: { ...userColumns, email: true, createdAt: true, suspendedAt: true } },
    },
    where: tab === "open" ? isNull(reports.resolvedAt) : isNotNull(reports.resolvedAt),
    orderBy: [desc(tab === "open" ? reports.createdAt : reports.resolvedAt)],
    limit: 200,
  });

  // Nombre total de signalements reçus par chaque membre signalé (récidive).
  const reportedIds = [...new Set(rows.map((row) => row.reported.id))];
  const totals =
    reportedIds.length === 0
      ? []
      : await db
          .select({ reportedId: reports.reportedId, value: count() })
          .from(reports)
          .where(inArray(reports.reportedId, reportedIds))
          .groupBy(reports.reportedId);
  const totalByUser = new Map(totals.map((row) => [row.reportedId, row.value]));

  return rows.map((row) => ({ ...row, reportsAgainstUser: totalByUser.get(row.reported.id) ?? 1 }));
}

export type AdminReport = Awaited<ReturnType<typeof getReports>>[number];

/** Nombre de signalements à traiter (onglet et lien du profil). */
export async function countOpenReports() {
  const [row] = await db.select({ value: count() }).from(reports).where(isNull(reports.resolvedAt));
  return row?.value ?? 0;
}
