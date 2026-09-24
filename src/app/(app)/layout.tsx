import { BottomNav } from "@/components/layout/bottom-nav";
import { SiteHeader } from "@/components/layout/site-header";
import type { NavBadges } from "@/config/navigation";
import { requireUser } from "@/lib/auth/session";

// TODO (étape 6) : remplacer par le compteur temps réel des messages non lus.
const DEMO_BADGES: NavBadges = { messages: 2 };

/**
 * Coquille du site : navigation en haut sur desktop (≥ md), barre en bas sur mobile.
 * Le contenu occupe toute la hauteur restante ; chaque page gère sa propre largeur.
 */
export default async function AppLayout({ children }: LayoutProps<"/">) {
  // Garde d'accès : toutes les pages de l'app exigent une session valide.
  await requireUser();

  return (
    <div className="flex h-dvh flex-col bg-background">
      <SiteHeader badges={DEMO_BADGES} className="hidden md:block" />
      {/* min-h-0 : permet au contenu de défiler sans pousser la barre hors de l'écran */}
      <main className="relative flex min-h-0 flex-1 flex-col overflow-y-auto">{children}</main>
      <BottomNav badges={DEMO_BADGES} className="md:hidden" />
    </div>
  );
}
