import { Check, Clock, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { Application } from "@/db/schema";
import { cn } from "@/lib/utils";

const STATUS_CONFIG = {
  pending: { label: "En attente", icon: Clock, className: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300" },
  accepted: { label: "Acceptée", icon: Check, className: "bg-brand-soft text-primary" },
  rejected: { label: "Refusée", icon: X, className: "bg-muted text-muted-foreground" },
} as const;

/** Pastille de statut d'une candidature. */
export function ApplicationStatusBadge({ status }: { status: Application["status"] }) {
  const { label, icon: Icon, className } = STATUS_CONFIG[status];
  return (
    <Badge variant="secondary" className={cn("gap-1", className)}>
      <Icon className="size-3" aria-hidden />
      {label}
    </Badge>
  );
}
