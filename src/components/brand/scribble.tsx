import type { CSSProperties } from "react";

import { cn } from "@/lib/utils";

/**
 * Traits « dessinés à la main » de la marque (menthe, trait arrondi, légèrement irréguliers).
 * Ils se tracent quand ils deviennent visibles : dans un <Reveal>, ou d'emblée hors Reveal.
 * Toujours décoratifs (aria-hidden).
 */
export type ScribbleKind = "underline" | "circle" | "arrow" | "arrow-curl" | "spark" | "zigzag";

const PATHS: Record<ScribbleKind, { viewBox: string; d: string[] }> = {
  underline: { viewBox: "0 0 300 24", d: ["M4 16 C 60 6, 120 4, 180 9 S 270 16, 296 8"] },
  circle: {
    viewBox: "0 0 300 110",
    d: ["M150 8 C 70 6, 10 26, 12 58 C 14 92, 90 104, 160 102 C 236 100, 292 82, 288 50 C 284 18, 214 4, 128 12"],
  },
  arrow: { viewBox: "0 0 120 90", d: ["M8 10 C 30 60, 60 78, 104 72", "M86 56 L 106 72 L 84 84"] },
  "arrow-curl": {
    viewBox: "0 0 140 110",
    d: ["M10 12 C 70 0, 96 40, 62 58 C 34 72, 44 30, 80 44 C 110 56, 116 82, 124 98", "M108 88 L 126 100 L 130 78"],
  },
  spark: { viewBox: "0 0 60 60", d: ["M30 6 L 30 20", "M30 40 L 30 54", "M6 30 L 20 30", "M40 30 L 54 30", "M13 13 L 21 21", "M39 39 L 47 47"] },
  zigzag: { viewBox: "0 0 200 30", d: ["M4 20 L 24 8 L 44 22 L 64 8 L 84 22 L 104 8 L 124 22 L 144 8 L 164 22 L 184 8 L 196 16"] },
};

interface ScribbleProps {
  kind: ScribbleKind;
  className?: string;
  /** Épaisseur du trait (unités du viewBox). */
  stroke?: number;
  /** Délai du tracé (ms). */
  delay?: number;
}

export function Scribble({ kind, className, stroke = 5, delay = 0 }: ScribbleProps) {
  const { viewBox, d } = PATHS[kind];
  return (
    <svg
      aria-hidden
      viewBox={viewBox}
      fill="none"
      preserveAspectRatio="none"
      className={cn("sl-scribble pointer-events-none overflow-visible text-mint-500", className)}
      style={{ "--scribble-delay": `${delay}ms` } as CSSProperties}
    >
      {d.map((path, index) => (
        <path
          key={index}
          d={path}
          stroke="currentColor"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
          style={{ "--scribble-index": index } as CSSProperties}
        />
      ))}
    </svg>
  );
}

/** Mot mis en valeur par un trait à la main (souligné ou entouré). */
export function Marked({ children, kind = "underline", className }: { children: React.ReactNode; kind?: "underline" | "circle"; className?: string }) {
  return (
    <span className={cn("relative inline-block whitespace-nowrap", className)}>
      {children}
      {kind === "underline" ? (
        <Scribble kind="underline" stroke={4} delay={350} className="absolute -bottom-[0.18em] left-0 h-[0.3em] w-full" />
      ) : (
        <Scribble kind="circle" stroke={3} delay={350} className="absolute -inset-x-[0.35em] -inset-y-[0.3em] h-[calc(100%+0.6em)] w-[calc(100%+0.7em)]" />
      )}
    </span>
  );
}

/** Annotation manuscrite (Caveat) avec une flèche dessinée, façon note dans la marge. */
export function Annotation({
  children,
  arrow = "arrow",
  arrowClassName,
  className,
  delay = 500,
}: {
  children: React.ReactNode;
  arrow?: "arrow" | "arrow-curl";
  arrowClassName?: string;
  className?: string;
  delay?: number;
}) {
  return (
    <span aria-hidden className={cn("pointer-events-none absolute flex font-script text-3xl leading-none text-mint-400 drop-shadow-[0_2px_6px_rgb(5_15_13/0.8)]", className)}>
      <span className="sl-annotation -rotate-6" style={{ "--scribble-delay": `${delay}ms` } as CSSProperties}>
        {children}
      </span>
      <Scribble kind={arrow} stroke={3} delay={delay + 200} className={cn("absolute size-16", arrowClassName)} />
    </span>
  );
}
