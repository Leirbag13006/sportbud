import type { Metadata } from "next";
import { CalendarCheck, CalendarDays, ChevronRight, LogOut, Mail } from "lucide-react";
import Link from "next/link";

import { logout } from "@/app/(auth)/actions";
import { UserAvatar } from "@/components/applications/user-avatar";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { getSportLevelLabel } from "@/config/sport-levels";
import { requireUser } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Profil" };

const memberSince = new Intl.DateTimeFormat("fr-FR", { month: "long", year: "numeric" });

/** Profil de l'utilisateur connecté. */
export default async function ProfilePage() {
  const user = await requireUser();

  return (
    <>
      <PageHeader title="Mon" accent="profil." description="Ce que les autres membres voient de toi." />

      <div className="mx-auto w-full max-w-3xl space-y-6 px-4 py-8 md:px-6">
        {/* Identité */}
        <section className="rounded-card bg-card p-5 shadow-md">
          <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
            <UserAvatar user={user} className="size-20 text-xl ring-4 ring-mint-100" />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex flex-col items-center gap-2 sm:flex-row">
                <h2 className="truncate text-xl font-extrabold">{user.fullName}</h2>
                <span className="rounded-full bg-mint-100 px-2.5 py-0.5 text-xs font-semibold text-mint-700">
                  {getSportLevelLabel(user.sportLevel)}
                </span>
              </div>
              <ul className="space-y-1 text-sm">
                <li className="flex items-center justify-center gap-2 sm:justify-start">
                  <Mail className="size-4 text-gray-400" aria-hidden />
                  {user.email}
                </li>
                <li className="flex items-center justify-center gap-2 sm:justify-start">
                  <CalendarDays className="size-4 text-gray-400" aria-hidden />
                  Membre depuis {memberSince.format(user.createdAt)}
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-5 border-t pt-4">
            <h3 className="text-sm font-bold">Bio</h3>
            <p className="mt-1 text-sm">
              {user.bio || "Pas encore de bio. Présente-toi pour rassurer tes futurs partenaires !"}
            </p>
          </div>
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

        <form action={logout}>
          <Button type="submit" variant="outline" className="w-full sm:w-auto">
            <LogOut aria-hidden />
            Se déconnecter
          </Button>
        </form>
      </div>
    </>
  );
}
