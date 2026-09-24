import Image from "next/image";

import type { SportType } from "@/db/schema";
import { cn } from "@/lib/utils";

/**
 * Pictogrammes 3D « Fluent Emoji » de Microsoft (licence MIT) : colorés, identiques sur tous les
 * appareils (contrairement aux emojis système). Fichiers WebP dans public/emoji/.
 */
export type EmojiName =
  | SportType
  | "search"
  | "handshake"
  | "speech"
  | "trophy"
  | "medal-gold"
  | "medal-silver"
  | "medal-bronze"
  | "star"
  | "fire"
  | "target"
  | "shoe"
  | "camera"
  | "people"
  | "compass"
  | "sparkles"
  | "calendar"
  | "party"
  | "map"
  | "lock";

export function getEmojiSrc(name: EmojiName) {
  return `/emoji/${name}.webp`;
}

interface EmojiProps {
  name: EmojiName;
  /** Taille via les classes Tailwind (ex. « size-6 ») ; 20 px par défaut. */
  className?: string;
  /** Texte alternatif ; vide (décoratif) par défaut. */
  alt?: string;
}

/** Pictogramme 3D (décoratif par défaut). */
export function Emoji({ name, className, alt = "" }: EmojiProps) {
  return (
    <Image
      src={getEmojiSrc(name)}
      alt={alt}
      aria-hidden={alt ? undefined : true}
      width={80}
      height={80}
      unoptimized
      draggable={false}
      className={cn("size-5 shrink-0 object-contain select-none", className)}
    />
  );
}

/** Pictogramme 3D d'un sport. */
export function SportIcon({ sport, className }: { sport: SportType; className?: string }) {
  return <Emoji name={sport} className={className} />;
}
