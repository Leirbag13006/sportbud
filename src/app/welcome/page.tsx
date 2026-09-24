import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";
import { requireUser } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Bienvenue" };

/** Parcours d'accueil d'un nouveau membre : sports favoris, niveau, ville. */
export default async function WelcomePage() {
  const user = await requireUser();
  if (user.onboardedAt) redirect("/");

  return (
    <OnboardingWizard
      firstName={user.fullName.split(" ")[0]!}
      initial={{ favoriteSports: user.favoriteSports, sportLevel: user.sportLevel }}
    />
  );
}
