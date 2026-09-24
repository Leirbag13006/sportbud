"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Logo } from "@/components/layout/logo";
import { NavBadge } from "@/components/layout/nav-badge";
import { NAV_ITEMS, isNavItemActive, type NavBadges } from "@/config/navigation";
import { cn } from "@/lib/utils";

interface SiteHeaderProps {
  badges?: NavBadges;
  className?: string;
}

/** En-tête du site avec la navigation principale, utilisé sur tablette et desktop. */
export function SiteHeader({ badges = {}, className }: SiteHeaderProps) {
  const pathname = usePathname();

  return (
    <header
      className={cn(
        "z-30 shrink-0 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80",
        className,
      )}
    >
      <div className="flex h-16 items-center justify-between gap-6 px-6">
        <Logo />

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
                      "flex h-9 items-center gap-2 rounded-full px-4 text-sm font-medium transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                      active
                        ? "bg-brand-soft text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    <Icon className="size-4" strokeWidth={active ? 2.5 : 2} aria-hidden />
                    {label}
                    <NavBadge count={badgeKey ? (badges[badgeKey] ?? 0) : 0} />
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </header>
  );
}
