import type { Metadata } from "next";
import { MessageCircle } from "lucide-react";

import { EmptyState } from "@/components/layout/empty-state";
import { PageHeader } from "@/components/layout/page-header";

export const metadata: Metadata = { title: "Messages" };

/** Liste des conversations actives (implémentée à l'étape 6). */
export default function MessagesPage() {
  return (
    <>
      <PageHeader title="Messages" />
      <EmptyState
        icon={MessageCircle}
        title="Aucune conversation"
        description="Quand une candidature est acceptée, une discussion s'ouvre ici avec ton partenaire."
      />
    </>
  );
}
