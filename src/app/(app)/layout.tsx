import { BottomNav } from "@/components/layout/bottom-nav";

// TODO (étape 6) : remplacer par le compteur temps réel des messages non lus.
const DEMO_UNREAD_MESSAGES = 2;

/**
 * Coquille de l'application connectée : zone de contenu + Bottom Navigation Bar.
 * Sur grand écran, l'app reste centrée dans une colonne de la largeur d'un mobile.
 */
export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="mx-auto flex h-dvh max-w-lg flex-col bg-background sm:border-x">
      {/* min-h-0 : permet au contenu de défiler sans pousser la barre hors de l'écran */}
      <main className="relative flex min-h-0 flex-1 flex-col overflow-y-auto">{children}</main>
      <BottomNav badges={{ messages: DEMO_UNREAD_MESSAGES }} />
    </div>
  );
}
