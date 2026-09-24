import { CalendarCheck, MapPin, MessageCircle } from "lucide-react";

import { Logo } from "@/components/layout/logo";

const HIGHLIGHTS = [
  { icon: MapPin, text: "Repère les sessions de sport autour de toi sur la carte" },
  { icon: CalendarCheck, text: "Propose une activité en 30 secondes, choisis tes partenaires" },
  { icon: MessageCircle, text: "Organise-toi en direct par messagerie une fois accepté" },
];

/**
 * Pages de connexion / inscription : formulaire à droite, panneau de présentation
 * à gauche sur desktop. Pas de navigation principale (utilisateur non connecté).
 */
export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-primary p-12 text-primary-foreground lg:flex">
        {/* Halo décoratif */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 -right-32 size-[28rem] rounded-full bg-white/10 blur-3xl"
        />
        <Logo inverted />

        <div className="relative max-w-md space-y-8">
          <p className="text-4xl leading-tight font-semibold tracking-tight">
            Ne cherche plus de partenaire, trouve-le à côté de chez toi.
          </p>
          <ul className="space-y-4">
            {HIGHLIGHTS.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-start gap-3 text-primary-foreground/90">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white/15">
                  <Icon className="size-4" aria-hidden />
                </span>
                <span className="pt-1">{text}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-sm text-primary-foreground/70">
          Foot, tennis, running, padel… et bien d&apos;autres.
        </p>
      </aside>

      <main className="flex flex-col px-4 py-8 sm:px-8">
        <div className="lg:hidden">
          <Logo />
        </div>
        <div className="flex flex-1 items-center justify-center py-8">
          <div className="w-full max-w-sm">{children}</div>
        </div>
      </main>
    </div>
  );
}
