import { ArrowRight, Backpack, CalendarDays, Clock, Euro, Lock, MapPin, Signal, UsersRound } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { AudienceBadge } from "@/components/activities/audience-badge";
import { UserAvatar } from "@/components/applications/user-avatar";
import { PhotoBackdrop } from "@/components/brand/photo-backdrop";
import { LandingFooter } from "@/components/landing/landing-sections";
import { PublicActivityCard } from "@/components/public/public-activity-card";
import { PublicHeader } from "@/components/public/public-header";
import { ShareButtons } from "@/components/public/share-buttons";
import { RatingSummaryBadge } from "@/components/reviews/rating-stars";
import { Button } from "@/components/ui/button";
import { getSportLevelLabel } from "@/config/sport-levels";
import { getActivityTitle, getSport } from "@/config/sports";
import { SITE_URL } from "@/config/site";
import { getPublicActivities, getPublicActivity } from "@/lib/activities/public";
import type { PublicActivity } from "@/lib/activities/types";
import { getCurrentUser } from "@/lib/auth/session";
import { formatDay, formatDuration, formatFullDay, formatPrice, formatTimeRange, pluralize } from "@/lib/format";

/** Libellés de la séance ; relative = false pour les aperçus de liens (« Demain » y deviendrait faux). */
function describe(activity: PublicActivity, relative = true) {
  const sport = getSport(activity.sportType);
  const isFull = activity.status !== "open";
  return {
    sport,
    title: getActivityTitle(activity.sportType, isFull ? activity.spotsTotal : activity.spotsAvailable),
    when: `${relative ? formatDay(activity.startsAt) : formatFullDay(activity.startsAt)} · ${formatTimeRange(activity.startsAt, activity.durationMinutes)}`,
    level: activity.requiredLevel ? `Niveau ${getSportLevelLabel(activity.requiredLevel).toLowerCase()}` : "Tous niveaux",
  };
}

export async function generateMetadata({ params }: PageProps<"/seances/[id]">): Promise<Metadata> {
  const activity = await getPublicActivity((await params).id);
  if (!activity) return { title: "Séance introuvable" };
  const { sport, title, when, level } = describe(activity, false);
  const description = [
    `${sport.label} · ${level} · ${when}`,
    activity.area,
    activity.status === "open" ? `${pluralize(activity.spotsAvailable, "place")} libre${activity.spotsAvailable > 1 ? "s" : ""}` : "Complet",
    formatPrice(activity.priceCents),
  ]
    .filter(Boolean)
    .join(" · ");
  return {
    title: `${title} · ${sport.label}`,
    description: `${description}. Rejoins la séance sur SportMates.`,
    alternates: { canonical: `/seances/${activity.id}` },
    openGraph: { title: `${title} · ${when}`, description, type: "website", locale: "fr_FR" },
    // Séances passées ou annulées : consultables par lien, mais pas indexées.
    robots: activity.ended || activity.status === "cancelled" ? { index: false } : undefined,
  };
}

