import Link from "next/link";

import { cn } from "@/lib/utils";

type LogoVariant = "dark" | "light";

/**
 * Couleurs du logo selon le fond (design-system/logo) :
 * - dark  : silhouette blanche + menthe, sur fond sombre (version principale) ;
 * - light : silhouette nuit + mint-600, sur fond clair.
 */
const COLORS: Record<LogoVariant, { base: string; accent: string; hole: string; word: string }> = {
  dark: {
    base: "var(--color-white, #fff)",
    accent: "var(--color-mint-500)",
    hole: "var(--color-night-900)",
    word: "text-white",
  },
  light: {
    base: "var(--color-night-900)",
    accent: "var(--color-mint-600)",
    hole: "#fff",
    word: "text-ink",
  },
};

/** Pictogramme SportMates : deux silhouettes autour d'un pin, posées sur un terrain. */
export function LogoIcon({ variant = "dark", className }: { variant?: LogoVariant; className?: string }) {
  const { base, accent, hole } = COLORS[variant];

  return (
    <svg viewBox="0 0 120 120" aria-hidden="true" className={className}>
      <g stroke={accent} strokeWidth="4" strokeLinecap="round">
        <line x1="60" y1="6" x2="60" y2="16" />
        <line x1="47" y1="10" x2="51" y2="19" />
        <line x1="73" y1="10" x2="69" y2="19" />
      </g>
      <ellipse cx="60" cy="94" rx="46" ry="15" fill="none" stroke={accent} strokeWidth="6" />
      <ellipse cx="60" cy="94" rx="22" ry="6" fill="none" stroke={accent} strokeWidth="3" opacity=".7" />
      <circle cx="30" cy="30" r="9" fill={base} />
      <path d="M40 38 C 30 42, 22 52, 20 64 C 18 74, 22 82, 30 86 C 26 76, 28 66, 36 58 C 42 52, 48 50, 52 50 Z" fill={base} />
      <path d="M40 40 C 44 34, 50 28, 56 24" stroke={base} strokeWidth="6" strokeLinecap="round" fill="none" />
      <circle cx="90" cy="30" r="9" fill={accent} />
      <path d="M80 38 C 90 42, 98 52, 100 64 C 102 74, 98 82, 90 86 C 94 76, 92 66, 84 58 C 78 52, 72 50, 68 50 Z" fill={accent} />
      <path d="M80 40 C 76 34, 70 28, 64 24" stroke={accent} strokeWidth="6" strokeLinecap="round" fill="none" />
      <path d="M60 46 C 50.6 46 43 53.6 43 63 C 43 75 60 90 60 90 C 60 90 77 75 77 63 C 77 53.6 69.4 46 60 46 Z" fill={base} />
      <circle cx="60" cy="63" r="6.5" fill={hole} />
    </svg>
  );
}

const SIZES = {
  sm: { icon: "size-8", word: "text-xl", tagline: "text-[8px]" },
  md: { icon: "size-10", word: "text-2xl", tagline: "text-[9px]" },
  lg: { icon: "size-16", word: "text-4xl md:text-5xl", tagline: "text-[11px] md:text-xs" },
} as const;

interface LogoProps {
  variant?: LogoVariant;
  size?: keyof typeof SIZES;
  /** Affiche la signature « Bouge. Rencontre. Partage. ». */
  withTagline?: boolean;
  /** Lien vers l'accueil (par défaut) ; null pour un logo non cliquable. */
  href?: string | null;
  className?: string;
}

/** Logo complet SportMates : pictogramme + « Sport » + « Mates » (Montserrat Black Italic). */
export function Logo({ variant = "dark", size = "sm", withTagline = false, href = "/", className }: LogoProps) {
  const sizes = SIZES[size];
  const content = (
    <>
      <LogoIcon variant={variant} className={cn("shrink-0", sizes.icon)} />
      <span className="flex flex-col">
        <span className={cn("font-display leading-none font-black tracking-tight italic", sizes.word, COLORS[variant].word)}>
          Sport<span className={variant === "dark" ? "text-mint-500" : "text-mint-600"}>Mates</span>
        </span>
        {withTagline && (
          <span
            className={cn(
              "sl-tagline mt-1.5 font-sans",
              sizes.tagline,
              variant === "dark" ? "text-white/80" : "text-gray-600",
            )}
          >
            Bouge. Rencontre. Partage.
          </span>
        )}
      </span>
    </>
  );

  const classes = cn("flex w-fit items-center gap-2", className);
  if (!href) return <span className={classes}>{content}</span>;

  return (
    <Link
      href={href}
      aria-label="SportMates, accueil"
      className={cn(classes, "rounded-md outline-none focus-visible:ring-3 focus-visible:ring-ring")}
    >
      {content}
    </Link>
  );
}
