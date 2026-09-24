"use client";

import Link from "next/link";

import { Emoji } from "@/components/brand/sport-icon";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { EarnedBadge } from "@/lib/achievements/definitions";
import { AchievementMedal } from "./achievements-grid";

interface AchievementUnlockedDialogProps {
  achievements: EarnedBadge[];
  onClose: () => void;
}

/** Fenêtre de célébration quand un ou plusieurs succès (ou paliers) sont débloqués. */
export function AchievementUnlockedDialog({ achievements, onClose }: AchievementUnlockedDialogProps) {
  const [first] = achievements;
  const several = achievements.length > 1;

  return (
    <Dialog open={achievements.length > 0} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="overflow-hidden sm:max-w-sm" showCloseButton={false}>
        {first && (
          <>
            {/* Halo et confettis décoratifs */}
            <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-hero opacity-95" />
            <Emoji name="party" className="pointer-events-none absolute top-4 left-5 size-10 -rotate-12 motion-safe:animate-bounce" />
            <Emoji name="sparkles" className="pointer-events-none absolute top-6 right-6 size-8 motion-safe:animate-pulse" />

            <DialogHeader className="relative items-center pt-6 text-center">
              <div className="motion-safe:animate-in motion-safe:zoom-in-50 motion-safe:duration-500">
                <AchievementMedal emoji={first.emoji} tier={first.tier} hasTiers={first.tierLabel !== null} size="lg" />
              </div>
              <p className="mt-4 font-display text-xs font-bold tracking-eyebrow text-brand-text uppercase">
                {several ? `${achievements.length} succès débloqués` : "Succès débloqué"}
              </p>
              <DialogTitle className="text-2xl font-black">
                {first.title}
                {first.tierLabel && <span className="text-brand-text"> · {first.tierLabel}</span>}
              </DialogTitle>
              <DialogDescription>Bravo ! Continue comme ça, ta régularité inspire confiance aux autres membres.</DialogDescription>
            </DialogHeader>

            {several && (
              <ul className="relative flex flex-wrap justify-center gap-2">
                {achievements.slice(1).map((badge) => (
                  <li key={badge.id} className="flex items-center gap-1.5 rounded-full bg-mint-100 py-0.5 pr-3 pl-0.5 text-xs font-semibold text-mint-700">
                    <AchievementMedal emoji={badge.emoji} tier={badge.tier} hasTiers={badge.tierLabel !== null} size="sm" />
                    {badge.title}
                    {badge.tierLabel && ` · ${badge.tierLabel}`}
                  </li>
                ))}
              </ul>
            )}

            <DialogFooter className="relative flex-col gap-2 sm:flex-col">
              <Button className="w-full" onClick={onClose} nativeButton={false} render={<Link href="/profile#achievements-title" />}>
                Voir mes succès
              </Button>
              <Button variant="ghost" className="w-full" onClick={onClose}>
                Super, merci !
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
