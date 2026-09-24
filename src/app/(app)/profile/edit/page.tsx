import type { Metadata } from "next";

import { PageHeader } from "@/components/layout/page-header";
import { ProfileForm } from "@/components/profile/profile-form";
import { requireUser } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Modifier mon profil" };

export default async function EditProfilePage() {
  const user = await requireUser();

  return (
    <>
      <PageHeader title="Modifier mon" accent="profil." description="Montre qui tu es : ça donne envie de jouer avec toi." />
      <div className="mx-auto w-full max-w-3xl px-4 py-8 md:px-6">
        <ProfileForm user={user} />
      </div>
    </>
  );
}
