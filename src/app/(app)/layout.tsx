import { redirect } from "next/navigation";

import { AppNavigation } from "@/components/layout/app-navigation";
import { requireUser } from "@/lib/auth/session";
import { getNotifications } from "@/lib/messages/queries";

/**
 * Coquille du site : navigation en haut sur desktop (≥ md), barre en bas sur mobile,
 * avec badges de notifications rafraîchis en continu.
 */
export default async function AppLayout({ children }: LayoutProps<"/">) {
  // Garde d'accès : toutes les pages de l'app exigent une session valide.
  const user = await requireUser();
  // Nouveau membre : parcours d'accueil (sports, niveau, ville) avant d'entrer dans l'app.
  if (!user.onboardedAt) redirect("/welcome");

  return <AppNavigation initialNotifications={await getNotifications(user.id)}>{children}</AppNavigation>;
}
