import { Check, Clock, LogOut, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { Application } from "@/db/schema";
import { cn } from "@/lib/utils";

const STATUS_CONFIG = {
  pending: { label: "En attente", icon: Clock, className: "bg-sunset-300/45 text-ink" },
  accepted: { label: "Acceptée", icon: Check, className: "bg-brand-soft text-brand-text" },
  rejected: { label: "Refusée", icon: X, className: "bg-muted text-muted-foreground" },
  withdrawn: { label: "A quitté la séance", icon: LogOut, className: "bg-muted text-muted-foreground" },
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
