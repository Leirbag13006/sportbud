import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Logo } from "@/components/layout/logo";
import { LEGAL_LAST_UPDATED, LEGAL_PAGES, getLegalPage } from "@/config/legal";

export function generateStaticParams() {
  return LEGAL_PAGES.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/legal/[slug]">): Promise<Metadata> {
  const page = getLegalPage((await params).slug);
  return page ? { title: `${page.title} ${page.accent.replace(/\.$/, "")}` } : {};
}

/** Document légal (page publique), contenu défini dans src/config/legal.ts. */
export default async function LegalPage({ params }: PageProps<"/legal/[slug]">) {
  const page = getLegalPage((await params).slug);
  if (!page) notFound();

  return (
    <div className="min-h-dvh bg-sand-50">
      <header className="sl-dark">
        <div className="mx-auto max-w-[1200px] px-[clamp(16px,4vw,40px)] pt-6 pb-12">
          <Logo variant="dark" size="sm" href="/" />
          <h1 className="sl-bar mt-10 text-3xl font-extrabold md:text-4xl">
            {page.title} <span className="text-mint-500">{page.accent}</span>
          </h1>
          <p className="mt-4 max-w-xl text-pretty">{page.summary}</p>
          <p className="mt-2 text-sm text-white/60">Dernière mise à jour : {LEGAL_LAST_UPDATED}</p>
        </div>
      </header>

      <main className="mx-auto max-w-[1200px] px-[clamp(16px,4vw,40px)] py-10">
        <article className="max-w-2xl space-y-8">
          {page.sections.map(({ heading, paragraphs }) => (
            <section key={heading}>
              <h2 className="text-lg font-bold text-ink md:text-xl">{heading}</h2>
              {paragraphs.map((paragraph) => (
                <p key={paragraph} className="mt-3 leading-relaxed text-pretty">
                  {paragraph}
                </p>
              ))}
            </section>
          ))}
        </article>

        <nav aria-label="Autres documents" className="mt-12 border-t border-sand-100 pt-6">
          <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            {LEGAL_PAGES.filter(({ slug }) => slug !== page.slug).map(({ slug, title, accent }) => (
              <li key={slug}>
                <Link href={`/legal/${slug}`} className="text-brand-text underline-offset-4 hover:underline">
                  {title} {accent.replace(/\.$/, "")}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <Link href="/" className="mt-8 inline-block font-display font-bold text-brand-text hover:underline">
          ← Retour à l&apos;accueil
        </Link>
      </main>
    </div>
  );
}
