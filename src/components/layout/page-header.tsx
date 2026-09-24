import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  /** Action optionnelle alignée à droite (bouton, menu…). */
  action?: ReactNode;
}

/**
 * Titre des pages à contenu (Messages, Profil…).
 * Mobile : barre collante façon app. Desktop : titre de page classique, aligné sur le contenu.
 */
export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <header className="sticky top-0 z-10 border-b bg-background/95 pt-[env(safe-area-inset-top)] backdrop-blur supports-[backdrop-filter]:bg-background/80 md:static md:border-none md:bg-transparent md:pt-10 md:backdrop-blur-none">
      <div className="mx-auto flex min-h-14 w-full max-w-3xl items-center justify-between gap-4 px-4 md:px-6">
        <div>
          <h1 className="text-lg font-semibold tracking-tight md:text-3xl">{title}</h1>
          {description && (
            <p className="mt-1 hidden text-muted-foreground md:block">{description}</p>
          )}
        </div>
        {action}
      </div>
    </header>
  );
}
