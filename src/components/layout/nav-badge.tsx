import { cn } from "@/lib/utils";

interface NavBadgeProps {
  count: number;
  className?: string;
}

/** Pastille rouge de notification ; affiche « 9+ » au-delà de 9 pour rester compacte. */
export function NavBadge({ count, className }: NavBadgeProps) {
  if (count <= 0) return null;

  return (
    <span
      className={cn(
        "flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-destructive px-1 text-[10px] leading-none font-semibold text-white ring-2 ring-background",
        className,
      )}
    >
      {count > 9 ? "9+" : count}
      <span className="sr-only"> non lus</span>
    </span>
  );
}
