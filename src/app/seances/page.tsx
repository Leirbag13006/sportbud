import { CalendarPlus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { PhotoBackdrop } from "@/components/brand/photo-backdrop";
import { SportIcon } from "@/components/brand/sport-icon";
import { LandingFooter } from "@/components/landing/landing-sections";
import { PublicActivityCard } from "@/components/public/public-activity-card";
import { PublicHeader } from "@/components/public/public-header";
import { Button } from "@/components/ui/button";
import { SPORTS } from "@/config/sports";
import { SPORT_TYPE_VALUES, type SportType } from "@/db/schema";
import { getPublicActivities } from "@/lib/activities/public";
import { getCurrentUser } from "@/lib/auth/session";
import { pluralize } from "@/lib/format";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Séances de sport à venir",
  description:
    "Foot, tennis, running, padel… Les prochaines séances ouvertes à tous sur SportMates. Rejoins-en une ou lance la tienne, gratuitement.",
  alternates: { canonical: "/seances" },
};

function parseSport(value: unknown): SportType | undefined {
  return typeof value === "string" && (SPORT_TYPE_VALUES as readonly string[]).includes(value) ? (value as SportType) : undefined;
}

/** Liste publique des séances à venir (sans compte), filtrable par sport. */
export default async function PublicActivitiesPage({ searchParams }: PageProps<"/seances">) {
  const sport = parseSport((await searchParams).sport);
  const [activities, user] = await Promise.all([getPublicActivities({ sport }), getCurrentUser()]);

  return (
    <div className="min-h-dvh bg-sand-50">
      <PublicHeader isMember={Boolean(user)} />

      <section className="sl-dark relative overflow-hidden">
        <PhotoBackdrop src="/images/silhouettes-sunset.jpg" blur="sm" veil="left" position="center 40%" priority />
        <div className="relative mx-auto max-w-[1200px] px-[clamp(16px,4vw,40px)] pt-10 pb-6">
          <h1 className="sl-bar text-3xl font-extrabold text-balance md:text-5xl">
            Les prochaines <span className="text-mint-500">séances.</span>
          </h1>
          <p className="mt-4 max-w-xl text-pretty">
            Toutes les séances ouvertes, du five du soir au footing du dimanche. Le lieu exact et la discussion avec
            l&apos;organisateur sont réservés aux membres.
          </p>

          <nav aria-label="Filtrer par sport" className="-mx-[clamp(16px,4vw,40px)] mt-8 overflow-x-auto px-[clamp(16px,4vw,40px)] pb-2">
            <ul className="flex gap-2">
              {[{ value: undefined, label: "Tous" }, ...SPORTS].map(({ value, label }) => {
                const active = value === sport;
                return (
                  <li key={label} className="shrink-0">
                    <Link
                      href={value ? `/seances?sport=${value}` : "/seances"}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex h-10 items-center gap-2 rounded-full border px-3.5 font-display text-sm font-semibold outline-none focus-visible:ring-3 focus-visible:ring-ring",
                        active ? "border-mint-500 bg-mint-500 text-night-950" : "border-white/20 text-white/85 hover:border-mint-500",
                      )}
                    >
                      {value && <SportIcon sport={value} className="size-5" />}
                      {label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </section>

      <main className="mx-auto max-w-[1200px] px-[clamp(16px,4vw,40px)] py-8 md:py-12">
        {activities.length > 0 ? (
          <>
            <p className="mb-5 text-sm" aria-live="polite">
              {pluralize(activities.length, "séance")} à venir
            </p>
            <ul className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {activities.map((activity, index) => (
                <li key={activity.id} className="min-w-0">
                  <PublicActivityCard activity={activity} priority={index < 6} />
                </li>
              ))}
            </ul>
          </>
        ) : (
          <div className="mx-auto flex max-w-md flex-col items-center gap-3 py-16 text-center">
            <span className="flex size-14 items-center justify-center rounded-full bg-brand-soft text-brand-text">
              <CalendarPlus className="size-7" aria-hidden />
            </span>
            <h2 className="text-lg font-extrabold">Aucune séance {sport ? "de ce sport " : ""}pour l&apos;instant</h2>
            <p className="text-sm text-pretty">Lance la première : c&apos;est gratuit et ça prend 30 secondes.</p>
          </div>
        )}

        {!user && (
          <div className="sl-dark mt-12 flex flex-col items-start gap-4 rounded-block p-6 md:flex-row md:items-center md:justify-between md:p-8">
            <div>
              <p className="font-display text-xl font-extrabold">Envie de jouer ?</p>
              <p className="mt-1 text-sm text-pretty">Crée ton compte gratuit pour rejoindre une séance ou lancer la tienne.</p>
            </div>
            <Button size="lg" nativeButton={false} render={<Link href="/register" />}>
              Créer mon compte gratuit
            </Button>
          </div>
        )}
      </main>

      <LandingFooter />
    </div>
  );
}
