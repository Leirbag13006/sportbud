"use client";

import { Star } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";

const LABELS = ["", "Très décevant", "Décevant", "Correct", "Bien", "Excellent"];

interface StarInputProps {
  name: string;
  value: number;
  onChange: (value: number) => void;
  invalid?: boolean;
}

/** Choix d'une note de 1 à 5 : boutons radio natifs (flèches du clavier) affichés en étoiles. */
export function StarInput({ name, value, onChange, invalid }: StarInputProps) {
  const [hovered, setHovered] = useState(0);
  const shown = hovered || value;

  return (
    <div className="flex items-center gap-3">
      <div
        role="radiogroup"
        aria-label="Note sur 5"
        aria-invalid={invalid}
        className="flex"
        onMouseLeave={() => setHovered(0)}
      >
        {[1, 2, 3, 4, 5].map((star) => (
          <label
            key={star}
            onMouseEnter={() => setHovered(star)}
            className="cursor-pointer rounded-md p-0.5 has-focus-visible:ring-3 has-focus-visible:ring-ring"
          >
            <input
              type="radio"
              name={name}
              value={star}
              checked={value === star}
              onChange={() => onChange(star)}
              aria-label={`${star} étoile${star > 1 ? "s" : ""} : ${LABELS[star]}`}
              className="sr-only"
            />
            <Star
              aria-hidden
              className={cn(
                "size-7 transition-transform duration-150 ease-brand",
                star <= shown ? "scale-105 text-sunset-500" : "text-gray-400/40",
              )}
              fill="currentColor"
              strokeWidth={0}
            />
          </label>
        ))}
      </div>
      <span className="min-w-24 text-sm font-medium text-ink" aria-live="polite">
        {LABELS[shown]}
      </span>
    </div>
  );
}