/** Page publique et partageable d'une séance (lien WhatsApp, réseaux) : lieu approximatif, sans compte. */
export default async function PublicActivityPage({ params }: PageProps<"/seances/[id]">) {
  const { id } = await params;
  const [activity, user] = await Promise.all([getPublicActivity(id), getCurrentUser()]);
  if (!activity) notFound();

  const { sport, title, when, level } = describe(activity);
  const isCancelled = activity.status === "cancelled";
  const isFull = activity.status === "full";
  const canJoin = !activity.ended && !isCancelled && !isFull;
  // Dans l'app, ce lien ouvre directement la fiche de la séance (candidature, lieu exact).
  const appHref = `/?activity=${activity.id}`;
  const others = (await getPublicActivities({ limit: 7 })).filter((other) => other.id !== activity.id).slice(0, 6);

  const status = isCancelled
    ? "Cette séance a été annulée par l'organisateur."
    : activity.ended
      ? "Cette séance est terminée."
      : isFull
        ? "Cette séance est complète."
        : null;

  return (
    <div className="min-h-dvh bg-sand-50">
      <PublicHeader isMember={Boolean(user)} next={appHref} />

      <section className="sl-dark relative overflow-hidden">
        <PhotoBackdrop src={sport.image} blur="sm" veil="left" priority />
        <div className="relative mx-auto max-w-[1200px] px-[clamp(16px,4vw,40px)] pt-10 pb-12 md:pt-14 md:pb-16">
          <AudienceBadge audience={activity.audience} className="mb-3" />
          <p className="font-display text-xs font-bold tracking-eyebrow text-mint-500 uppercase">
            {sport.label} · {level}
          </p>
          <h1 className="sl-bar mt-2 text-3xl font-extrabold text-balance md:text-5xl">{title}</h1>
          <p className="mt-5 flex items-center gap-2 font-display text-lg font-bold text-white md:text-xl">
            <CalendarDays className="size-5 text-mint-500" aria-hidden />
            {when}
          </p>
          {activity.area && (
            <p className="mt-2 flex items-center gap-2 text-white/85">
              <MapPin className="size-5 text-mint-500" aria-hidden />
              {activity.area}
            </p>
          )}
        </div>
      </section>

      <main className="mx-auto grid max-w-[1200px] gap-8 px-[clamp(16px,4vw,40px)] py-8 md:py-12 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          {status && (
            <p role="status" className="rounded-card bg-sunset-300/45 p-4 font-display font-bold text-ink">
              {status}
            </p>
          )}

          <dl className="grid gap-3 sm:grid-cols-2">
            <Fact icon={Clock} label="Durée" value={formatDuration(activity.durationMinutes)} />
            <Fact
              icon={UsersRound}
              label="Places"
              value={isFull || isCancelled ? `Complet (${activity.spotsTotal})` : `${activity.spotsAvailable} sur ${activity.spotsTotal} libre${activity.spotsAvailable > 1 ? "s" : ""}`}
            />
            <Fact icon={Signal} label="Niveau" value={level} />
            <Fact
              icon={Euro}
              label="Prix par personne"
              value={activity.priceCents > 0 ? `${formatPrice(activity.priceCents)}, à régler sur place` : "Gratuit"}
            />
            <Fact icon={Backpack} label="Matériel" value={activity.equipmentRequired ? "À apporter" : "Rien à prévoir"} />
            <Fact
              icon={Lock}
              label="Lieu exact"
              value={user ? "Visible dans l'app" : "Visible une fois inscrit"}
            />
          </dl>

          <section aria-labelledby="organizer-title" className="rounded-card bg-card p-5 shadow-md">
            <h2 id="organizer-title" className="font-display text-sm font-bold text-gray-600">
              Organisé par
            </h2>
            <div className="mt-3 flex items-center gap-3">
              <UserAvatar user={activity.creator} className="size-12" />
              <div className="min-w-0">
                <p className="truncate font-display text-lg font-extrabold text-ink">{activity.creator.username}</p>
                <RatingSummaryBadge rating={activity.creatorRating} />
              </div>
            </div>
            <p className="mt-4 text-sm text-pretty">
              {activity.participantCount > 0
                ? `${pluralize(activity.participantCount, "participant")} déjà accepté${activity.participantCount > 1 ? "s" : ""}. `
                : "Sois parmi les premiers à rejoindre ! "}
              L&apos;organisateur valide chaque demande, puis une discussion s&apos;ouvre pour caler les détails.
            </p>
          </section>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
          <div className="rounded-card bg-card p-5 shadow-md">
            {user ? (
              <Button size="lg" className="w-full" nativeButton={false} render={<Link href={appHref} />}>
                {canJoin ? "Voir et rejoindre dans l'app" : "Ouvrir dans l'app"}
                <ArrowRight aria-hidden />
              </Button>
            ) : canJoin ? (
              <>
                <Button
                  size="lg"
                  className="w-full"
                  nativeButton={false}
                  render={<Link href={`/register?next=${encodeURIComponent(appHref)}`} />}
                >
                  Rejoindre cette séance
                  <ArrowRight aria-hidden />
                </Button>
                <p className="mt-3 text-center text-sm">
                  Déjà membre ?{" "}
                  <Link
                    href={`/login?next=${encodeURIComponent(appHref)}`}
                    className="font-medium text-brand-text underline-offset-4 hover:underline"
                  >
                    Se connecter
                  </Link>
                </p>
                <p className="mt-3 text-center text-xs text-gray-400">Inscription gratuite, en moins d&apos;une minute.</p>
              </>
            ) : (
              <Button size="lg" variant="outline" className="w-full" nativeButton={false} render={<Link href="/seances" />}>
                Voir les autres séances
              </Button>
            )}
          </div>

          <div className="rounded-card bg-card p-5 shadow-md">
            <p className="font-display text-sm font-bold text-ink">Tu connais quelqu&apos;un que ça intéresserait ?</p>
            <ShareButtons
              className="mt-3"
              url={`${SITE_URL}/seances/${activity.id}`}
              text={`${title} (${sport.label}) · ${describe(activity, false).when} sur SportMates :`}
            />
          </div>
        </aside>

        {others.length > 0 && (
          <section aria-labelledby="others-title" className="lg:col-span-2">
            <div className="mb-5 flex items-end justify-between gap-4">
              <h2 id="others-title" className="sl-bar text-xl font-extrabold md:text-2xl">
                D&apos;autres <span className="text-brand-text">séances.</span>
              </h2>
              <Link href="/seances" className="font-display text-sm font-bold text-brand-text hover:underline">
                Tout voir
              </Link>
            </div>
            <ul className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {others.map((other) => (
                <li key={other.id} className="min-w-0">
                  <PublicActivityCard activity={other} />
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>

      <LandingFooter />
    </div>
  );
}

function Fact({ icon: Icon, label, value }: { icon: typeof Clock; label: string; value: ReactNode }) {
  return (
    <div className="flex items-center gap-3 rounded-card bg-card p-4 shadow-md">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-mint-100 text-mint-700">
        <Icon className="size-5" aria-hidden />
      </span>
      <div className="min-w-0">
        <dt className="text-xs text-gray-400">{label}</dt>
        <dd className="font-display font-bold text-ink">{value}</dd>
      </div>
    </div>
  );
}
