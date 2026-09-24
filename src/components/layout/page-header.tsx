import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  /** Fin du titre mise en valeur en menthe (règle du design system : « dernier mot en menthe »). */
  accent?: string;
  description?: string;
  /** Action optionnelle alignée à droite (bouton, menu…). */
  action?: ReactNode;
}

/**
 * En-tête de page sombre (dégradé nuit + halo menthe), titre Montserrat avec barre menthe.
 * Utilisé par les pages de contenu (Activités, Profil…).
 */
export function PageHeader({ title, accent, description, action }: PageHeaderProps) {
  return (
    <header className="sl-dark shrink-0 pt-[env(safe-area-inset-top)]">
      <div className="mx-auto flex w-full max-w-3xl items-end justify-between gap-4 px-4 pt-6 pb-7 md:px-6 md:pt-10 md:pb-10">
        <div>
          <h1 className="sl-bar text-2xl leading-tight font-extrabold md:text-4xl">
            {title}
            {accent && <span className="text-mint-500"> {accent}</span>}
          </h1>
          {description && <p className="mt-3 max-w-xl text-sm md:text-base">{description}</p>}
        </div>
        {action}
      </div>
    </header>
  );
}
