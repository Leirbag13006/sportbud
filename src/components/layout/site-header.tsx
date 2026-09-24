"use client";

import { Plus } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { Logo } from "@/components/layout/logo";
import { NavBadge } from "@/components/layout/nav-badge";
import { Button } from "@/components/ui/button";
import { NAV_ITEMS, getCreateActivityHref, isNavItemActive, type NavBadges } from "@/config/navigation";
import { cn } from "@/lib/utils";

interface SiteHeaderProps {
  badges?: NavBadges;
  className?: string;
}

/** En-tête sombre du site (tablette et desktop) : logo, navigation et bouton de création. */
export function SiteHeader({ badges = {}, className }: SiteHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <header className={cn("z-30 shrink-0 border-b border-night-700 bg-night-950", className)}>
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between gap-6 px-6">
        <Logo variant="dark" size="sm" />

        <div className="flex items-center gap-2">
          <nav aria-label="Navigation principale">
            <ul className="flex items-center gap-1">
              {NAV_ITEMS.map(({ href, label, icon: Icon, badgeKey }) => {
                const active = isNavItemActive(pathname, href);

                return (
                  <li key={href}>
                    <Link
                      href={href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex h-10 items-center gap-2 rounded-lg px-3.5 font-display text-sm font-semibold transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring",
                        active ? "bg-night-800 text-mint-500" : "text-white/70 hover:bg-night-800 hover:text-white",
                      )}
                    >
                      <Icon className="size-4" strokeWidth={active ? 2.25 : 2} aria-hidden />
                      {label}
                      <NavBadge count={badgeKey ? (badges[badgeKey] ?? 0) : 0} className="ring-night-950" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <Button className="ml-2" onClick={() => router.push(getCreateActivityHref())}>
            <Plus aria-hidden />
            Créer une activité
          </Button>
        </div>
      </div>
    </header>
  );
}
