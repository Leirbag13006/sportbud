"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { NavBadge } from "@/components/layout/nav-badge";
import { NAV_ITEMS, isNavItemActive, type NavBadges } from "@/config/navigation";
import { cn } from "@/lib/utils";

interface BottomNavProps {
  badges?: NavBadges;
  className?: string;
}

/** Barre de navigation fixe en bas d'écran, utilisée sur mobile. */
export function BottomNav({ badges = {}, className }: BottomNavProps) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navigation principale"
      className={cn(
        "shrink-0 border-t bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur supports-[backdrop-filter]:bg-background/80",
        className,
      )}
    >
      <ul className="grid h-(--bottom-nav-height) grid-cols-3">
        {NAV_ITEMS.map(({ href, label, icon: Icon, badgeKey }) => {
          const active = isNavItemActive(pathname, href);

          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-full flex-col items-center justify-center gap-1 text-xs font-medium transition-colors outline-none focus-visible:bg-muted",
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <span className="relative">
                  {/* Pastille de fond sur l'onglet actif */}
                  <span
                    className={cn(
                      "flex h-8 w-14 items-center justify-center rounded-full transition-colors",
                      active && "bg-brand-soft",
                    )}
                  >
                    <Icon className="size-5" strokeWidth={active ? 2.5 : 2} aria-hidden />
                  </span>
                  <NavBadge
                    count={badgeKey ? (badges[badgeKey] ?? 0) : 0}
                    className="absolute -top-1 right-1.5"
                  />
                </span>
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
