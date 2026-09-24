import { Check } from "lucide-react";

import { Emoji } from "@/components/brand/sport-icon";
import type { AchievementState } from "@/lib/achievements/definitions";
import { cn } from "@/lib/utils";

/** Grille des succès : débloqués en couleur, les autres grisés avec leur progression. */
export function AchievementsGrid({ achievements }: { achievements: AchievementState[] }) {
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {achievements.map((achievement) => (
        <li
          key={achievement.id}
          className={cn(
            "relative flex flex-col items-center rounded-card border p-4 text-center transition-colors",
            achievement.unlocked ? "border-mint-500/50 bg-mint-100/50" : "border-sand-100 bg-sand-50",
          )}
        >
          {achievement.unlocked && (
            <span className="absolute top-2 right-2 flex size-5 items-center justify-center rounded-full bg-mint-500 text-night-950">
              <Check className="size-3" strokeWidth={3} aria-hidden />
            </span>
          )}
          <Emoji
            name={achievement.emoji}
            className={cn("size-12", !achievement.unlocked && "opacity-40 grayscale")}
          />
          <p className="mt-2 font-display text-sm font-bold text-ink">{achievement.title}</p>
          <p className="mt-0.5 text-xs text-pretty">{achievement.description}</p>
          {!achievement.unlocked && achievement.goal > 1 && (
            <div className="mt-3 w-full">
              <div
                role="progressbar"
                aria-label={`Progression : ${achievement.progress} sur ${achievement.goal}`}
                aria-valuemin={0}
                aria-valuemax={achievement.goal}
                aria-valuenow={achievement.progress}
                className="h-1.5 overflow-hidden rounded-full bg-sand-100"
              >
                <div className="h-full rounded-full bg-mint-500" style={{ width: `${(achievement.progress / achievement.goal) * 100}%` }} />
              </div>
              <p className="mt-1 text-[11px] text-gray-400">
                {achievement.progress}/{achievement.goal}
              </p>
            </div>
          )}
          <span className="sr-only">{achievement.unlocked ? "Débloqué" : "Pas encore débloqué"}</span>
        </li>
      ))}
    </ul>
  );
}

/** Rangée compacte des badges débloqués (fiches membres). */
export function BadgeRow({ achievements, className }: { achievements: AchievementState[]; className?: string }) {
  if (achievements.length === 0) return null;
  return (
    <ul className={cn("flex flex-wrap justify-center gap-1.5", className)} aria-label="Badges obtenus">
      {achievements.map((achievement) => (
        <li
          key={achievement.id}
          title={`${achievement.title} : ${achievement.description}`}
          className="flex items-center gap-1 rounded-full bg-mint-100 py-0.5 pr-2.5 pl-1 text-xs font-semibold text-mint-700"
        >
          <Emoji name={achievement.emoji} className="size-5" />
          {achievement.title}
        </li>
      ))}
    </ul>
  );
}
