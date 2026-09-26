import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { PhotoBackdrop } from "@/components/brand/photo-backdrop";
import { Logo } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Page introuvable" };

/** Page 404 : lien cassé, activité supprimée, adresse mal saisie. */
export default function NotFound() {
  return (
    <div className="sl-dark relative flex min-h-dvh flex-col overflow-hidden">
      <PhotoBackdrop src="/sports/football.jpg" veil="left" />
      <header className="relative mx-auto w-full max-w-[1200px] px-[clamp(16px,4vw,40px)] pt-6">
        <Logo variant="dark" size="sm" href="/" />
      </header>
      <main className="relative mx-auto flex w-full max-w-[1200px] flex-1 flex-col justify-center px-[clamp(16px,4vw,40px)] py-16">
        <p className="font-display text-7xl font-black text-mint-500 md:text-9xl">404</p>
        <h1 className="sl-bar mt-4 max-w-xl text-3xl font-extrabold text-balance md:text-5xl">
          Hors-jeu : cette page <span className="text-mint-500">n&apos;existe pas.</span>
        </h1>
        <p className="mt-6 max-w-md text-pretty">
          Le lien est peut-être cassé, ou la séance a été supprimée. Retourne sur le terrain, il y a sûrement une place
          pour toi.
        </p>
        <div className="mt-8">
          <Button size="lg" nativeButton={false} render={<Link href="/" />}>
            Retour à l&apos;accueil
            <ArrowRight aria-hidden />
          </Button>
        </div>
      </main>
    </div>
  );
}
