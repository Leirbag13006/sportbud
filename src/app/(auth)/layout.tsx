import { Check, MapPin } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";

import { SportIcon } from "@/components/brand/sport-icon";
import { AuthCard } from "@/components/landing/auth-card";
import { LandingHeader } from "@/components/landing/landing-header";
import {
  CommunitySection,
  ConceptSection,
  HowItWorksSection,
  LandingFooter,
  SportsSection,
} from "@/components/landing/landing-sections";
import type { SportType } from "@/db/schema";

export const metadata: Metadata = {
  openGraph: {
    title: "SportLink · Le sport nous rapproche, partout.",
    description: "Trouve des partenaires sportifs près de chez toi, partage tes passions et vis de nouvelles expériences.",
    images: [{ url: "/images/hero-friends-sunset.jpg", width: 960, height: 540 }],
    locale: "fr_FR",
    type: "website",
  },
};

const HERO_SPORTS: SportType[] = ["basketball", "running", "football", "tennis", "fitness"];

/**
 * Landing publique de SportLink (pages /login et /register).
 * Le hero porte le formulaire (connexion ou inscription) ; les sections suivantes reprennent
 * le prototype du design system : concept, fonctionnement, sports, communauté.
 */
export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="min-h-dvh bg-night-950">
      <LandingHeader />

      <main>
        {/* HERO — photo « golden hour » fondue dans la nuit, formulaire à droite */}
        <section className="sl-dark relative overflow-hidden">
          <div
            aria-hidden
            className="absolute inset-0 lg:left-auto lg:w-[64%] lg:[mask-image:linear-gradient(to_right,transparent,black_40%)]"
          >
            <Image
              src="/images/hero-friends-sunset.jpg"
              alt=""
              fill
              priority
              sizes="(min-width: 1024px) 64vw, 100vw"
              className="object-cover object-[60%_center]"
            />
            {/* Voile : nuit → transparent côté texte (lisibilité), et fondu vers le bas */}
            <div className="absolute inset-0 bg-night-950/60 lg:bg-night-950/25" />
            <div className="absolute inset-0 bg-linear-to-t from-night-950 via-transparent to-night-950/40" />
          </div>
          {/* Swoosh lumineux en diagonale */}
          <div aria-hidden className="absolute top-[78%] -left-[10%] h-[3px] w-[70%] -rotate-6 bg-swoosh opacity-70" />

          <div className="relative mx-auto grid max-w-[1200px] items-center gap-10 px-[clamp(16px,4vw,40px)] pt-28 pb-16 lg:grid-cols-[1fr_430px] lg:gap-16 lg:pt-36 lg:pb-28">
            <div>
              <p className="sl-tagline text-xs text-white/80 md:text-sm">Bouge. Rencontre. Partage.</p>
              <h1 className="mt-4 font-display text-[clamp(2.5rem,5vw+1rem,4.5rem)] leading-[1.05] font-black tracking-tight">
                Le sport
                <br />
                nous rapproche,
                <br />
                <span className="text-mint-500">partout.</span>
              </h1>
              <p className="sl-bar mt-6 max-w-lg text-base md:text-lg">
                Trouve des partenaires sportifs près de chez toi, partage tes passions et vis de nouvelles
                expériences.
              </p>

              {/* Localisation + pastilles de sports (signature du prototype) */}
              <div className="mt-8 hidden sm:block">
                <p className="flex items-center gap-2 font-display text-lg font-bold text-white">
                  <MapPin className="size-5 text-mint-500" aria-hidden />
                  Aix-en-Provence, Marseille… et partout ailleurs
                </p>
                <ul className="mt-4 flex gap-3" aria-label="Quelques sports proposés">
                  {HERO_SPORTS.map((sport) => (
                    <li
                      key={sport}
                      className="flex size-12 items-center justify-center rounded-full border-2 border-mint-500 bg-night-950/55 text-white backdrop-blur-sm"
                    >
                      <SportIcon sport={sport} className="size-5" />
                    </li>
                  ))}
                  <li className="flex size-12 items-center justify-center rounded-full bg-white/10 font-display text-lg font-bold text-white">
                    …
                  </li>
                </ul>
              </div>

              <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white">
                {["Gratuit", "Tous niveaux", "Près de chez toi"].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <Check className="size-4 text-mint-500" strokeWidth={3} aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <AuthCard>{children}</AuthCard>
          </div>
        </section>

        <ConceptSection />
        <HowItWorksSection />
        <SportsSection />
        <CommunitySection />
      </main>

      <LandingFooter />
    </div>
  );
}
