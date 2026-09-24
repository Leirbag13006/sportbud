import { MapPin, MessageCircle, SlidersHorizontal, Users } from "lucide-react";
import Image from "next/image";

import { Logo } from "@/components/layout/logo";

/** Étapes « Comment ça marche ? » (design system, section sombre). */
const STEPS = [
  { icon: MapPin, title: "Choisis ta ville", text: "Les séances autour de toi, sur une carte ou en liste." },
  { icon: SlidersHorizontal, title: "Filtre selon tes envies", text: "Sport, niveau, distance, disponibilités…" },
  { icon: Users, title: "Trouve des partenaires", text: "Rejoins une séance ou propose la tienne." },
  { icon: MessageCircle, title: "Échange et organise", text: "Discute, fixe un lieu, un horaire et c'est parti !" },
];

/**
 * Pages de connexion / inscription.
 * Desktop : panneau « hero » sombre (logo, accroche, étapes) à gauche, formulaire à droite.
 * Mobile : bandeau hero compact au-dessus du formulaire.
 */
export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="grid min-h-dvh bg-background lg:grid-cols-[1.1fr_1fr]">
      {/* Panneau de marque */}
      <aside className="sl-dark relative overflow-hidden px-6 pt-[max(1.5rem,env(safe-area-inset-top))] pb-8 lg:flex lg:flex-col lg:justify-between lg:p-12">
        {/* Photo fondue dans la nuit (jamais de bord dur) */}
        <div aria-hidden className="absolute inset-y-0 right-0 hidden w-3/5 lg:block">
          <Image src="/sports/running.jpg" alt="" fill sizes="40vw" className="object-cover opacity-60" priority />
          <div className="absolute inset-0 bg-photo-fade" />
          <div className="absolute inset-0 bg-linear-to-t from-night-950 via-transparent to-night-950/60" />
        </div>

        <div className="relative">
          <Logo variant="dark" size="md" withTagline href={null} />
        </div>

        <div className="relative mt-8 max-w-lg lg:mt-0">
          <p className="font-display text-4xl leading-[1.05] font-black tracking-tight text-white lg:text-5xl xl:text-6xl">
            Le sport
            <br />
            nous rapproche,
            <br />
            <span className="text-mint-500">partout.</span>
          </p>
          <p className="sl-bar mt-5 text-base lg:text-lg">
            Trouve des partenaires sportifs près de chez toi, partage tes passions et vis de nouvelles expériences.
          </p>

          {/* Comment ça marche ? — étapes reliées par une ligne menthe */}
          <ol className="mt-10 hidden space-y-5 border-l-2 border-mint-500 pl-0 lg:block [@media(max-height:760px)]:lg:hidden">
            {STEPS.map(({ icon: Icon, title, text }, index) => (
              <li key={title} className="-ml-[17px] grid grid-cols-[32px_28px_1fr] items-start gap-4">
                <span className="flex size-8 items-center justify-center rounded-full bg-mint-500 font-display text-sm font-extrabold text-night-950">
                  {index + 1}
                </span>
                <Icon className="mt-0.5 size-7 text-white" strokeWidth={1.75} aria-hidden />
                <span>
                  <span className="block font-display font-bold text-white">{title}</span>
                  <span className="text-sm">{text}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>

        {/* Accroche manuscrite (une seule fois par page) */}
        <p className="relative mt-8 hidden -rotate-6 font-script text-4xl leading-tight text-white lg:block [@media(max-height:960px)]:lg:hidden">
          Mêmes passions.
          <br />
          Nouvelles rencontres.
          <span aria-hidden className="mt-1 block h-1 w-64 rounded-full bg-swoosh" />
        </p>
      </aside>

      <main className="flex items-center justify-center px-4 py-10 sm:px-8">
        <div className="w-full max-w-sm">{children}</div>
      </main>
    </div>
  );
}
