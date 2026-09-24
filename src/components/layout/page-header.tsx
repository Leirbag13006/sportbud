import Image from "next/image";
import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  /** Fin du titre mise en valeur en menthe (règle du design system : « dernier mot en menthe »). */
  accent?: string;
  description?: string;
  /** Action optionnelle alignée à droite (bouton, menu…). */
  action?: ReactNode;
  /** Photo d'ambiance à droite, fondue dans la nuit (design system : jamais de bord dur). */
  image?: string;
}

/**
 * En-tête de page sombre (dégradé nuit + halo menthe), titre Montserrat avec barre menthe.
 * Utilisé par les pages de contenu (Activités, Profil…).
 */
export function PageHeader({ title, accent, description, action, image }: PageHeaderProps) {
  return (
    <header className="sl-dark relative shrink-0 overflow-hidden pt-[env(safe-area-inset-top)]">
      {image && (
        // Masque en dégradé : la photo se fond dans le fond (halo compris), sans bord visible.
        <div
          aria-hidden
          className="absolute inset-y-0 right-0 w-full [mask-image:linear-gradient(to_right,transparent,black_55%)] md:w-3/5"
        >
          <Image src={image} alt="" fill sizes="(min-width: 768px) 60vw, 100vw" className="object-cover" priority />
          <div className="absolute inset-0 bg-night-950/45" />
        </div>
      )}
      <div className="relative mx-auto flex w-full max-w-3xl items-end justify-between gap-4 px-4 pt-6 pb-7 md:px-6 md:pt-12 md:pb-12">
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
