import { MapView } from "@/components/map/map-view";
import { getMapActivities } from "@/lib/activities/queries";
import { requireUser } from "@/lib/auth/session";

/** Écran principal : la carte interactive des activités. */
export default async function MapPage() {
  const [user, activities] = await Promise.all([requireUser(), getMapActivities()]);

  return <MapView activities={activities} currentUserId={user.id} />;
}
