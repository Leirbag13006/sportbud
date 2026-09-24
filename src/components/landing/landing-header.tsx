import Link from "next/link";

import { Logo } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";

const ANCHORS = [
  { href: "#concept", label: "Le concept" },
  { href: "#comment-ca-marche", label: "Comment ça marche" },
  { href: "#sports", label: "Sports" },
  { href: "#communaute", label: "Communauté" },
];

/** En-tête de la landing : logo, ancres de navigation et accès connexion / inscription. */
export function LandingHeader() {
  return (
    <header className="absolute inset-x-0 top-0 z-30 pt-[env(safe-area-inset-top)]">
      <div className="mx-auto flex h-20 max-w-[1200px] items-center justify-between gap-6 px-[clamp(16px,4vw,40px)]">
        <Logo variant="dark" size="sm" href="/login" />

        <nav aria-label="Sections" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {ANCHORS.map(({ href, label }) => (
              <li key={href}>
                <a
                  href={href}
                  className="rounded-lg px-3 py-2 font-display text-sm font-semibold text-white/75 transition-colors outline-none hover:text-white focus-visible:ring-3 focus-visible:ring-ring"
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            className="hidden text-white hover:bg-white/10 hover:text-white sm:inline-flex"
            nativeButton={false}
            render={<Link href="/login" />}
          >
            Se connecter
          </Button>
          <Button nativeButton={false} render={<Link href="/register" />}>
            Rejoindre
          </Button>
        </div>
      </div>
    </header>
  );
}
