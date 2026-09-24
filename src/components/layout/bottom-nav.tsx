"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { NAV_ITEMS, type NavBadgeKey } from "@/config/navigation";
import { cn } from "@/lib/utils";

interface BottomNavProps {
  /** Compteurs de notifications par onglet (branchés sur Supabase Realtime à l'étape 6). */
  badges?: Partial<Record<NavBadgeKey, number>>;
}

/** Un onglet est actif sur sa route exacte ou sur l'une de ses sous-routes. */
function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

/** Affiche « 9+ » au-delà de 9 pour garder un badge compact. */
function formatBadge(count: number) {
  return count > 9 ? "9+" : String(count);
}

export function BottomNav({ badges = {} }: BottomNavProps) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navigation principale"
      className="shrink-0 border-t bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur supports-[backdrop-filter]:bg-background/80"
    >
      <ul className="grid h-(--bottom-nav-height) grid-cols-3">
        {NAV_ITEMS.map(({ href, label, icon: Icon, badgeKey }) => {
          const active = isActive(pathname, href);
          const count = badgeKey ? (badges[badgeKey] ?? 0) : 0;

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

                  {count > 0 && (
                    <span className="absolute -top-1 right-1.5 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-destructive px-1 text-[10px] leading-none font-semibold text-white ring-2 ring-background">
                      {formatBadge(count)}
                    </span>
                  )}
                </span>
                <span>
                  {label}
                  {count > 0 && <span className="sr-only"> ({count} non lus)</span>}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
