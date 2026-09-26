"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, type ReactNode } from "react";

import { cn } from "@/lib/utils";

const TABS = [
  { href: "/login", label: "Connexion" },
  { href: "/register", label: "Inscription" },
];

/** Carte blanche du hero contenant le formulaire, avec onglets Connexion / Inscription. */
export function AuthCard({ children }: { children: ReactNode }) {
  return (
    <div id="acces" className="sl-light scroll-mt-24 rounded-block bg-card p-6 shadow-lg ring-1 ring-black/5 sm:p-8">
      {/* useSearchParams exige une frontière Suspense sur les pages statiques (mot de passe oublié). */}
      <Suspense fallback={<Tabs next={null} />}>
        <TabsWithNext />
      </Suspense>
      {children}
    </div>
  );
}

/** Conserve la page de retour (?next=…, ex. une séance partagée) en passant d'un onglet à l'autre. */
function TabsWithNext() {
  return <Tabs next={useSearchParams().get("next")} />;
}

function Tabs({ next }: { next: string | null }) {
  const pathname = usePathname();
  const query = next ? `?next=${encodeURIComponent(next)}` : "";

  return (
    <nav aria-label="Accès à ton compte" className="mb-6 grid grid-cols-2 rounded-lg bg-sand-100 p-1">
      {TABS.map(({ href, label }) => {
        // L'accueil des visiteurs (/) affiche l'inscription.
        const active = pathname === href || (pathname === "/" && href === "/register");
        return (
          <Link
            key={href}
            href={`${href}${query}`}
            scroll={false}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex h-10 items-center justify-center rounded-md font-display text-sm font-bold transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring",
              active ? "bg-card text-ink shadow-md" : "text-gray-600 hover:text-ink",
            )}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
