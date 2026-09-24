import type { Metadata } from "next";
import { CalendarDays, LogOut, Mail } from "lucide-react";

import { logout } from "@/app/(auth)/actions";
import { PageHeader } from "@/components/layout/page-header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getSportLevelLabel } from "@/config/sport-levels";
import { requireProfile } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Profil" };

/** Initiales affichées quand il n'y a pas de photo (« Camille Martin » → « CM »). */
function getInitials(fullName: string) {
  return fullName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join("");
}

const memberSince = new Intl.DateTimeFormat("fr-FR", { month: "long", year: "numeric" });

/** Profil de l'utilisateur connecté. */
export default async function ProfilePage() {
  const { user, profile } = await requireProfile();

  return (
    <>
      <PageHeader title="Profil" description="Ton niveau, ta bio et tes activités." />

      <div className="mx-auto w-full max-w-3xl space-y-4 px-4 py-6 md:px-6">
        <Card>
          <CardContent className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
            <Avatar className="size-20 text-xl">
              {profile.avatar_url && <AvatarImage src={profile.avatar_url} alt="" />}
              <AvatarFallback className="bg-brand-soft font-semibold text-primary">
                {getInitials(profile.full_name)}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex flex-col items-center gap-2 sm:flex-row">
                <h2 className="truncate text-xl font-semibold">{profile.full_name}</h2>
                <Badge variant="secondary">{getSportLevelLabel(profile.sport_level)}</Badge>
              </div>
              <ul className="space-y-1 text-sm text-muted-foreground">
                {user.email && (
                  <li className="flex items-center justify-center gap-2 sm:justify-start">
                    <Mail className="size-4" aria-hidden />
                    {user.email}
                  </li>
                )}
                <li className="flex items-center justify-center gap-2 sm:justify-start">
                  <CalendarDays className="size-4" aria-hidden />
                  Membre depuis {memberSince.format(new Date(profile.created_at))}
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-1">
            <h2 className="text-sm font-medium">Bio</h2>
            <p className="text-sm text-muted-foreground">
              {profile.bio || "Pas encore de bio. Présente-toi pour rassurer tes futurs partenaires !"}
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
