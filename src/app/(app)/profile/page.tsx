import type { Metadata } from "next";
import { CalendarCheck, CalendarDays, ChevronRight, LogOut, Mail, Pencil, ShieldCheck, UserRound } from "lucide-react";
import Link from "next/link";

import { logout } from "@/app/(auth)/actions";
import { UserAvatar } from "@/components/applications/user-avatar";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { getSportLevelLabel } from "@/config/sport-levels";
import { AchievementsGrid } from "@/components/achievements/achievements-grid";
import { SportIcon } from "@/components/brand/sport-icon";
import { getSport } from "@/config/sports";
import { getAchievements } from "@/lib/achievements/queries";
import { RatingSummaryBadge } from "@/components/reviews/rating-stars";
import { ReviewList } from "@/components/reviews/review-list";
import { requireUser } from "@/lib/auth/session";
import { getRatingSummary, getUserReviews } from "@/lib/reviews/queries";
import { BlockedUsersList } from "@/components/safety/blocked-users-list";
import { getBlockedUsers } from "@/lib/safety/queries";
import { DeleteAccountDialog } from "@/components/profile/delete-account-dialog";
import { LEGAL_PAGES } from "@/config/legal";
import { isAdmin } from "@/lib/admin/auth";
import { countOpenReports } from "@/lib/admin/queries";

export const metadata: Metadata = { title: "Profil" };

const memberSince = new Intl.DateTimeFormat("fr-FR", { month: "long", year: "numeric" });

