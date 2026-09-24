import { BottomNav } from "@/components/layout/bottom-nav";
import { SiteHeader } from "@/components/layout/site-header";
import type { NavBadges } from "@/config/navigation";
import { countPendingReceivedApplications } from "@/lib/applications/queries";
import { requireUser } from "@/lib/auth/session";

/**
 * Coquille du site : navigation en haut sur desktop (≥ md), barre en bas sur mobile.
 * Le contenu occupe toute la hauteur restante ; chaque page gère sa propre largeur.
 */
export default async function AppLayout({ children }: LayoutProps<"/">) {
  // Garde d'accès : toutes les pages de l'app exigent une session valide.
  const user = await requireUser();

  const badges: NavBadges = {
    // TODO (étape 6) : nombre de messages non lus.
    messages: 0,
    // Candidatures reçues en attente de réponse, à traiter depuis le profil.
    profile: await countPendingReceivedApplications(user.id),
  };

  return (
    <div className="flex h-dvh flex-col bg-background">
      <SiteHeader badges={badges} className="hidden md:block" />
      {/* min-h-0 : permet au contenu de défiler sans pousser la barre hors de l'écran */}
      <main className="relative flex min-h-0 flex-1 flex-col overflow-y-auto">{children}</main>
      <BottomNav badges={badges} className="md:hidden" />
    </div>
  );
}
