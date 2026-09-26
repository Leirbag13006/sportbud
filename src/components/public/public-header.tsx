import Link from "next/link";

import { Logo } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";

/** En-tête des pages publiques (séances) : connexion / inscription, ou retour à l'app pour un membre. */
export function PublicHeader({ isMember, next }: { isMember: boolean; next?: string }) {
  const query = next ? `?next=${encodeURIComponent(next)}` : "";
  return (
    <header className="sl-dark relative z-10 border-b border-night-700 bg-night-950">
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between gap-3 px-[clamp(16px,4vw,40px)]">
        <Logo variant="dark" size="sm" href="/" />
        <nav aria-label="Navigation" className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/seances"
            className="hidden rounded-lg px-3 py-2 font-display text-sm font-semibold text-white/80 outline-none hover:text-white focus-visible:ring-3 focus-visible:ring-ring sm:block"
          >
            Séances
          </Link>
          {isMember ? (
            <Button size="sm" className="h-10 px-4 text-sm" nativeButton={false} render={<Link href="/" />}>
              Ouvrir l&apos;app
            </Button>
          ) : (
            <>
              <Link
                href={`/login${query}`}
                className="rounded-lg px-3 py-2 font-display text-sm font-semibold whitespace-nowrap text-white/85 outline-none hover:text-white focus-visible:ring-3 focus-visible:ring-ring"
              >
                Se connecter
              </Link>
              <Button size="sm" className="h-10 px-4 text-sm" nativeButton={false} render={<Link href={`/register${query}`} />}>
                S&apos;inscrire
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
