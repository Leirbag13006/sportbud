import { Building2, Check, Handshake, Heart, MapPin, MessageCircle, ShieldCheck, SlidersHorizontal, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import { SportIcon } from "@/components/brand/sport-icon";
import { Logo } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";
import { SPORTS } from "@/config/sports";
import { PhoneMockup } from "./phone-mockup";
import { Reveal } from "./reveal";

/** Conteneur du design system : 1200 px max, gouttières fluides. */
function Container({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-[1200px] px-[clamp(16px,4vw,40px)] ${className}`}>{children}</div>;
}

/* -----------------------------------------------------------------------------
   Le concept : raison d'être, mission / vision, valeurs, encart sombre (section claire)
   -------------------------------------------------------------------------- */

const VALUES = [
  { icon: <Users className="size-6" aria-hidden />, title: "Partage", text: "Le sport est plus beau à plusieurs." },
  { icon: <Handshake className="size-6" aria-hidden />, title: "Inclusion", text: "Tout le monde a sa place, quel que soit son niveau." },
  { icon: <SportIcon sport="running" className="size-6" />, title: "Passion", text: "Des communautés locales unies par l'amour du sport." },
  { icon: <ShieldCheck className="size-6" aria-hidden />, title: "Confiance", text: "Des rencontres simples, sûres et bienveillantes." },
];

export function ConceptSection() {
  return (
    <section id="concept" className="scroll-mt-20 bg-sand-50 py-20 lg:py-24">
      <Container className="grid gap-12 lg:grid-cols-[1fr_1fr_1.1fr_1fr] lg:gap-10">
        <Reveal>
          <h2 className="sl-bar text-2xl font-extrabold">La raison d&apos;être</h2>
          <p className="mt-5">
            Nous croyons que le sport a un pouvoir unique : celui de créer du lien, de rapprocher les gens et de
            rendre nos vies plus riches et plus saines.
          </p>
          <p className="mt-4">
            SportLink existe pour permettre à chacun, partout, de trouver facilement des partenaires sportifs et de
            vivre des expériences humaines autour de sa passion.
          </p>
        </Reveal>

        <Reveal delay={100} className="space-y-10">
          <div>
            <h2 className="sl-bar text-2xl font-extrabold">Notre mission</h2>
            <p className="mt-5">
              Faciliter la rencontre entre passionnés de sport, en fonction de leur localisation, de leur niveau, de
              leurs envies et de leurs disponibilités.
            </p>
          </div>
          <div>
            <h2 className="sl-bar text-2xl font-extrabold">Notre vision</h2>
            <p className="mt-5">
              Devenir la référence de la rencontre sportive, en créant une grande communauté de passionnés, locale et
              bienveillante.
            </p>
          </div>
        </Reveal>

        <Reveal delay={200}>
          <h2 className="sl-bar text-2xl font-extrabold">Nos valeurs</h2>
          <ul className="mt-6 space-y-5">
            {VALUES.map(({ icon, title, text }) => (
              <li key={title} className="flex items-start gap-4">
                <span className="flex size-13 shrink-0 items-center justify-center rounded-full bg-mint-100 text-mint-700">
                  {icon}
                </span>
                <span>
                  <span className="block font-display font-bold text-ink">{title}</span>
                  <span className="text-sm">{text}</span>
                </span>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={300}>
          <div className="h-full rounded-block border border-night-700 bg-night-800 p-7 text-white/82">
            {/* Illustration line : montagnes */}
            <svg
              viewBox="0 0 120 50"
              className="mx-auto mb-6 w-28 text-mint-500"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M2 48 40 10l14 14 16-20 48 44" />
              <path d="m34 16 6 6 5-4" />
            </svg>
            <h2 className="text-2xl leading-tight font-extrabold text-white">
              Plus qu&apos;une application, <span className="text-mint-500">un état d&apos;esprit.</span>
            </h2>
            <p className="sl-bar mt-4 text-sm">
              SportLink, c&apos;est une communauté de passionnés qui croit que chaque rencontre peut devenir une belle
              histoire sportive… et humaine.
            </p>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}

/* -----------------------------------------------------------------------------
   Comment ça marche ? (section sombre, maquette de téléphone en chevauchement)
   -------------------------------------------------------------------------- */

const STEPS = [
  { icon: MapPin, title: "Choisis ta ville", text: "Par exemple : Aix-en-Provence ou Marseille." },
  { icon: SlidersHorizontal, title: "Filtre selon tes envies", text: "Sport, niveau, distance, disponibilités…" },
  { icon: Users, title: "Trouve des partenaires", text: "Découvre les séances près de chez toi, ou propose la tienne." },
  { icon: MessageCircle, title: "Échange et organise", text: "Discute, fixe un lieu, un horaire et c'est parti !" },
];

const BENEFITS = [
  { icon: Building2, label: "Des villes plus actives" },
  { icon: Users, label: "Des gens plus connectés" },
  { icon: Heart, label: "Une vie plus riche" },
];

export function HowItWorksSection() {
  return (
    <section id="comment-ca-marche" className="sl-dark relative scroll-mt-20 overflow-hidden py-20 lg:py-24">
      <Container className="grid items-center gap-14 lg:grid-cols-[1fr_auto_1fr] lg:gap-10">
        <Reveal>
          <h2 className="sl-bar text-3xl font-extrabold">Comment ça marche ?</h2>
          <ol className="mt-10 ml-4 space-y-8 border-l-2 border-mint-500">
            {STEPS.map(({ icon: Icon, title, text }, index) => (
              <li key={title} className="-ml-[17px] grid grid-cols-[32px_32px_1fr] items-start gap-4">
                <span className="flex size-8 items-center justify-center rounded-full bg-mint-500 font-display text-sm font-extrabold text-night-950">
                  {index + 1}
                </span>
                <Icon className="size-8 text-white" strokeWidth={1.5} aria-hidden />
                <span>
                  <span className="block font-display text-lg font-bold text-white">{title}</span>
                  <span className="text-sm">{text}</span>
                </span>
              </li>
            ))}
          </ol>
        </Reveal>

        {/* Téléphone : remonte sur la section précédente (effet de profondeur du prototype). */}
        <Reveal delay={150} className="flex justify-center lg:-mt-48">
          <PhoneMockup className="relative z-10 rotate-2" />
        </Reveal>

        <Reveal delay={300} className="space-y-8">
          <div className="relative overflow-hidden rounded-block">
            <Image
              src="/images/silhouettes-sunset.jpg"
              alt="Un groupe d'amis face au coucher de soleil"
              width={960}
              height={720}
              sizes="(min-width: 1024px) 380px, 100vw"
              className="h-72 w-full object-cover lg:h-80"
            />
            <div aria-hidden className="absolute inset-0 bg-linear-to-t from-night-950/85 via-night-950/10 to-transparent" />
            {/* Accroche manuscrite (une seule par page) + swoosh menthe */}
            <p className="absolute bottom-6 left-6 -rotate-6 font-script text-3xl leading-tight text-white md:text-4xl">
              Mêmes passions.
              <br />
              Nouvelles rencontres.
              <span aria-hidden className="mt-1 block h-1 w-56 rounded-full bg-swoosh" />
            </p>
          </div>

          <ul className="grid grid-cols-3 gap-4 text-center">
            {BENEFITS.map(({ icon: Icon, label }) => (
              <li key={label} className="flex flex-col items-center gap-2">
                <Icon className="size-8 text-white" strokeWidth={1.5} aria-hidden />
                <span className="font-display text-xs font-semibold text-white sm:text-sm">{label}</span>
              </li>
            ))}
          </ul>
        </Reveal>
      </Container>
    </section>
  );
}

/* -----------------------------------------------------------------------------
   Sports (section claire)
   -------------------------------------------------------------------------- */

export function SportsSection() {
  return (
    <section id="sports" className="scroll-mt-20 bg-sand-50 py-20 lg:py-24">
      <Container>
        <Reveal className="max-w-2xl">
          <p className="font-display text-xs font-bold tracking-eyebrow text-brand-text uppercase">12 sports</p>
          <h2 className="sl-bar mt-2 text-3xl leading-tight font-extrabold md:text-4xl">
            Tous les sports, <span className="text-brand-text">tous les niveaux.</span>
          </h2>
          <p className="mt-5">
            Du five entre collègues à la sortie vélo du dimanche, en passant par le padel ou l&apos;escalade : il y a
            forcément une séance faite pour toi, que tu débutes ou que tu joues en club.
          </p>
        </Reveal>

        <ul className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {SPORTS.map((sport, index) => (
            <Reveal as="li" key={sport.value} delay={(index % 6) * 60}>
              <div className="group relative aspect-[4/5] overflow-hidden rounded-card shadow-md">
                <Image
                  src={sport.image}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 190px, (min-width: 640px) 33vw, 50vw"
                  className="object-cover transition-transform duration-500 ease-brand group-hover:scale-105 motion-reduce:transition-none"
                />
                <div aria-hidden className="absolute inset-0 bg-linear-to-t from-night-950/90 via-night-950/20 to-transparent" />
                <div className="absolute inset-x-3 bottom-3 flex items-center gap-2">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full border-2 border-mint-500 bg-night-950/55 text-white backdrop-blur-sm">
                    <SportIcon sport={sport.value} className="size-4" />
                  </span>
                  <span className="font-display text-sm font-bold text-white">{sport.label}</span>
                </div>
              </div>
            </Reveal>
          ))}
        </ul>
      </Container>
    </section>
  );
}

/* -----------------------------------------------------------------------------
   Communauté (section sombre) + appel à l'action
   -------------------------------------------------------------------------- */

const PROMISES = ["Gratuit et sans engagement", "Tous niveaux bienvenus", "Des séances près de chez toi"];

export function CommunitySection() {
  return (
    <section id="communaute" className="sl-dark relative scroll-mt-20 overflow-hidden py-20 lg:py-24">
      <Container className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        {/* Mosaïque de photos */}
        <Reveal className="grid grid-cols-5 grid-rows-2 gap-3">
          <div className="relative col-span-3 row-span-2 min-h-80 overflow-hidden rounded-block">
            <Image
              src="/images/team-huddle.jpg"
              alt="Une équipe réunie avant un match"
              fill
              sizes="(min-width: 1024px) 340px, 60vw"
              className="object-cover"
            />
          </div>
          <div className="relative col-span-2 overflow-hidden rounded-card">
            <Image src="/images/friends-laughing.jpg" alt="Des amis qui rient ensemble" fill sizes="(min-width: 1024px) 220px, 40vw" className="object-cover" />
          </div>
          <div className="relative col-span-2 overflow-hidden rounded-card">
            <Image
              src="/images/friends-celebrate.jpg"
              alt="Des amis qui célèbrent au coucher du soleil"
              fill
              sizes="(min-width: 1024px) 220px, 40vw"
              className="object-cover"
            />
          </div>
        </Reveal>

        <Reveal delay={150}>
          <p className="sl-tagline font-display text-xs font-bold text-mint-500 not-italic">Plus que du sport, une communauté.</p>
          <h2 className="mt-4 text-3xl leading-tight font-extrabold md:text-5xl">
            Rejoins des sportifs <span className="text-mint-500">près de chez toi.</span>
          </h2>
          <p className="sl-bar mt-5 text-base md:text-lg">
            Crée ton profil en une minute, trouve une séance qui te ressemble et rencontre des partenaires qui
            partagent ta passion.
          </p>
          <ul className="mt-8 space-y-3">
            {PROMISES.map((promise) => (
              <li key={promise} className="flex items-center gap-3 text-white">
                <span className="flex size-6 items-center justify-center rounded-full bg-mint-500 text-night-950">
                  <Check className="size-4" strokeWidth={3} aria-hidden />
                </span>
                {promise}
              </li>
            ))}
          </ul>
          <div className="mt-10 flex flex-wrap gap-3">
            <Button size="lg" nativeButton={false} render={<Link href="/register#acces" />}>
              Rejoindre la communauté
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-mint-500"
              nativeButton={false}
              render={<Link href="/login#acces" />}
            >
              J&apos;ai déjà un compte
            </Button>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}

/* -----------------------------------------------------------------------------
   Pied de page
   -------------------------------------------------------------------------- */

export function LandingFooter() {
  return (
    <footer className="border-t border-night-700 bg-night-950 py-12 text-white/70">
      <Container className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
        <div>
          <Logo variant="dark" size="md" withTagline href={null} />
          <p className="mt-5 max-w-xs text-sm">Le sport nous rapproche, partout. Trouve des partenaires sportifs près de chez toi.</p>
        </div>
        <FooterColumn
          title="Découvrir"
          links={[
            { href: "#concept", label: "Le concept" },
            { href: "#comment-ca-marche", label: "Comment ça marche" },
            { href: "#sports", label: "Les sports" },
          ]}
        />
        <FooterColumn
          title="Compte"
          links={[
            { href: "/register#acces", label: "Créer un compte" },
            { href: "/login#acces", label: "Se connecter" },
          ]}
        />
        <FooterColumn title="À propos" links={[{ href: "/credits", label: "Crédits photos" }]} />
      </Container>
      <Container className="mt-10 border-t border-night-700 pt-6 text-xs">
        © {new Date().getFullYear()} SportLink · Bouge. Rencontre. Partage.
      </Container>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <div>
      <h2 className="font-display text-sm font-bold text-white">{title}</h2>
      <ul className="mt-4 space-y-2.5 text-sm">
        {links.map(({ href, label }) => (
          <li key={href}>
            <Link href={href} className="rounded transition-colors outline-none hover:text-mint-500 focus-visible:ring-3 focus-visible:ring-ring">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
