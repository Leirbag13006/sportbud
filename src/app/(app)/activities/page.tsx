import type { Metadata } from "next";

import { ApplicationStatusBadge } from "@/components/applications/application-status-badge";
import { ReceivedApplicationRow } from "@/components/applications/received-application-row";
import { PageHeader } from "@/components/layout/page-header";
import { ActivitySummaryLink } from "@/components/profile/activity-summary-link";
import { DashboardSection } from "@/components/profile/dashboard-section";
import { Badge } from "@/components/ui/badge";
import { getSport } from "@/config/sports";
import { getMyOrganizedActivities } from "@/lib/activities/queries";
import { getReceivedApplications, getSentApplications } from "@/lib/applications/queries";
import { getActivitiesToReview } from "@/lib/reviews/queries";
import { ReviewForm } from "@/components/reviews/review-form";
import { requireUser } from "@/lib/auth/session";
import { formatDay, formatTime, pluralize } from "@/lib/format";

export const metadata: Metadata = { title: "Mes activités" };

/** Tableau de bord : candidatures à traiter, activités organisées, candidatures envoyées. */
export default async function ActivitiesPage() {
  const user = await requireUser();
  const [organized, received, sent, toReview] = await Promise.all([
    getMyOrganizedActivities(user.id),
    getReceivedApplications(user.id),
    getSentApplications(user.id),
    getActivitiesToReview(user.id),
  ]);
  const reviewsLeft = toReview.reduce(
    (total, activity) => total + activity.participants.filter((participant) => !participant.review).length,
    0,
  );

  const pendingReceived = received.filter((application) => application.status === "pending");

  return (
    <>
      <PageHeader
        title="Mes"
        accent="activités."
        description="Tes séances, tes partenaires et les candidatures à traiter."
        image="/images/team-huddle.jpg"
      />

      <div className="mx-auto w-full max-w-3xl space-y-10 px-4 py-8 md:px-6">
        {toReview.length > 0 && (
          <DashboardSection
            id="to-review"
            title="Séances terminées : note tes partenaires"
            count={reviewsLeft}
            isEmpty={false}
            emptyMessage=""
          >
            <p className="-mt-1 text-sm">
              Ton avis aide toute la communauté à choisir ses partenaires. Il reste visible sur leur profil.
            </p>
            <ul className="space-y-6">
              {toReview.map((activity) => {
                const sport = getSport(activity.sportType);
                return (
                  <li key={activity.id} className="space-y-2">
                    <p className="font-display text-sm font-bold text-ink">
                      {sport.label} · {formatDay(activity.startsAt)} à {formatTime(activity.startsAt)}
                    </p>
                    <div className="space-y-2">
                      {activity.participants.map((participant) => (
                        <ReviewForm key={participant.user.id} activityId={activity.id} participant={participant} />
                      ))}
                    </div>
                  </li>
                );
              })}
            </ul>
          </DashboardSection>
        )}

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
                  context={`${sport.label}, ${formatDay(application.activity.startsAt).toLowerCase()} ${formatTime(application.activity.startsAt)}`}
                />
              );
            })}
          </ul>
        </DashboardSection>

        <DashboardSection
          id="organized-activities"
          title="J'organise"
          count={organized.length}
          isEmpty={organized.length === 0}
          emptyMessage="Tu n'organises aucune activité à venir. Lance-toi avec le bouton + !"
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
          title="Je participe"
          count={sent.length}
          isEmpty={sent.length === 0}
          emptyMessage="Tu n'as postulé à aucune activité. Explore les séances près de chez toi !"
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
      </div>
    </>
  );
}
