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

/** Section titrée (barre menthe du design system), avec état vide. */
export function DashboardSection({ id, title, count, emptyMessage, isEmpty, children }: DashboardSectionProps) {
  return (
    <section aria-labelledby={id} className="space-y-4">
      <h2 id={id} className="sl-bar text-lg font-extrabold">
        <span className="flex items-center gap-2">
          {title}
          {count !== undefined && count > 0 && (
            <span className="rounded-full bg-mint-100 px-2 py-0.5 font-sans text-xs font-semibold text-mint-700">
              {count}
            </span>
          )}
        </span>
      </h2>
      {isEmpty ? (
        <p className="rounded-card border border-dashed border-input px-4 py-6 text-center text-sm">{emptyMessage}</p>
      ) : (
        children
      )}
    </section>
  );
}
