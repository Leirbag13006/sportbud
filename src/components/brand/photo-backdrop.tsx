import Image from "next/image";

import { cn } from "@/lib/utils";

type Veil = "left" | "full" | "bottom";

interface PhotoBackdropProps {
  src: string;
  /** Flou de la photo : aucun, léger (ambiance) ou fort (fond derrière du contenu dense). */
  blur?: "none" | "sm" | "md";
  /** Voile nuit : plus dense à gauche (texte à gauche), uniforme, ou en fondu vers le bas. */
  veil?: Veil;
  /** Fond clair : photo pâle en bandeau, fondue vers le fond sable (au lieu d'un voile nuit). */
  tone?: "dark" | "light";
  /** Position de la photo (object-position), ex. « center 30% ». */
  position?: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
}

const VEILS: Record<Veil, string> = {
  left: "bg-linear-to-r from-night-950/92 via-night-950/70 to-night-950/40",
  full: "bg-night-950/72",
  bottom: "bg-linear-to-b from-night-950/45 via-night-950/70 to-night-950",
};

const BLURS = { none: "", sm: "scale-105 blur-[3px]", md: "scale-110 blur-md" } as const;

/**
 * Fond photo de la marque : photo en noir et blanc (classe sl-photo), flou optionnel, voile nuit,
 * halo menthe et grain. Décoratif (aria-hidden) : à placer dans un parent `relative overflow-hidden`,
 * le contenu passant au-dessus avec `relative`.
 */
export function PhotoBackdrop({
  src,
  blur = "none",
  veil = "full",
  tone = "dark",
  position = "center",
  sizes = "100vw",
  priority,
  className,
}: PhotoBackdropProps) {
  if (tone === "light") {
    return (
      <div aria-hidden className={cn("pointer-events-none absolute inset-x-0 top-0 h-[70%] overflow-hidden", className)}>
        <Image
          src={src}
          alt=""
          fill
          sizes={sizes}
          priority={priority}
          className="sl-photo object-cover opacity-35 [mask-image:linear-gradient(to_bottom,black_25%,transparent)]"
          style={{ objectPosition: position }}
        />
        <div className="absolute inset-0 bg-linear-to-r from-sand-50/70 via-transparent to-transparent" />
      </div>
    );
  }

  return (
    <div aria-hidden className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      <Image
        src={src}
        alt=""
        fill
        sizes={sizes}
        priority={priority}
        className={cn("sl-photo object-cover", BLURS[blur])}
        style={{ objectPosition: position }}
      />
      <div className={cn("absolute inset-0", VEILS[veil])} />
      <div className="absolute inset-0 bg-radial-[60%_80%_at_0%_0%] from-mint-500/20 to-transparent to-60%" />
      <div className="sl-grain absolute inset-0" />
    </div>
  );
}
