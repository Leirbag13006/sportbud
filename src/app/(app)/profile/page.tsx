import type { Metadata } from "next";
import { User } from "lucide-react";

import { EmptyState } from "@/components/layout/empty-state";
import { PageHeader } from "@/components/layout/page-header";

export const metadata: Metadata = { title: "Profil" };

/** Profil de l'utilisateur connecté (branché sur Supabase Auth à l'étape 2). */
export default function ProfilePage() {
  return (
    <>
      <PageHeader title="Profil" />
      <EmptyState
        icon={User}
        title="Ton profil"
        description="Connecte-toi pour gérer ton profil, ton niveau et tes activités."
      />
    </>
  );
}
