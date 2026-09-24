import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = { title: "Messages" };

/** Aucune conversation ouverte : visible sur desktop, à droite de la liste. */
export default function MessagesPage() {
  return (
    <div className="flex flex-1 items-center justify-center p-8">
      <div className="max-w-sm text-center">
        <div className="relative mx-auto aspect-[4/3] w-64 overflow-hidden rounded-block shadow-md">
          <Image src="/images/friends-celebrate.jpg" alt="" fill sizes="256px" className="sl-photo object-cover" />
        </div>
        <h2 className="sl-bar mt-6 text-xl font-extrabold [&::after]:mx-auto">
          Tes <span className="text-brand-text">conversations.</span>
        </h2>
        <p className="mt-3 text-sm">
          Sélectionne une conversation pour discuter avec ton partenaire, fixer un lieu, un horaire… et c&apos;est
          parti !
        </p>
      </div>
    </div>
  );
}
