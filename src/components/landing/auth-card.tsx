"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

const TABS = [
  { href: "/login", label: "Connexion" },
  { href: "/register", label: "Inscription" },
];

/** Carte blanche du hero contenant le formulaire, avec onglets Connexion / Inscription. */
export function AuthCard({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div id="acces" className="sl-light scroll-mt-24 rounded-block bg-card p-6 shadow-lg ring-1 ring-black/5 sm:p-8">
      <nav aria-label="Accès à ton compte" className="mb-6 grid grid-cols-2 rounded-lg bg-sand-100 p-1">
        {TABS.map(({ href, label }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
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
      {children}
    </div>
  );
}
