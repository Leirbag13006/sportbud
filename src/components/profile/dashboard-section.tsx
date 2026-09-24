import type { ReactNode } from "react";

interface DashboardSectionProps {
  id: string;
  title: string;
  /** Compteur affiché à côté du titre. */
  count?: number;
  /** Message affiché quand la section est vide. */
  emptyMessage: string;
  isEmpty: boolean;
  children: ReactNode;
}

/** Section titrée du tableau de bord du profil, avec état vide. */
export function DashboardSection({ id, title, count, emptyMessage, isEmpty, children }: DashboardSectionProps) {
  return (
    <section aria-labelledby={id} className="space-y-3">
      <h2 id={id} className="flex items-center gap-2 text-base font-semibold">
        {title}
        {count !== undefined && count > 0 && (
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">{count}</span>
        )}
      </h2>
      {isEmpty ? (
        <p className="rounded-xl border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
          {emptyMessage}
        </p>
      ) : (
        children
      )}
    </section>
  );
}
