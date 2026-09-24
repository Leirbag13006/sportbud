import { MapView } from "@/components/map/map-view";
import { getMapActivities } from "@/lib/activities/queries";
import { getMyApplicationSummaries, getReceivedApplications } from "@/lib/applications/queries";
import { requireUser } from "@/lib/auth/session";

/** Écran principal : la carte interactive des activités. */
export default async function MapPage({ searchParams }: PageProps<"/">) {
  const user = await requireUser();
  const [activities, myApplications, receivedApplications, { activity }] = await Promise.all([
    getMapActivities(),
    getMyApplicationSummaries(user.id),
    getReceivedApplications(user.id),
    searchParams,
  ]);

  return (
    <MapView
      activities={activities}
      currentUserId={user.id}
      myApplications={myApplications}
      receivedApplications={receivedApplications}
      initialSelectedId={typeof activity === "string" ? activity : undefined}
    />
  );
}
