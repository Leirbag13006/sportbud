import { Emoji } from "@/components/brand/sport-icon";
import type { SportType } from "@/db/schema";
import { cn } from "@/lib/utils";

const WORDS = ["Bouge.", "Rencontre.", "Partage."];
const SPORTS: SportType[] = ["football", "tennis", "running", "petanque", "basketball", "padel", "hiking", "volleyball", "climbing", "cycling", "swimming"];

/**
 * Bandeau défilant de la signature, ponctué d'émojis de sport, légèrement incliné.
 * Décoratif : la signature est déjà présente ailleurs en texte. Figé si « mouvement réduit ».
 */
export function Marquee({ className }: { className?: string }) {
  const items = SPORTS.map((sport, index) => ({ sport, word: WORDS[index % WORDS.length]! }));
  const run = (hidden: boolean) => (
    <ul aria-hidden={hidden || undefined} className="flex shrink-0 items-center gap-8 pr-8">
      {items.map(({ sport, word }, index) => (
        <li key={index} className="flex items-center gap-8">
          <span className="font-display text-3xl font-black tracking-tight whitespace-nowrap italic md:text-5xl">{word}</span>
          <Emoji name={sport} className="size-9 md:size-12" />
        </li>
      ))}
    </ul>
  );
  return (
    <div aria-hidden className={cn("relative z-10 -my-6 -rotate-2 overflow-hidden bg-mint-500 py-4 text-night-950 shadow-lg md:py-5", className)}>
      <div className="sl-marquee flex w-max">
        {run(false)}
        {run(true)}
      </div>
    </div>
  );
}
