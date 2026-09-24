import { Check, PartyPopper } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";

import { AuthCard } from "@/components/landing/auth-card";
import { LandingHeader } from "@/components/landing/landing-header";
import {
  FaqSection,
  FeaturesSection,
  FinalCtaSection,
  LandingFooter,
  ShowcaseSection,
  SportsSection,
  StepsSection,
  StorySection,
  TestimonialsSection,
} from "@/components/landing/landing-sections";
import { MobileCtaBar } from "@/components/landing/mobile-cta-bar";

export const metadata: Metadata = {
  description:
    "Trouve des partenaires de sport près de chez toi : rejoins une séance ou lance la tienne, tous niveaux. Inscription gratuite.",
  openGraph: {
    title: "SportMates · Trouve des partenaires de sport près de chez toi",
    description: "Foot, tennis, running, padel… Rejoins une séance ou lance la tienne. Tous niveaux, inscription gratuite.",
    images: [{ url: "/images/hero-friends-sunset.jpg", width: 960, height: 540 }],
    locale: "fr_FR",
    type: "website",
  },
};

const PROMISES = ["Inscription gratuite", "Tous niveaux", "Prêt en 1 minute"];

/**
 * Landing publique (pages /register et /login), pensée pour convertir :
 * promesse claire + formulaire dans le hero, aperçu réel du produit, étapes, fonctionnalités,
 * sports, histoire de marque, FAQ et appel final.
 */
export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="min-h-dvh bg-night-950">
      <LandingHeader />

      <main>
        {/* HERO */}
        <section className="sl-dark relative overflow-hidden">
          <div
            aria-hidden
            className="absolute inset-0 lg:left-auto lg:w-[62%] lg:[mask-image:linear-gradient(to_right,transparent,black_38%)]"
          >
            <Image
              src="/images/hero-friends-sunset.jpg"
              alt=""
              fill
              priority
              sizes="(min-width: 1024px) 62vw, 100vw"
              className="sl-photo object-cover object-[60%_center]"
            />
            <div className="absolute inset-0 bg-night-950/65 lg:bg-night-950/25" />
            <div className="sl-grain absolute inset-0" />
            <div className="absolute inset-x-0 bottom-0 h-1/3 bg-linear-to-t from-night-950 to-transparent" />
          </div>
          <div aria-hidden className="absolute top-[72%] -left-[10%] h-[3px] w-[60%] -rotate-6 bg-swoosh opacity-60" />

          <div className="relative mx-auto grid max-w-[1200px] items-center gap-10 px-[clamp(16px,4vw,40px)] pt-28 pb-44 md:pb-56 lg:grid-cols-[1fr_420px] lg:gap-16 lg:pt-36">
            <div>
              <p className="sl-tagline text-xs text-white/75 md:text-sm">Bouge. Rencontre. Partage.</p>
              <h1 className="mt-4 font-display text-[clamp(2.4rem,4.5vw+1rem,4.25rem)] leading-[1.04] font-black tracking-tight text-balance">
                Trouve des partenaires de sport <span className="text-mint-500">près de chez toi.</span>
              </h1>
              <p className="sl-bar mt-6 max-w-lg text-base text-pretty md:text-lg">
                Un five ce soir, un tennis demain, un footing dimanche : rejoins une séance ou lance la tienne. Débutant
                ou confirmé, il y a toujours une place pour toi.
              </p>
              <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium text-white">
                {PROMISES.map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <span className="flex size-5 items-center justify-center rounded-full bg-mint-500 text-night-950">
                      <Check className="size-3.5" strokeWidth={3} aria-hidden />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative">
              {/* Notification d'exemple (illustration de l'app) */}
              <div
                aria-hidden
                className="absolute -top-7 -left-10 z-10 hidden items-center gap-3 rounded-card bg-night-800/95 py-2.5 pr-4 pl-2.5 text-white shadow-lg ring-1 ring-white/10 backdrop-blur xl:flex"
              >
                <span className="flex size-9 items-center justify-center rounded-full bg-mint-500 text-night-950">
                  <PartyPopper className="size-4.5" />
                </span>
                <span className="text-sm leading-tight">
                  <span className="block font-display font-bold">Candidature acceptée</span>
                  <span className="text-xs text-white/70">Padel · samedi 18h</span>
                </span>
              </div>
              <AuthCard>{children}</AuthCard>
            </div>
          </div>
        </section>

        <ShowcaseSection />
        <StepsSection />
        <FeaturesSection />
        <SportsSection />
        <StorySection />
        <TestimonialsSection />
        <FaqSection />
        <FinalCtaSection />
      </main>

      <LandingFooter />
      <MobileCtaBar />
    </div>
  );
}
