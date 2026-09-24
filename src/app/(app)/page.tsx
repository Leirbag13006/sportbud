import { ExploreView } from "@/components/explore/explore-view";
import { getExploreActivities } from "@/lib/activities/queries";
import { getMyApplicationSummaries, getReceivedApplications } from "@/lib/applications/queries";
import { requireUser } from "@/lib/auth/session";

/** Écran d'accueil : liste (par défaut) ou carte des activités disponibles. */
export default async function ExplorePage({ searchParams }: PageProps<"/">) {
  const user = await requireUser();
  const [activities, myApplications, receivedApplications, { activity, view, create }] = await Promise.all([
    getExploreActivities(user.id),
    getMyApplicationSummaries(user.id),
    getReceivedApplications(user.id),
    searchParams,
  ]);
  const activityId = typeof activity === "string" ? activity : undefined;

  return (
    <ExploreView
      activities={activities}
      currentUser={{ id: user.id, fullName: user.fullName, avatarUrl: user.avatarUrl }}
      preferences={{
        favoriteSports: user.favoriteSports,
        sportLevel: user.sportLevel,
        home:
          user.homeLat !== null && user.homeLng !== null
            ? { city: user.city, position: [user.homeLat, user.homeLng] }
            : null,
      }}
      myApplications={myApplications}
      receivedApplications={receivedApplications}
      // Lien vers une activité précise (« Voir sur la carte ») : ouverture sur la carte.
      initialView={view === "map" || activityId ? "map" : "list"}
      initialSelectedId={activityId}
      createToken={typeof create === "string" ? create : undefined}
    />
  );
}
