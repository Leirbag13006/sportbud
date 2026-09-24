import Link from "next/link";
import { Activity } from "lucide-react";

import { cn } from "@/lib/utils";

interface LogoProps {
  /** Version pour fond coloré (pictogramme blanc, texte clair). */
  inverted?: boolean;
}

/** Logo SportBud, cliquable vers la carte. */
export function Logo({ inverted = false }: LogoProps) {
  return (
    <Link
      href="/"
      className="relative flex w-fit items-center gap-2 rounded-md font-semibold tracking-tight outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <span
        className={cn(
          "flex size-8 items-center justify-center rounded-lg",
          inverted ? "bg-primary-foreground text-primary" : "bg-primary text-primary-foreground",
        )}
      >
        <Activity className="size-4.5" strokeWidth={2.5} aria-hidden />
      </span>
      <span className="text-lg">SportBud</span>
    </Link>
  );
}
