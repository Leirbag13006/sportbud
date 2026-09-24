import type { Metadata } from "next";
import { CalendarDays, LogOut, Mail } from "lucide-react";

import { logout } from "@/app/(auth)/actions";
import { PageHeader } from "@/components/layout/page-header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getSportLevelLabel } from "@/config/sport-levels";
import { requireUser } from "@/lib/auth/session";
import { getInitials } from "@/lib/format";

export const metadata: Metadata = { title: "Profil" };

const memberSince = new Intl.DateTimeFormat("fr-FR", { month: "long", year: "numeric" });

/** Profil de l'utilisateur connecté. */
export default async function ProfilePage() {
  const user = await requireUser();

  return (
    <>
      <PageHeader title="Profil" description="Ton niveau, ta bio et tes activités." />

      <div className="mx-auto w-full max-w-3xl space-y-4 px-4 py-6 md:px-6">
        <Card>
          <CardContent className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
            <Avatar className="size-20 text-xl">
              {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt="" />}
              <AvatarFallback className="bg-brand-soft font-semibold text-primary">
                {getInitials(user.fullName)}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex flex-col items-center gap-2 sm:flex-row">
                <h2 className="truncate text-xl font-semibold">{user.fullName}</h2>
                <Badge variant="secondary">{getSportLevelLabel(user.sportLevel)}</Badge>
              </div>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li className="flex items-center justify-center gap-2 sm:justify-start">
                  <Mail className="size-4" aria-hidden />
                  {user.email}
                </li>
                <li className="flex items-center justify-center gap-2 sm:justify-start">
                  <CalendarDays className="size-4" aria-hidden />
                  Membre depuis {memberSince.format(user.createdAt)}
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-1">
            <h2 className="text-sm font-medium">Bio</h2>
            <p className="text-sm text-muted-foreground">
              {user.bio || "Pas encore de bio. Présente-toi pour rassurer tes futurs partenaires !"}
            </p>
          </CardContent>
        </Card>

        <form action={logout}>
          <Button type="submit" variant="outline" className="h-10 w-full sm:w-auto">
            <LogOut aria-hidden />
            Se déconnecter
          </Button>
        </form>
      </div>
    </>
  );
}
