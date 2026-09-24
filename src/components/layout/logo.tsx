import Link from "next/link";
import { Activity } from "lucide-react";

/** Logo SportBud, cliquable vers la carte. */
export function Logo() {
  return (
    <Link
      href="/"
      className="flex items-center gap-2 rounded-md font-semibold tracking-tight outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <Activity className="size-4.5" strokeWidth={2.5} aria-hidden />
      </span>
      <span className="text-lg">SportBud</span>
    </Link>
  );
}
