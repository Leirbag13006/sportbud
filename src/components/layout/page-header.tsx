import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  /** Action optionnelle alignée à droite (bouton, menu…). */
  action?: ReactNode;
}

/** En-tête collant des pages à contenu défilant (Messages, Profil…). */
export function PageHeader({ title, action }: PageHeaderProps) {
  return (
    <header className="sticky top-0 z-10 box-content flex h-14 items-center justify-between border-b bg-background/95 px-4 pt-[env(safe-area-inset-top)] backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
      {action}
    </header>
  );
}
