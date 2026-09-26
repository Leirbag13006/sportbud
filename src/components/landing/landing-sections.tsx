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
import { connection } from "next/server";
import type { ReactNode } from "react";

import { AUDIENCE_BORDER_CLASSES, AudienceBadge } from "@/components/activities/audience-badge";
import { PhotoBackdrop } from "@/components/brand/photo-backdrop";
import { Marked, Scribble } from "@/components/brand/scribble";
import { Stamp } from "@/components/brand/stamp";
import { Emoji, SportIcon } from "@/components/brand/sport-icon";
import { Logo } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";
import { LEGAL_PAGES } from "@/config/legal";
import { SPORT_COUNT, SPORTS } from "@/config/sports";
import { PublicActivityCard } from "@/components/public/public-activity-card";
import { getPublicActivities } from "@/lib/activities/public";
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
            { value: String(SPORT_COUNT), label: "sports, du foot au yoga" },
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
   Prochaines séances (vraies données, visibles sans compte)
   -------------------------------------------------------------------------- */

/** Les 6 prochaines séances ; section masquée s'il n'y en a aucune. */
export async function UpcomingSection() {
  // Données du moment, jamais figées au build (la landing sert aussi des pages statiques).
  await connection();
  const activities = await getPublicActivities({ limit: 6 });
  if (activities.length === 0) return null;

  return (
    <section id="seances" aria-labelledby="upcoming-title" className="scroll-mt-20 bg-sand-50 pb-20 md:pb-28">
      <Container>
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionTitle eyebrow="En ce moment" title="Les prochaines" accent="séances." />
          <Button variant="outline" nativeButton={false} render={<Link href="/seances" />}>
            Voir toutes les séances
            <ArrowRight aria-hidden />
          </Button>
        </div>
        <ul className="mt-10 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {activities.map((activity) => (
            <li key={activity.id} className="min-w-0">
              <PublicActivityCard activity={activity} />
            </li>
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
    text: "L'organisateur valide ta demande. Dès que c'est bon, tu rejoins la discussion du groupe.",
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
              {/* Capture de la vraie carte de l'app */}
              <Image
                src="/images/app-map.webp"
                alt=""
                fill
                sizes="(min-width: 768px) 700px, 100vw"
                className="object-cover object-[40%_45%]"
              />
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
                  { username: "lina.foot", level: "Intermédiaire", rating: "4,9" },
                  { username: "antoine.football", level: "Débutant", rating: "4,7" },
                ].map((person, index) => (
                  <div key={person.username} className="flex items-center gap-2.5 rounded-card bg-card p-2.5 shadow-md">
                    <Image
                      src={`/avatars/${person.username}.webp`}
                      alt=""
                      width={36}
                      height={36}
                      className="size-9 shrink-0 rounded-full object-cover"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-display text-sm font-bold text-ink">{person.username}</span>
                      <span className="block text-xs text-gray-400">
                        {person.level} · <span className="text-sunset-500">★</span> {person.rating}
                      </span>
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
            <BentoCard className="h-full" title="Un groupe par séance" text="Candidature acceptée ? Tu rejoins la discussion de la séance, avec l'organisateur et tous les participants.">
              <div className="flex w-full max-w-xs flex-col gap-1.5 text-sm">
                <span className="self-center rounded-lg bg-mint-500/15 px-3 py-1 text-xs text-mint-500">🎉 lina.foot a rejoint la séance</span>
                <span className="mt-1 self-start px-1 text-[11px] font-medium text-white/60">thomas.five</span>
                <span className="max-w-[85%] self-start rounded-2xl rounded-bl-md bg-white px-3 py-2 text-ink">RDV 18h45 à l&apos;entrée du city ?</span>
                <span className="max-w-[80%] self-end rounded-2xl rounded-br-md bg-mint-500 px-3 py-2 text-night-950">Parfait, j&apos;amène le ballon ⚽</span>
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
            <SectionTitle eyebrow={`${SPORT_COUNT} sports`} title="Ton sport," accent="ton rythme." mark="circle" />
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
