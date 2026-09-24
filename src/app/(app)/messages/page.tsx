import type { Metadata } from "next";
import { MessagesSquare } from "lucide-react";

import { EmptyState } from "@/components/layout/empty-state";

export const metadata: Metadata = { title: "Messages" };

/** Aucune conversation ouverte : visible sur desktop, à droite de la liste. */
export default function MessagesPage() {
  return (
    <EmptyState
      icon={MessagesSquare}
      title="Tes conversations"
      description="Sélectionne une conversation pour discuter avec ton partenaire et organiser votre séance."
    />
  );
}
