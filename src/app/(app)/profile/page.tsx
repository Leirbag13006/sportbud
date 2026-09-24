import type { Metadata } from "next";
import { CalendarDays, LogOut, Mail } from "lucide-react";

import { logout } from "@/app/(auth)/actions";
import { ApplicationStatusBadge } from "@/components/applications/application-status-badge";
import { ReceivedApplicationRow } from "@/components/applications/received-application-row";
import { UserAvatar } from "@/components/applications/user-avatar";
import { PageHeader } from "@/components/layout/page-header";
import { ActivitySummaryLink } from "@/components/profile/activity-summary-link";
import { DashboardSection } from "@/components/profile/dashboard-section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getSportLevelLabel } from "@/config/sport-levels";
import { getSport } from "@/config/sports";
import { getMyOrganizedActivities } from "@/lib/activities/queries";
import { getReceivedApplications, getSentApplications } from "@/lib/applications/queries";
import { requireUser } from "@/lib/auth/session";
import { formatDay, formatTime, pluralize } from "@/lib/format";

export const metadata: Metadata = { title: "Profil" };

const memberSince = new Intl.DateTimeFormat("fr-FR", { month: "long", year: "numeric" });

/** Profil de l'utilisateur connecté et tableau de bord de ses activités et candidatures. */
export default async function ProfilePage() {
  const user = await requireUser();
  const [organized, received, sent] = await Promise.all([
    getMyOrganizedActivities(user.id),
    getReceivedApplications(user.id),
    getSentApplications(user.id),
  ]);

  const pendingReceived = received.filter((application) => application.status === "pending");

  return (
    <>
      <PageHeader title="Profil" description="Ton profil, tes activités et tes candidatures." />

      <div className="mx-auto w-full max-w-3xl space-y-8 px-4 py-6 md:px-6">
        {/* Identité */}
        <Card>
          <CardContent className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
            <UserAvatar user={user} className="size-20 text-xl" />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex flex-col items-center gap-2 sm:flex-row">
                <p className="truncate text-xl font-semibold">{user.fullName}</p>
                <Badge variant="secondary">{getSportLevelLabel(user.sportLevel)}</Badge>
              </div>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li className="flex items-center justify-center gap-2 sm:justify-start">
                  <Mail className="size-4" aria-hidden />
                  {user.email}
                </li>
                <li className="flex items-center justify-center gap-2 sm:justify-start">
                  <CalendarDays className="size-4" aria-hidden />
                  Membre depuis {memberSince.format(user.createdAt)}
                </li>
              </ul>
              <p className="text-sm">
                {user.bio || (
                  <span className="text-muted-foreground">
                    Pas encore de bio. Présente-toi pour rassurer tes futurs partenaires !
                  </span>
                )}
              </p>
            </div>
          </CardContent>
        </Card>

        <DashboardSection
          id="pending-applications"
          title="Candidatures à traiter"
          count={pendingReceived.length}
          isEmpty={pendingReceived.length === 0}
          emptyMessage="Aucune candidature en attente sur tes activités."
        >
          <ul className="space-y-2">
            {pendingReceived.map((application) => {
              const sport = getSport(application.activity.sportType);
              return (
                <ReceivedApplicationRow
                  key={application.id}
                  application={application}
                  isFull={application.activity.status !== "open"}
                  context={`${sport.emoji} ${sport.label}, ${formatDay(application.activity.startsAt).toLowerCase()} ${formatTime(application.activity.startsAt)}`}
                />
              );
            })}
          </ul>
        </DashboardSection>

        <DashboardSection
          id="organized-activities"
          title="Mes activités"
          count={organized.length}
          isEmpty={organized.length === 0}
          emptyMessage="Tu n'organises aucune activité à venir. Crée-en une depuis la carte !"
        >
          <ul className="space-y-2">
            {organized.map((activity) => {
              const applications = received.filter((application) => application.activityId === activity.id);
              const pending = applications.filter((application) => application.status === "pending").length;
              const accepted = applications.filter((application) => application.status === "accepted").length;
              return (
                <li key={activity.id}>
                  <ActivitySummaryLink
                    activity={activity}
                    details={`${pluralize(accepted, "participant")} sur ${activity.spotsTotal}${pending ? ` · ${pending} en attente` : ""}`}
                    aside={
                      activity.status === "full" ? (
                        <Badge variant="secondary">Complet</Badge>
                      ) : (
                        <Badge variant="outline">{pluralize(activity.spotsAvailable, "place")}</Badge>
                      )
                    }
                  />
                </li>
              );
            })}
          </ul>
        </DashboardSection>

        <DashboardSection
          id="sent-applications"
          title="Mes candidatures"
          count={sent.length}
          isEmpty={sent.length === 0}
          emptyMessage="Tu n'as postulé à aucune activité. Explore la carte pour trouver des partenaires !"
        >
          <ul className="space-y-2">
            {sent.map((application) => (
              <li key={application.id}>
                <ActivitySummaryLink
                  activity={application.activity}
                  details={`Organisée par ${application.activity.creator.fullName}`}
                  aside={<ApplicationStatusBadge status={application.status} />}
                />
              </li>
            ))}
          </ul>
        </DashboardSection>

        <form action={logout}>
          <Button type="submit" variant="outline" className="h-10 w-full sm:w-auto">
            <LogOut aria-hidden />
            Se déconnecter
          </Button>
        </form>
      </div>
    </>
  );
}
