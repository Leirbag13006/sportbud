import { FileText } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Logo } from "@/components/layout/logo";
import { LEGAL_PAGES, getLegalPage } from "@/config/legal";

export function generateStaticParams() {
  return LEGAL_PAGES.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/legal/[slug]">): Promise<Metadata> {
  const page = getLegalPage((await params).slug);
  return page ? { title: `${page.title} ${page.accent.replace(/\.$/, "")}` } : {};
}

/** Document légal (page publique). Le texte définitif est en cours de rédaction. */
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
        </div>
      </header>

      <main className="mx-auto max-w-[1200px] px-[clamp(16px,4vw,40px)] py-10">
        <div className="flex max-w-xl items-start gap-4 rounded-card bg-card p-5 shadow-md">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-mint-100 text-mint-700">
            <FileText className="size-5" aria-hidden />
          </span>
          <div className="text-sm">
            <p className="font-display font-bold text-ink">Document en cours de rédaction</p>
            <p className="mt-1 text-pretty">La version complète sera publiée ici prochainement.</p>
          </div>
        </div>

        <nav aria-label="Autres documents" className="mt-10">
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
