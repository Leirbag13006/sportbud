import { Check } from "lucide-react";

import { Emoji } from "@/components/brand/sport-icon";
import { TIERS, type AchievementState, type EarnedBadge, type Tier } from "@/lib/achievements/definitions";
import { cn } from "@/lib/utils";

/** Contour de couleur selon le palier atteint (bronze, argent, or). */
const TIER_RING: Record<number, string> = {
  1: "border-tier-1",
  2: "border-tier-2",
  3: "border-tier-3",
};

/** Pictogramme du succès entouré de la couleur du palier, avec la médaille correspondante. */
export function AchievementMedal({
  emoji,
  tier,
  hasTiers,
  locked = false,
  size = "md",
}: {
  emoji: EarnedBadge["emoji"];
  tier: number;
  hasTiers: boolean;
  locked?: boolean;
  size?: "xs" | "sm" | "md" | "lg";
}) {
  const sizes = {
    xs: { box: "size-6 border-[1.5px]", emoji: "size-4", medal: "size-3 -right-1 -bottom-1" },
    sm: { box: "size-9 border-2", emoji: "size-6", medal: "size-4 -right-1 -bottom-1" },
    md: { box: "size-16 border-[3px]", emoji: "size-10", medal: "size-6 -right-1 -bottom-1" },
    lg: { box: "size-28 border-4", emoji: "size-18", medal: "size-10 -right-1 -bottom-1" },
  }[size];

  return (
    <span
      className={cn(
        "relative flex shrink-0 items-center justify-center rounded-full bg-card",
        sizes.box,
        locked ? "border-sand-100" : hasTiers ? TIER_RING[tier] : "border-mint-500",
      )}
    >
      <Emoji name={emoji} className={cn(sizes.emoji, locked && "opacity-35 grayscale")} />
      {!locked && hasTiers && (
        <Emoji name={TIERS[tier as Tier].emoji} className={cn("absolute", sizes.medal)} />
      )}
    </span>
  );
}

/** Grille des succès : palier atteint, progression vers le suivant. */
export function AchievementsGrid({ achievements }: { achievements: AchievementState[] }) {
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {achievements.map((achievement) => {
        const tiered = achievement.maxTier > 1;
        const complete = achievement.nextGoal === null;
        const previousGoalReached = achievement.value;
        return (
          <li
            key={achievement.id}
            className={cn(
              "relative flex flex-col items-center rounded-card border p-4 text-center",
              achievement.unlocked ? "border-mint-500/40 bg-mint-100/40" : "border-sand-100 bg-sand-50",
            )}
          >
            {complete && (
              <span className="absolute top-2 right-2 flex size-5 items-center justify-center rounded-full bg-mint-500 text-night-950">
                <Check className="size-3" strokeWidth={3} aria-hidden />
              </span>
            )}
            <AchievementMedal emoji={achievement.emoji} tier={achievement.tier} hasTiers={tiered} locked={!achievement.unlocked} />
            <p className="mt-3 font-display text-sm font-bold text-ink">{achievement.title}</p>
            {tiered && achievement.unlocked && (
              <p className="text-[11px] font-semibold tracking-wide text-gray-600 uppercase">
                {TIERS[achievement.tier as Tier].label}
              </p>
            )}
            <p className="mt-1 text-xs text-pretty">
              {complete ? (tiered ? "Palier or atteint, bravo !" : "Débloqué !") : achievement.description}
            </p>
            {!complete && (achievement.nextGoal ?? 0) > 1 && (
              <div className="mt-3 w-full">
                <div
                  role="progressbar"
                  aria-label={`Progression : ${previousGoalReached} sur ${achievement.nextGoal}`}
                  aria-valuemin={0}
                  aria-valuemax={achievement.nextGoal ?? 0}
                  aria-valuenow={Math.min(achievement.value, achievement.nextGoal ?? 0)}
                  className="h-1.5 overflow-hidden rounded-full bg-sand-100"
                >
                  <div
                    className="h-full rounded-full bg-mint-500"
                    style={{ width: `${Math.min(1, achievement.value / (achievement.nextGoal ?? 1)) * 100}%` }}
                  />
                </div>
                <p className="mt-1 text-[11px] text-gray-400">
                  {Math.min(achievement.value, achievement.nextGoal ?? 0)}/{achievement.nextGoal}
                  {tiered && ` · vers ${TIERS[(achievement.tier + 1) as Tier].label.toLowerCase()}`}
                </p>
              </div>
            )}
            <span className="sr-only">
              {achievement.unlocked
                ? `Débloqué${tiered ? `, palier ${TIERS[achievement.tier as Tier].label}` : ""}`
                : "Pas encore débloqué"}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

/** Rangée compacte de badges obtenus (fiches, cartes). */
export function BadgeRow({ badges, className }: { badges: EarnedBadge[]; className?: string }) {
  if (badges.length === 0) return null;
  return (
    <ul className={cn("flex flex-wrap justify-center gap-1.5", className)} aria-label="Badges obtenus">
      {badges.map((badge) => (
        <li
          key={badge.id}
          title={badge.tierLabel ? `${badge.title} · ${badge.tierLabel}` : badge.title}
          className="flex items-center gap-1.5 rounded-full bg-mint-100 py-0.5 pr-2.5 pl-0.5 text-xs font-semibold text-mint-700"
        >
          <AchievementMedal emoji={badge.emoji} tier={badge.tier} hasTiers={badge.tierLabel !== null} size="sm" />
          {badge.title}
          {badge.tierLabel && <span className="font-normal text-gray-600">· {badge.tierLabel}</span>}
        </li>
      ))}
    </ul>
  );
}
