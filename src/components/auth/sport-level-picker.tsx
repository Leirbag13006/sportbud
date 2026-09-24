import { cn } from "@/lib/utils";
import { SPORT_LEVELS } from "@/config/sport-levels";
import type { SportLevel } from "@/types/database";

interface SportLevelPickerProps {
  name: string;
  defaultValue?: SportLevel | string;
  invalid?: boolean;
  describedBy?: string;
}

/**
 * Choix du niveau sous forme de cartes radio (boutons radio natifs, accessibles au clavier).
 * À placer dans un <fieldset> avec une <legend>.
 */
export function SportLevelPicker({ name, defaultValue, invalid, describedBy }: SportLevelPickerProps) {
  return (
    <div className="grid gap-2 sm:grid-cols-3">
      {SPORT_LEVELS.map((level) => (
        <label
          key={level.value}
          className={cn(
            "flex cursor-pointer flex-col gap-0.5 rounded-lg border p-3 transition-colors hover:bg-muted has-checked:border-primary has-checked:bg-brand-soft has-focus-visible:ring-3 has-focus-visible:ring-ring/50",
            invalid && "border-destructive",
          )}
        >
          <input
            type="radio"
            name={name}
            value={level.value}
            defaultChecked={defaultValue === level.value}
            aria-describedby={describedBy}
            className="sr-only"
          />
          <span className="text-sm font-medium">{level.label}</span>
          <span className="text-xs text-muted-foreground">{level.description}</span>
        </label>
      ))}
    </div>
  );
}
