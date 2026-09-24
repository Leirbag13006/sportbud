import {
  ArrowRight,
  Check,
  ChevronDown,
  Clock,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import { AUDIENCE_BORDER_CLASSES, AudienceBadge } from "@/components/activities/audience-badge";
import { PhotoBackdrop } from "@/components/brand/photo-backdrop";
import { Marked, Scribble } from "@/components/brand/scribble";
import { Stamp } from "@/components/brand/stamp";
import { Emoji, getEmojiSrc, SportIcon } from "@/components/brand/sport-icon";
import { Logo } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";
import { LEGAL_PAGES } from "@/config/legal";
import { SPORTS } from "@/config/sports";
import type { SportType } from "@/db/schema";
import { ProductPreview } from "./product-preview";
import { Reveal } from "./reveal";

/** Conteneur : 1200 px max, gouttières fluides. */
function Container({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-[1200px] px-[clamp(16px,4vw,40px)] ${className}`}>{children}</div>;
}

/** Titre de section : sur-titre, titre (fin en accent) et barre menthe. */
function SectionTitle({
  eyebrow,
  title,
  accent,
  intro,
  onDark = false,
  center = false,
  mark,
}: {
  eyebrow: string;
  title: string;
  accent: string;
  intro?: string;
  onDark?: boolean;
  center?: boolean;
  /** Trait à la main sur l'accent (souligné ou entouré). */
  mark?: "underline" | "circle";
}) {
  return (
    <div className={center ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <p className={`font-display text-xs font-bold tracking-eyebrow uppercase ${onDark ? "text-mint-500" : "text-brand-text"}`}>
        {eyebrow}
      </p>
      <h2
        className={`sl-bar mt-3 text-3xl leading-[1.1] font-extrabold text-balance md:text-[2.75rem] ${center ? "[&::after]:mx-auto" : ""}`}
      >
        {title}{" "}
        <span className={onDark ? "text-mint-500" : "text-brand-text"}>{mark ? <Marked kind={mark}>{accent}</Marked> : accent}</span>
      </h2>
      {intro && <p className="mt-5 text-base text-pretty md:text-lg">{intro}</p>}
    </div>
  );
}

/* -----------------------------------------------------------------------------
   Aperçu du produit (vrai écran de l'app) — remonte sur le hero
   -------------------------------------------------------------------------- */

export function ShowcaseSection() {
  return (
    <section aria-label="Aperçu de l'application" className="relative flow-root bg-sand-50 pb-20 md:pb-28">
      {/* L'aperçu remonte sur le bas du hero (effet de profondeur). */}
      <Container className="relative z-10 -mt-32 md:-mt-44">
        <Reveal className="relative mx-auto max-w-5xl">
          <ProductPreview />
          <Stamp className="absolute -top-14 -right-4 hidden size-28 md:block lg:-right-12 lg:size-32" />
        </Reveal>
        <ul className="mx-auto mt-10 grid max-w-4xl grid-cols-2 gap-6 text-center md:grid-cols-4">
          {[
            { value: "12", label: "sports, du foot à l'escalade" },
            { value: "3", label: "niveaux, du débutant au confirmé" },
            { value: "0 €", label: "d'inscription, sans abonnement" },
            { value: "1 clic", label: "pour rejoindre une séance" },
          ].map(({ value, label }, index) => (
            <Reveal as="li" key={label} delay={index * 80}>
              <p className="font-display text-3xl font-black text-ink md:text-4xl">{value}</p>
              <p className="mt-1 text-sm">{label}</p>
            </Reveal>
          ))}
        </ul>
      </Container>
    </section>
  );
}

/* -----------------------------------------------------------------------------
   Comment ça marche (3 étapes)
   -------------------------------------------------------------------------- */

const STEPS = [
  {
    icon: "search" as const,
    title: "Trouve ta séance",
    text: "En liste ou sur la carte, filtre par sport, niveau, distance et date, puis trie par horaire ou par proximité.",
  },
  {
    icon: "handshake" as const,
    title: "Rejoins en un clic",
    text: "L'organisateur valide ta demande. Dès que c'est bon, une discussion s'ouvre entre vous.",
  },
  {
    icon: "speech" as const,
    title: "Retrouvez-vous sur le terrain",
    text: "Calez les derniers détails, prends tes baskets… et profite. La suite se joue souvent autour d'un verre.",
  },
];

export function StepsSection() {
  return (
    <section id="fonctionnement" className="relative scroll-mt-20 overflow-hidden bg-sand-50 pt-16 pb-20 md:pt-20 md:pb-28">
      <PhotoBackdrop src="/sports/running.jpg" tone="light" position="center 60%" />
      <Container className="relative">
        <Reveal>
          <SectionTitle eyebrow="Comment ça marche" title="Du canapé au terrain" accent="en 3 étapes." center mark="underline" />
        </Reveal>
        <ol className="relative mt-14 grid gap-6 md:grid-cols-3">
          {/* Ligne menthe qui relie les étapes (desktop) */}
          <span aria-hidden className="absolute top-10 right-[16%] left-[16%] hidden h-0.5 bg-mint-500/40 md:block" />
          {STEPS.map(({ icon, title, text }, index) => (
            <Reveal as="li" key={title} delay={index * 120} className="relative text-center">
              <span className="relative mx-auto flex size-20 items-center justify-center rounded-full bg-card shadow-md ring-8 ring-sand-50">
                <Emoji name={icon} className="size-11" />
                <span className="absolute -top-1 -right-1 flex size-6 items-center justify-center rounded-full bg-mint-500 font-display text-xs font-extrabold text-night-950">
                  {index + 1}
                </span>
              </span>
              <h3 className="mt-6 text-xl font-extrabold">{title}</h3>
              <p className="mx-auto mt-2 max-w-xs text-pretty">{text}</p>
            </Reveal>
          ))}
        </ol>
      </Container>
    </section>
  );
}

/* -----------------------------------------------------------------------------
   Fonctionnalités (grille « bento » avec extraits d'interface)
   -------------------------------------------------------------------------- */

function BentoCard({ title, text, children, className = "" }: { title: string; text: string; children: ReactNode; className?: string }) {
  return (
    <div className={`flex flex-col overflow-hidden rounded-block border border-night-700 bg-night-800 ${className}`}>
      <div aria-hidden className="relative flex min-h-44 flex-1 items-center justify-center overflow-hidden p-6">
        {children}
      </div>
      <div className="border-t border-night-700 p-6">
        <h3 className="text-lg font-extrabold">{title}</h3>
        <p className="mt-1.5 text-sm text-pretty">{text}</p>
      </div>
    </div>
  );
}

/** Marqueur d'activité identique à ceux de la carte de l'app (styles .map-marker-*). */
function MapMarker({ sport, spots, className }: { sport: SportType; spots: number; className: string }) {
  return (
    <div className={`absolute ${className}`}>
      <div className="map-marker-activity">
        <span className="map-marker-activity__icon">
          {/* eslint-disable-next-line @next/next/no-img-element -- identique au marqueur HTML de Leaflet */}
          <img src={getEmojiSrc(sport)} alt="" width={26} height={26} />
        </span>
        <span className="map-marker-activity__badge">{spots}</span>
      </div>
    </div>
  );
}

export function FeaturesSection() {
  return (
    <section id="fonctionnalites" className="sl-dark relative scroll-mt-20 overflow-hidden py-20 md:py-28">
      <PhotoBackdrop src="/images/team-huddle.jpg" blur="md" veil="full" />
      <Container className="relative">
        <Reveal>
          <SectionTitle
            eyebrow="Fonctionnalités"
            title="Tout ce qu'il faut pour"
            accent="ne plus jouer seul."
            mark="underline"
            intro="Pensé pour aller vite : tu trouves, tu rejoins, tu joues. Et quand tu organises, c'est toi qui gardes la main."
            onDark
          />
        </Reveal>

        <div className="mt-12 grid gap-4 md:grid-cols-6">
          <Reveal className="md:col-span-4">
            <BentoCard
              className="h-full"
              title="Les séances autour de toi"
              text="Bascule entre liste et carte, vois la distance de chaque séance et repère en un coup d'œil celles qui ont encore de la place."
            >
              {/* Mini-carte stylisée avec les vrais marqueurs de l'app */}
              <div className="absolute inset-0 bg-night-900">
                <svg viewBox="0 0 600 260" preserveAspectRatio="xMidYMid slice" className="size-full text-white/[0.07]" fill="none" stroke="currentColor">
                  <path d="M0 190 C 120 170 180 120 300 130 S 480 60 600 70" strokeWidth="14" />
                  <path d="M60 0 C 90 90 150 160 170 260" strokeWidth="9" />
                  <path d="M420 0 C 400 80 430 170 520 260" strokeWidth="9" />
                  <path d="M0 60 L 600 110" strokeWidth="5" />
                  <path d="M250 0 L 330 260" strokeWidth="5" />
                </svg>
              </div>
              <MapMarker sport="football" spots={3} className="top-[18%] left-[18%]" />
              <MapMarker sport="tennis" spots={1} className="top-[48%] left-[44%]" />
              <MapMarker sport="running" spots={4} className="top-[14%] left-[66%]" />
              <MapMarker sport="basketball" spots={2} className="top-[52%] left-[80%]" />
              <div className="absolute bottom-[14%] left-[28%] flex size-10 items-center justify-center rounded-full border-[3px] border-info bg-mint-100 font-display text-xs font-extrabold text-mint-700 shadow-md">
                Toi
              </div>
            </BentoCard>
          </Reveal>

          <Reveal delay={100} className="md:col-span-2">
            <BentoCard className="h-full" title="À ton niveau" text="Filtre par niveau : débutant, tu trouveras des séances faites pour toi.">
              <div className="flex flex-col items-start gap-2.5">
                {[
                  ["Débutant", true],
                  ["Intermédiaire", false],
                  ["Confirmé", false],
                ].map(([label, active]) => (
                  <span
                    key={String(label)}
                    className={
                      active
                        ? "rounded-full bg-mint-500 px-4 py-1.5 font-display text-sm font-bold text-night-950 shadow-glow"
                        : "rounded-full border border-night-700 px-4 py-1.5 font-display text-sm font-semibold text-white/75"
                    }
                  >
                    {label}
                  </span>
                ))}
                <span className="mt-1 flex items-center gap-1.5 text-sm text-mint-500">
                  <Sparkles className="size-4" /> Tous niveaux bienvenus
                </span>
              </div>
            </BentoCard>
          </Reveal>

          <Reveal className="md:col-span-3">
            <BentoCard
              className="h-full"
              title="Entre femmes ou entre hommes, si tu veux"
              text="Organise ou rejoins une séance réservée aux femmes ou aux hommes. Ton genre n'est jamais affiché, et les séances mixtes restent la règle."
            >
              <div className="sl-light w-full max-w-xs space-y-2">
                {(
                  [
                    { audience: "women", sport: "volleyball", label: "Volley • Sam. 19:00", spots: "3 places" },
                    { audience: "men", sport: "basketball", label: "Basket 3x3 • Dim. 18:30", spots: "4 places" },
                  ] as const
                ).map((item) => (
                  <div
                    key={item.audience}
                    className={`flex items-center gap-2.5 rounded-card bg-card p-2.5 shadow-md ${AUDIENCE_BORDER_CLASSES[item.audience]}`}
                  >
                    <SportIcon sport={item.sport} className="size-8" />
                    <span className="min-w-0 flex-1">
                      <AudienceBadge audience={item.audience} />
                      <span className="mt-0.5 block truncate font-display text-sm font-bold text-ink">{item.label}</span>
                    </span>
                    <span className="text-xs font-semibold text-gray-400">{item.spots}</span>
                  </div>
                ))}
                <span className="flex items-center justify-center gap-1.5 pt-1 text-xs text-white/75">
                  <ShieldCheck className="size-3.5 text-mint-500" /> Ton genre reste privé
                </span>
              </div>
            </BentoCard>
          </Reveal>

          <Reveal delay={100} className="md:col-span-3">
            <BentoCard className="h-full" title="Tu choisis avec qui tu joues" text="Tu consultes chaque profil avant d'accepter. Personne ne débarque sans ton accord.">
              <div className="sl-light w-full max-w-xs space-y-2">
                {[
                  { initials: "LM", name: "Léa M.", level: "Intermédiaire" },
                  { initials: "HR", name: "Hugo R.", level: "Débutant" },
                ].map((person, index) => (
                  <div key={person.name} className="flex items-center gap-2.5 rounded-card bg-card p-2.5 shadow-md">
                    <span className="flex size-9 items-center justify-center rounded-full bg-mint-100 text-xs font-bold text-mint-700">
                      {person.initials}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-display text-sm font-bold text-ink">{person.name}</span>
                      <span className="block text-xs text-gray-400">{person.level}</span>
                    </span>
                    {index === 0 ? (
                      <span className="flex items-center gap-1 rounded-full bg-mint-100 px-2 py-0.5 text-xs font-semibold text-mint-700">
                        <Check className="size-3" /> Acceptée
                      </span>
                    ) : (
                      <span className="flex gap-1">
                        <span className="flex size-7 items-center justify-center rounded-md border-2 border-mint-500 text-mint-700">
                          <X className="size-3.5" />
                        </span>
                        <span className="flex size-7 items-center justify-center rounded-md bg-mint-500 text-night-950">
                          <Check className="size-3.5" />
                        </span>
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </BentoCard>
          </Reveal>

          <Reveal delay={150} className="md:col-span-3">
            <BentoCard className="h-full" title="La discussion s'ouvre toute seule" text="Candidature acceptée ? Une conversation privée démarre pour caler l'heure et le lieu.">
              <div className="flex w-full max-w-xs flex-col gap-1.5 text-sm">
                <span className="self-center rounded-lg bg-mint-500/15 px-3 py-1 text-xs text-mint-500">Candidature acceptée !</span>
                <span className="max-w-[80%] self-start rounded-2xl rounded-bl-md bg-white px-3 py-2 text-ink">Salut ! On se retrouve à l&apos;entrée ?</span>
                <span className="max-w-[80%] self-end rounded-2xl rounded-br-md bg-mint-500 px-3 py-2 text-night-950">Parfait, j&apos;amène les balles 🎾</span>
                <span className="self-end text-[11px] text-white/50">Lu</span>
              </div>
            </BentoCard>
          </Reveal>

          <Reveal delay={200} className="md:col-span-3">
            <BentoCard className="h-full" title="Organise en 30 secondes" text="Sport, date, nombre de places, adresse trouvée automatiquement : ta séance est en ligne.">
              <div className="sl-light w-full max-w-xs space-y-2 rounded-card bg-card p-3 shadow-md">
                <div className="flex items-center gap-2 rounded-lg border border-input px-3 py-2 text-sm text-ink">
                  <SportIcon sport="padel" className="size-5" /> Padel
                </div>
                <div className="flex gap-2">
                  <span className="flex flex-1 items-center gap-1.5 rounded-lg border border-input px-3 py-2 text-sm text-ink">
                    <Clock className="size-4 text-gray-400" /> Sam. 18h
                  </span>
                  <span className="rounded-lg border border-input px-3 py-2 text-sm text-ink">2 places</span>
                </div>
                <span className="flex h-9 items-center justify-center rounded-lg bg-mint-500 font-display text-sm font-bold text-night-950">
                  Publier l&apos;activité
                </span>
              </div>
            </BentoCard>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}

/* -----------------------------------------------------------------------------
   Sports
   -------------------------------------------------------------------------- */

export function SportsSection() {
  return (
    <section id="sports" className="scroll-mt-20 bg-sand-50 py-20 md:py-28">
      <Container>
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <Reveal>
            <SectionTitle eyebrow="12 sports" title="Ton sport," accent="ton rythme." mark="circle" />
          </Reveal>
          <Reveal delay={100}>
            <Button variant="outline" nativeButton={false} render={<Link href="/register#acces" />}>
              Voir les séances près de moi
              <ArrowRight aria-hidden />
            </Button>
          </Reveal>
        </div>

        <ul className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {SPORTS.map((sport, index) => (
            <Reveal as="li" key={sport.value} delay={(index % 6) * 60}>
              <div className="group relative aspect-[4/5] overflow-hidden rounded-card shadow-md">
                <Image
                  src={sport.image}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 190px, (min-width: 640px) 33vw, 50vw"
                  className="sl-photo object-cover transition-transform duration-500 ease-brand group-hover:scale-105 motion-reduce:transition-none"
                />
                <div aria-hidden className="absolute inset-0 bg-linear-to-t from-night-950/90 via-night-950/10 to-transparent" />
                <div aria-hidden className="absolute inset-0 bg-linear-to-t from-mint-500/35 to-transparent to-60% opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <div aria-hidden className="sl-grain absolute inset-0" />
                <div className="absolute inset-x-3 bottom-3 flex items-center gap-2">
                  <span className="flex size-9 items-center justify-center rounded-full bg-night-950/60 backdrop-blur-sm">
                    <SportIcon sport={sport.value} className="size-6" />
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
   Histoire de marque (photo plein cadre, valeurs suggérées par le texte)
   -------------------------------------------------------------------------- */

export function StorySection() {
  return (
    <section aria-labelledby="story-title" className="relative overflow-hidden bg-night-950">
      <div aria-hidden className="absolute inset-0 md:left-[25%] md:[mask-image:linear-gradient(to_right,transparent,rgb(0_0_0/0.6)_35%,black_65%)]">
        <Image src="/images/friends-laughing.jpg" alt="" fill sizes="(min-width: 768px) 65vw, 100vw" className="sl-photo object-cover" />
        <div className="absolute inset-0 bg-night-950/55 md:bg-night-950/30" />
        <div className="sl-grain absolute inset-0" />
      </div>
      <Container className="relative py-24 md:py-36">
        <Reveal className="max-w-xl text-white/85">
          <h2 id="story-title" className="relative text-4xl leading-[1.05] font-black text-white md:text-6xl">
            Le sport, c&apos;est mieux <span className="text-mint-500">à plusieurs.</span>
            <Scribble kind="spark" stroke={3} delay={300} className="absolute -top-8 -left-10 size-10 md:-left-14 md:size-12" />
          </h2>
          <p className="sl-bar mt-6 text-lg text-pretty">
            Derrière chaque séance, il y a des gens qui avaient juste envie de bouger. Un five qui devient un rendez-vous
            du jeudi, un footing qui finit en terrasse, un partenaire de tennis qui devient un ami.
          </p>
          <p className="mt-8 -rotate-3 font-script text-3xl text-white md:text-4xl">
            Mêmes passions. Nouvelles rencontres.
            <span aria-hidden className="mt-1 block h-1 w-64 rounded-full bg-swoosh" />
          </p>
        </Reveal>
      </Container>
    </section>
  );
}

const TESTIMONIALS = [
  { name: "Camille, 24 ans", avatar: "/avatars/camille.run.webp", city: "Aix-en-Provence", text: "J'ai rejoint un footing sans connaître personne. En deux séances, j'avais déjà trouvé mon petit groupe du dimanche.", sport: "Running" },
  { name: "Hugo, 29 ans", avatar: "/avatars/hugo.padel.webp", city: "Aix-en-Provence", text: "Le format est simple : je propose, les gens répondent, et on se retrouve sur le terrain. C'est exactement ce qu'il manquait.", sport: "Padel" },
  { name: "Inès, 26 ans", avatar: "/avatars/ines.volley.webp", city: "Aix-en-Provence", text: "J'apprécie de pouvoir choisir une séance entre femmes quand j'en ai envie, sans que ce soit imposé dans tout le reste de l'app.", sport: "Volley" },
];

export function TestimonialsSection() {
  return (
    <section className="bg-sand-50 py-20 md:py-28">
      <Container>
        <Reveal>
          <SectionTitle
            eyebrow="Ils bougent avec nous"
            title="Des rencontres qui restent"
            accent="après le match."
            mark="underline"
            intro="Des séances locales, des profils authentiques et une communauté qui se retrouve vraiment."
            center
          />
        </Reveal>
        <ul className="mt-12 grid gap-4 md:grid-cols-3">
          {TESTIMONIALS.map((testimonial, index) => (
            <Reveal as="li" key={testimonial.name} delay={index * 100} className="rounded-card bg-card p-6 shadow-md">
              <div className="flex items-center justify-between gap-3">
                <Image
                  src={testimonial.avatar}
                  alt=""
                  width={52}
                  height={52}
                  className="sl-photo size-13 shrink-0 rounded-full object-cover ring-2 ring-mint-500 ring-offset-2 ring-offset-card"
                />
                <div className="min-w-0 flex-1">
                  <p className="font-display font-bold text-ink">{testimonial.name}</p>
                  <p className="text-sm text-gray-400">{testimonial.city} · {testimonial.sport}</p>
                </div>
                <span className="text-sunset-500" aria-label="5 étoiles">★★★★★</span>
              </div>
              <p className="mt-5 text-pretty leading-relaxed">&ldquo;{testimonial.text}&rdquo;</p>
            </Reveal>
          ))}
        </ul>
      </Container>
    </section>
  );
}

/* -----------------------------------------------------------------------------
   FAQ (lever les freins à l'inscription)
   -------------------------------------------------------------------------- */

const FAQ = [
  {
    question: "C'est vraiment gratuit ?",
    answer:
      "L'inscription et l'app sont gratuites : créer un compte, rejoindre ou organiser des séances, discuter avec tes partenaires. Certaines séances ont un coût (location d'un terrain, d'un court…) : le prix par personne est affiché avant de candidater et se règle sur place, directement à l'organisateur.",
  },
  {
    question: "Je débute, est-ce que j'ai ma place ?",
    answer:
      "Évidemment. Chaque séance indique le niveau attendu, et beaucoup sont ouvertes à tous. Filtre par niveau pour trouver des partenaires qui jouent comme toi.",
  },
  {
    question: "C'est quoi une séance entre femmes ou entre hommes ?",
    answer:
      "Quand tu organises, tu peux réserver ta séance aux femmes ou aux hommes. Elle apparaît alors en rose (entre femmes) ou en bleu (entre hommes), et seules les personnes concernées peuvent la rejoindre. Ton genre sert uniquement à ça : il n'est jamais affiché sur ton profil.",
  },
  {
    question: "Qui peut rejoindre la séance que j'organise ?",
    answer:
      "Toi seul décides. Chaque personne intéressée t'envoie une demande : tu consultes son profil, puis tu acceptes ou refuses. Les places se mettent à jour automatiquement.",
  },
  {
    question: "Ma position est-elle partagée avec les autres ?",
    answer:
      "Non. Ta position n'est jamais enregistrée : elle sert seulement à afficher ta ville et les distances. Les autres membres voient le lieu des séances et ton profil (nom, niveau, bio), jamais ton email.",
  },
  {
    question: "Et si j'ai un empêchement ?",
    answer: "Tu peux te désister en un clic : ta place est immédiatement rendue à quelqu'un d'autre.",
  },
];

export function FaqSection() {
  return (
    <section id="faq" className="relative scroll-mt-20 overflow-hidden bg-sand-50 py-20 md:py-28">
      <PhotoBackdrop src="/sports/tennis.jpg" tone="light" position="center 30%" />
      <Container className="relative grid gap-12 lg:grid-cols-[1fr_1.4fr]">
        <Reveal>
          <SectionTitle
            eyebrow="Questions fréquentes"
            title="Tout ce que tu te demandes"
            accent="avant de te lancer."
            intro="Une autre question ? Crée ton compte et découvre l'app : ça prend moins d'une minute."
          />
        </Reveal>
        <Reveal delay={100}>
          <ul className="space-y-3">
            {FAQ.map(({ question, answer }) => (
              <li key={question}>
                <details className="group rounded-card bg-card shadow-md [&_summary::-webkit-details-marker]:hidden">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-card p-5 font-display font-bold text-ink outline-none focus-visible:ring-3 focus-visible:ring-ring">
                    {question}
                    <ChevronDown className="size-5 shrink-0 text-brand-text transition-transform duration-200 group-open:rotate-180" aria-hidden />
                  </summary>
                  <p className="px-5 pb-5 text-pretty">{answer}</p>
                </details>
              </li>
            ))}
          </ul>
        </Reveal>
      </Container>
    </section>
  );
}

/* -----------------------------------------------------------------------------
   Appel final + pied de page
   -------------------------------------------------------------------------- */

export function FinalCtaSection() {
  return (
    <section className="bg-sand-50 pb-20 md:pb-28">
      <Container>
        <Reveal>
          <div className="sl-dark relative overflow-hidden rounded-block px-6 py-14 text-center md:px-12 md:py-20">
            <PhotoBackdrop src="/images/friends-celebrate.jpg" blur="sm" veil="full" sizes="(min-width: 1200px) 1200px, 100vw" />
            <div aria-hidden className="absolute top-1/2 -left-[10%] h-[3px] w-[70%] -rotate-6 bg-swoosh opacity-60" />
            <h2 className="relative text-3xl leading-tight font-black text-balance md:text-5xl">
              Ta prochaine séance <span className="text-mint-500">t&apos;attend.</span>
            </h2>
            <p className="relative mx-auto mt-4 max-w-lg text-lg">
              Rejoins la communauté en moins d&apos;une minute. C&apos;est gratuit, et tu peux commencer dès ce soir.
            </p>
            <Scribble kind="zigzag" stroke={3} delay={200} className="absolute top-8 right-8 hidden h-5 w-28 md:block" />
            <div className="relative mt-8 flex flex-wrap justify-center gap-3">
              <Scribble kind="arrow-curl" stroke={3} delay={500} className="absolute -top-16 left-[calc(50%-17rem)] hidden size-20 lg:block" />
              <Button size="lg" nativeButton={false} render={<Link href="/register#acces" />}>
                Créer mon compte gratuit
                <ArrowRight aria-hidden />
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
            <p className="relative mt-6 flex items-center justify-center gap-2 text-sm text-white/70">
              <ShieldCheck className="size-4 text-mint-500" aria-hidden />
              Ton email n&apos;est jamais visible par les autres membres.
            </p>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}

const FOOTER_COLUMNS = [
  {
    title: "Produit",
    links: [
      { href: "#fonctionnement", label: "Comment ça marche" },
      { href: "#fonctionnalites", label: "Fonctionnalités" },
      { href: "#faq", label: "Questions fréquentes" },
    ],
  },
  {
    title: "Compte",
    links: [
      { href: "/register#acces", label: "Créer un compte" },
      { href: "/login#acces", label: "Se connecter" },
      { href: "/forgot-password", label: "Mot de passe oublié" },
    ],
  },
  {
    title: "Légal",
    links: [
      ...LEGAL_PAGES.map(({ slug, title, accent }) => ({
        href: `/legal/${slug}`,
        label: `${title} ${accent.replace(/\.$/, "")}`,
      })),
      { href: "/credits", label: "Crédits photos" },
    ],
  },
];

export function LandingFooter() {
  return (
    <footer className="bg-night-950 pt-14 pb-28 text-sm text-white/65 md:pb-10">
      <Container>
        <div className="grid gap-10 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div>
            <Logo variant="dark" size="sm" href={null} withTagline />
            <p className="mt-4 max-w-xs text-pretty">
              La communauté pour trouver des partenaires de sport près de chez toi, à ton niveau.
            </p>
          </div>
          {FOOTER_COLUMNS.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <p className="font-display text-xs font-bold tracking-widest text-white uppercase">{column.title}</p>
              <ul className="mt-4 space-y-2.5">
                {column.links.map(({ href, label }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="rounded transition-colors outline-none hover:text-mint-500 focus-visible:ring-3 focus-visible:ring-ring"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <div className="mt-12 flex flex-col gap-2 border-t border-night-700 pt-6 text-xs md:flex-row md:justify-between">
          <p>© {new Date().getFullYear()} SportMates. Tous droits réservés.</p>
          <p>Fait avec passion pour les sportifs du dimanche… et des autres jours.</p>
        </div>
      </Container>
    </footer>
  );
}