/** Profil de l'utilisateur connecté. */
export default async function ProfilePage() {
  const user = await requireUser();
  const openReports = isAdmin(user) ? await countOpenReports() : null;
  const [rating, reviews, achievements, blockedUsers] = await Promise.all([
    getRatingSummary(user.id),
    getUserReviews(user.id),
    getAchievements(user.id),
    getBlockedUsers(user.id),
  ]);
  const unlockedCount = achievements.filter((achievement) => achievement.unlocked).length;

  return (
    <>
      <PageHeader
        title="Mon"
        accent="profil."
        description="Ce que les autres membres voient de toi."
        image="/images/friends-laughing.jpg"
        action={
          <Button variant="outline" className="shrink-0 text-mint-500" nativeButton={false} render={<Link href="/profile/edit" />}>
            <Pencil aria-hidden />
            <span className="hidden sm:inline">Modifier</span>
            <span className="sr-only sm:hidden">Modifier mon profil</span>
          </Button>
        }
      />

      <div className="mx-auto w-full max-w-3xl space-y-6 px-4 py-8 md:px-6">
        {/* Identité */}
        <section className="rounded-card bg-card p-5 shadow-md">
          <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
            <UserAvatar user={user} className="size-20 text-xl ring-4 ring-mint-100" />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex flex-col items-center gap-2 sm:flex-row">
                <h2 className="truncate text-xl font-extrabold">{user.username}</h2>
                <span className="rounded-full bg-mint-100 px-2.5 py-0.5 text-xs font-semibold text-mint-700">
                  {getSportLevelLabel(user.sportLevel)}
                </span>
              </div>
              <RatingSummaryBadge rating={rating} />
              <ul className="space-y-1 text-sm">
                {user.fullName && (
                  <li className="flex items-center justify-center gap-2 sm:justify-start">
                    <UserRound className="size-4 text-gray-400" aria-hidden />
                    {user.fullName} <span className="text-xs text-gray-400">(privé)</span>
                  </li>
                )}
                <li className="flex items-center justify-center gap-2 sm:justify-start">
                  <Mail className="size-4 text-gray-400" aria-hidden />
                  {user.email} <span className="text-xs text-gray-400">(privé)</span>
                </li>
                <li className="flex items-center justify-center gap-2 sm:justify-start">
                  <CalendarDays className="size-4 text-gray-400" aria-hidden />
                  Membre depuis {memberSince.format(user.createdAt)}
                </li>
              </ul>
            </div>
          </div>

          {user.favoriteSports.length > 0 && (
            <ul className="mt-5 flex flex-wrap gap-2" aria-label="Sports favoris">
              {user.favoriteSports.map((sport) => (
                <li key={sport} className="flex items-center gap-1.5 rounded-full bg-sand-50 py-1 pr-3 pl-1.5 text-sm font-medium text-ink">
                  <SportIcon sport={sport} className="size-5" />
                  {getSport(sport).label}
                </li>
              ))}
            </ul>
          )}

          <div className="mt-5 border-t pt-4">
            <h3 className="text-sm font-bold">Bio</h3>
            <p className="mt-1 text-sm">
              {user.bio || "Pas encore de bio. Présente-toi pour rassurer tes futurs partenaires !"}
            </p>
          </div>
        </section>

        {/* Succès (gamification) */}
        <section aria-labelledby="achievements-title" className="rounded-card bg-card p-5 shadow-md">
          <div className="flex items-end justify-between gap-4">
            <h2 id="achievements-title" className="sl-bar text-lg font-extrabold">
              Mes succès
            </h2>
            <p className="text-sm">
              <span className="font-display font-bold text-ink">{unlockedCount}</span>/{achievements.length} débloqués
            </p>
          </div>
          <div className="mt-5">
            <AchievementsGrid achievements={achievements} />
          </div>
        </section>

        {/* Réputation : avis reçus après les séances, en tant qu'organisateur ou participant */}
        <section aria-labelledby="reputation-title" className="rounded-card bg-card p-5 shadow-md">
          <h2 id="reputation-title" className="sl-bar text-lg font-extrabold">
            Ma réputation
          </h2>
          <p className="mt-4 mb-4 text-sm">
            Après chaque séance, organisateur et participants se notent mutuellement. Ta note aide les autres à
            rejoindre tes activités… et à t&apos;accepter dans les leurs.
          </p>
          <ReviewList reviews={reviews} emptyMessage="Pas encore d'avis : participe à une séance pour en recevoir." />
        </section>

        <Link
          href="/activities"
          className="flex items-center gap-4 rounded-card bg-card p-4 shadow-md transition-all duration-150 ease-brand outline-none hover:-translate-y-0.5 hover:shadow-lg focus-visible:ring-3 focus-visible:ring-ring"
        >
          <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-mint-100 text-mint-700">
            <CalendarCheck className="size-6" aria-hidden />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-display font-bold text-ink">Mes activités</span>
            <span className="block text-sm">Séances organisées, candidatures et participations</span>
          </span>
          <ChevronRight className="size-5 text-gray-400" aria-hidden />
        </Link>

        {/* Modération (adresses ADMIN_EMAILS uniquement) */}
        {openReports !== null && (
          <Link
            href="/admin"
            className="flex items-center gap-4 rounded-card bg-card p-4 shadow-md transition-all duration-150 ease-brand outline-none hover:-translate-y-0.5 hover:shadow-lg focus-visible:ring-3 focus-visible:ring-ring"
          >
            <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-mint-100 text-mint-700">
              <ShieldCheck className="size-6" aria-hidden />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-display font-bold text-ink">Modération</span>
              <span className="block text-sm">
                {openReports > 0 ? `${openReports} signalement${openReports > 1 ? "s" : ""} à traiter` : "Aucun signalement à traiter"}
              </span>
            </span>
            <ChevronRight className="size-5 text-gray-400" aria-hidden />
          </Link>
        )}

        {/* Sécurité : membres bloqués */}
        <section aria-labelledby="blocked-title" className="rounded-card bg-card p-5 shadow-md">
          <h2 id="blocked-title" className="sl-bar text-lg font-extrabold">
            Membres bloqués
          </h2>
          <p className="mt-4 mb-4 text-sm">
            Vous ne voyez plus vos activités respectives et ne pouvez plus vous écrire.
          </p>
          <BlockedUsersList users={blockedUsers} />
        </section>

        <form action={logout}>
          <Button type="submit" variant="outline" className="w-full sm:w-auto">
            <LogOut aria-hidden />
            Se déconnecter
          </Button>
        </form>

        {/* Zone sensible : suppression définitive (droit à l'effacement, RGPD) */}
        <section aria-labelledby="danger-title" className="rounded-card border border-destructive/20 bg-card p-5">
          <h2 id="danger-title" className="font-display text-base font-extrabold text-ink">
            Zone sensible
          </h2>
          <p className="mt-1 mb-4 text-sm">
            Supprime ton compte et toutes tes données. Cette action est définitive.
          </p>
          <DeleteAccountDialog />
        </section>

        <nav aria-label="Informations légales" className="pb-4">
          <ul className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-xs text-gray-400">
            {LEGAL_PAGES.map(({ slug, title, accent }) => (
              <li key={slug}>
                <Link href={`/legal/${slug}`} className="hover:text-ink hover:underline">
                  {title} {accent.replace(/\.$/, "")}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/credits" className="hover:text-ink hover:underline">
                Crédits photos
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </>
  );
}
