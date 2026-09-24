import { LogoIcon } from "@/components/layout/logo";
import { cn } from "@/lib/utils";

/**
 * Tampon rond : la signature écrite en cercle, qui tourne lentement autour du pictogramme.
 * Décoratif ; rotation coupée si « mouvement réduit ».
 */
export function Stamp({ className, text = "Bouge • Rencontre • Partage • " }: { className?: string; text?: string }) {
  return (
    <div aria-hidden className={cn("relative size-32 rounded-full bg-night-950 text-mint-500 shadow-lg ring-1 ring-mint-500/40", className)}>
      <svg viewBox="0 0 200 200" className="sl-spin absolute inset-0 size-full">
        <defs>
          <path id="stamp-circle" d="M100 100 m -76 0 a 76 76 0 1 1 152 0 a 76 76 0 1 1 -152 0" />
        </defs>
        {/* textLength = circonférence du cercle : le texte en fait exactement le tour, sans chevauchement. */}
        <text className="fill-current font-display text-[17px] font-extrabold uppercase">
          <textPath href="#stamp-circle" textLength={470} lengthAdjust="spacing">
            {text}
          </textPath>
        </text>
      </svg>
      <LogoIcon className="absolute inset-[30%] size-[40%]" />
    </div>
  );
}
