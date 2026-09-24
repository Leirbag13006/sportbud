"use client";

import { Plus } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { NavBadge } from "@/components/layout/nav-badge";
import { NAV_ITEMS, getCreateActivityHref, isNavItemActive, type NavBadges, type NavItem } from "@/config/navigation";
import { cn } from "@/lib/utils";

interface BottomNavProps {
  badges?: NavBadges;
  className?: string;
}

/**
 * Barre de navigation mobile (design system) : fond nuit, item actif en menthe,
 * bouton « + » central en cercle menthe plein pour créer une activité.
 */
export function BottomNav({ badges = {}, className }: BottomNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [first, second, ...rest] = NAV_ITEMS;

  return (
    <nav
      aria-label="Navigation principale"
      className={cn("shrink-0 border-t border-night-700 bg-night-950 pb-[env(safe-area-inset-bottom)]", className)}
    >
      <ul className="grid h-(--bottom-nav-height) grid-cols-5 items-center">
        {[first!, second!].map((item) => (
          <NavLink key={item.href} item={item} active={isNavItemActive(pathname, item.href)} badges={badges} />
        ))}
        <li className="flex justify-center">
          <button
            type="button"
            onClick={() => router.push(getCreateActivityHref())}
            aria-label="Créer une activité"
            className="-mt-6 flex size-14 items-center justify-center rounded-full bg-mint-500 text-night-950 shadow-glow ring-4 ring-night-950 transition-transform duration-150 ease-brand outline-none hover:bg-mint-400 focus-visible:ring-mint-300 active:scale-95"
          >
            <Plus className="size-7" strokeWidth={2.5} aria-hidden />
          </button>
        </li>
        {rest.map((item) => (
          <NavLink key={item.href} item={item} active={isNavItemActive(pathname, item.href)} badges={badges} />
        ))}
      </ul>
    </nav>
  );
}

function NavLink({ item, active, badges }: { item: NavItem; active: boolean; badges: NavBadges }) {
  const { href, label, icon: Icon, badgeKey } = item;

  return (
    <li className="h-full">
      <Link
        href={href}
        aria-current={active ? "page" : undefined}
        className={cn(
          "flex h-full flex-col items-center justify-center gap-1 font-display text-[11px] font-semibold transition-colors outline-none focus-visible:bg-night-800",
          active ? "text-mint-500" : "text-white/65 hover:text-white",
        )}
      >
        <span className="relative">
          <Icon className="size-6" strokeWidth={active ? 2.25 : 1.75} aria-hidden />
          <NavBadge count={badgeKey ? (badges[badgeKey] ?? 0) : 0} className="absolute -top-1.5 -right-2.5 ring-night-950" />
        </span>
        {label}
      </Link>
    </li>
  );
}
