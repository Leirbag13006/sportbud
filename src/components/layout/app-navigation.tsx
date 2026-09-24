"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import useSWR from "swr";

import { fetcher, POLL_INTERVALS } from "@/lib/fetcher";
import type { NotificationsDTO } from "@/lib/messages/types";
import { BottomNav } from "./bottom-nav";
import { SiteHeader } from "./site-header";

export const NOTIFICATIONS_KEY = "/api/notifications";

interface AppNavigationProps {
  /** Valeurs calculées au rendu serveur, affichées avant le premier rafraîchissement. */
  initialNotifications: NotificationsDTO;
  children: React.ReactNode;
}

/**
 * Coquille de navigation avec badges en direct : les compteurs sont rafraîchis toutes les 5 s.
 * Un nouveau message ou une nouvelle candidature déclenche un toast et rafraîchit les pages serveur
 * (carte, profil) pour refléter les changements faits par les autres membres.
 */
export function AppNavigation({ initialNotifications, children }: AppNavigationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { data = initialNotifications } = useSWR<NotificationsDTO>(NOTIFICATIONS_KEY, fetcher, {
    fallbackData: initialNotifications,
    refreshInterval: POLL_INTERVALS.background,
  });

  const previous = useRef(initialNotifications);

  useEffect(() => {
    const before = previous.current;
    previous.current = data;

    const latest = data.latestUnread;
    const isNewMessage = latest && latest.id !== before.latestUnread?.id;
    const isReadingIt = latest && pathname === `/messages/${latest.conversationId}`;
    if (isNewMessage && !isReadingIt) {
      toast(`💬 ${latest.senderName}`, {
        description: latest.preview,
        action: { label: "Voir", onClick: () => router.push(`/messages/${latest.conversationId}`) },
      });
    }

    if (data.pendingApplications > before.pendingApplications) {
      toast("🙋 Nouvelle candidature", {
        description: "Un membre souhaite rejoindre une de tes activités.",
        action: { label: "Voir", onClick: () => router.push("/activities") },
      });
    }

    // Un changement venant d'un autre membre (message, candidature, acceptation) : on rafraîchit
    // les données serveur de la page courante (l'état local des composants est conservé).
    if (isNewMessage || data.pendingApplications !== before.pendingApplications) {
      router.refresh();
    }
  }, [data, pathname, router]);

  const badges = { messages: data.unreadMessages, activities: data.pendingApplications };

  return (
    <div className="flex h-dvh flex-col bg-background">
      <SiteHeader badges={badges} className="hidden md:block" />
      {/* min-h-0 : permet au contenu de défiler sans pousser la barre hors de l'écran */}
      <main className="relative flex min-h-0 flex-1 flex-col overflow-y-auto">{children}</main>
      <BottomNav badges={badges} className="md:hidden" />
    </div>
  );
}
