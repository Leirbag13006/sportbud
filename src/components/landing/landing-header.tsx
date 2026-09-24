"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Logo } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const ANCHORS = [
  { href: "#fonctionnement", label: "Comment ça marche" },
  { href: "#fonctionnalites", label: "Fonctionnalités" },
  { href: "#sports", label: "Sports" },
  { href: "#faq", label: "Questions" },
];

/** En-tête de la landing : transparent sur le hero, puis fond nuit flouté au défilement. */
export function LandingHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-40 pt-[env(safe-area-inset-top)] transition-colors duration-250 ease-brand",
        scrolled ? "border-b border-white/10 bg-night-950/85 backdrop-blur-md" : "bg-transparent",
      )}
    >
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between gap-3 px-[clamp(16px,4vw,40px)] sm:gap-6 md:h-20">
        <Logo variant="dark" size="sm" href="/register" />

        <nav aria-label="Sections de la page" className="hidden lg:block">
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

        <div className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/login#acces"
            className="rounded-lg px-3 py-2 font-display text-sm font-semibold whitespace-nowrap text-white/85 transition-colors outline-none hover:text-white focus-visible:ring-3 focus-visible:ring-ring"
          >
            Se connecter
          </Link>
          {/* Mobile : le formulaire d'inscription est juste en dessous, et la barre d'action du bas prend le relais. */}
          <Button size="sm" className="hidden h-10 px-4 text-sm sm:inline-flex" nativeButton={false} render={<Link href="/register#acces" />}>
            Commencer
          </Button>
        </div>
      </div>
    </header>
  );
}
