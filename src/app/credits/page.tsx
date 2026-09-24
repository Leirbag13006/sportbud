import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { Logo } from "@/components/layout/logo";
import { PHOTO_CREDITS } from "@/config/photo-credits";

export const metadata: Metadata = { title: "Crédits photos" };

/** Page publique listant l'origine et la licence des photos du site. */
export default function CreditsPage() {
  return (
    <div className="min-h-dvh bg-sand-50">
      <header className="sl-dark">
        <div className="mx-auto max-w-[1200px] px-[clamp(16px,4vw,40px)] pt-6 pb-12">
          <Logo variant="dark" size="sm" href="/login" />
          <h1 className="sl-bar mt-10 text-3xl font-extrabold md:text-4xl">
            Crédits <span className="text-mint-500">photos.</span>
          </h1>
          <p className="mt-4 max-w-xl">
            Toutes les photos du site sont sous licence CC0 (domaine public) : libres d&apos;utilisation, sans
            attribution obligatoire. Merci à leurs auteurs.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-[1200px] px-[clamp(16px,4vw,40px)] py-10">
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PHOTO_CREDITS.map((credit) => (
            <li key={credit.file} className="flex gap-4 rounded-card bg-card p-3 shadow-md">
              <div className="relative size-20 shrink-0 overflow-hidden rounded-lg bg-muted">
                <Image src={credit.file} alt="" fill sizes="80px" className="object-cover" />
              </div>
              <div className="min-w-0 text-sm">
                <p className="truncate font-display font-bold text-ink">{credit.title || "Sans titre"}</p>
                <p className="truncate">{credit.author}</p>
                <a
                  href={credit.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-text underline-offset-4 hover:underline"
                >
                  Voir sur {credit.source}
                </a>
              </div>
            </li>
          ))}
        </ul>
        <Link href="/login" className="mt-10 inline-block font-display font-bold text-brand-text hover:underline">
          ← Retour à l&apos;accueil
        </Link>
      </main>
    </div>
  );
}
