import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";
import { getSafeRedirectPath } from "@/lib/auth/redirect";
import { requireUser } from "@/lib/auth/session";
import { getFirstName } from "@/lib/format";

export const metadata: Metadata = { title: "Bienvenue" };

/** Parcours d'accueil d'un nouveau membre : sports favoris, niveau, ville. */
export default async function WelcomePage({ searchParams }: PageProps<"/welcome">) {
  const user = await requireUser();
  const next = getSafeRedirectPath((await searchParams).next);
  if (user.onboardedAt) redirect(next);

  return (
    <OnboardingWizard
      firstName={getFirstName(user)}
      redirectTo={next}
      initial={{ favoriteSports: user.favoriteSports, sportLevel: user.sportLevel }}
    />
  );
}
