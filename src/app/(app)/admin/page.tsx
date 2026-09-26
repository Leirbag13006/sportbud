import { ShieldCheck } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { ReportActions } from "@/components/admin/report-actions";
import { UserAvatar } from "@/components/applications/user-avatar";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { requireAdmin } from "@/lib/admin/auth";
import { countOpenReports, getReports } from "@/lib/admin/queries";
import { formatDay, formatFullDay, formatTime, pluralize } from "@/lib/format";
import { REPORT_REASONS } from "@/lib/safety/types";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Modération", robots: { index: false } };

const reasonLabel = new Map(REPORT_REASONS.map(({ value, label }) => [value, label]));

function formatDate(date: Date) {
  return `${formatDay(date)} à ${formatTime(date)}`;
}

/** Écran de modération (réservé aux adresses ADMIN_EMAILS) : traiter les signalements des membres. */
export default async function AdminPage({ searchParams }: PageProps<"/admin">) {
  await requireAdmin();
  const tab = (await searchParams).tab === "done" ? "done" : "open";
  const [reports, openCount] = await Promise.all([getReports(tab), countOpenReports()]);

  const tabs = [
    { value: "open", label: `À traiter (${openCount})`, href: "/admin" },
    { value: "done", label: "Traités", href: "/admin?tab=done" },
  ];

  return (
    <div className="flex-1 bg-sand-50">
      <PageHeader title="Les" accent="signalements." description="Signalements envoyés par les membres depuis un profil ou une conversation." />

      <div className="mx-auto w-full max-w-3xl space-y-6 px-4 py-6 md:px-6 md:py-10">
        <nav aria-label="Filtrer les signalements" className="grid grid-cols-2 rounded-lg bg-sand-100 p-1">
          {tabs.map(({ value, label, href }) => (
            <Link
              key={value}
              href={href}
              aria-current={tab === value ? "page" : undefined}
              className={cn(
                "flex h-10 items-center justify-center rounded-md font-display text-sm font-bold outline-none focus-visible:ring-3 focus-visible:ring-ring",
                tab === value ? "bg-card text-ink shadow-md" : "text-gray-600 hover:text-ink",
              )}
            >
              {label}
            </Link>
          ))}
        </nav>

        {reports.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <span className="flex size-14 items-center justify-center rounded-full bg-brand-soft text-brand-text">
              <ShieldCheck className="size-7" aria-hidden />
            </span>
            <p className="font-display font-bold text-ink">
              {tab === "open" ? "Aucun signalement à traiter." : "Aucun signalement traité pour l'instant."}
            </p>
          </div>
        ) : (
          <ul className="space-y-4">
            {reports.map((report) => (
              <li key={report.id} className="space-y-4 rounded-card bg-card p-5 shadow-md">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <UserAvatar user={report.reported} className="size-12" />
                    <div className="min-w-0">
                      <p className="truncate font-display text-lg font-extrabold text-ink">{report.reported.username}</p>
                      <p className="truncate text-xs text-gray-400">
                        {report.reported.email} · inscrit {formatFullDay(report.reported.createdAt).toLowerCase()}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {report.reported.suspendedAt && <Badge variant="destructive">Suspendu</Badge>}
                    {report.reportsAgainstUser > 1 && (
                      <Badge variant="secondary">{pluralize(report.reportsAgainstUser, "signalement")} au total</Badge>
                    )}
                  </div>
                </div>

                <div className="rounded-lg bg-muted/60 p-3 text-sm">
                  <p className="font-display font-bold text-ink">{reasonLabel.get(report.reason) ?? report.reason}</p>
                  {report.details && <p className="mt-1 whitespace-pre-line">{report.details}</p>}
                  <p className="mt-2 text-xs text-gray-400">
                    Signalé par {report.reporter.username}, {formatDate(report.createdAt).toLowerCase()}
                  </p>
                </div>

                {report.resolvedAt && (
                  <p className="text-sm text-gray-600">
                    {report.resolution === "suspended" ? "Membre suspendu" : "Classé sans suite"},{" "}
                    {formatDate(report.resolvedAt).toLowerCase()}.
                  </p>
                )}

                <ReportActions
                  reportId={report.id}
                  resolved={report.resolvedAt !== null}
                  user={{ id: report.reported.id, username: report.reported.username, suspended: report.reported.suspendedAt !== null }}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
