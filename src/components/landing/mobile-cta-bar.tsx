"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Bouton d'inscription collé en bas de l'écran sur mobile, affiché une fois le formulaire
 * du hero sorti de l'écran (appel à l'action toujours à portée de pouce).
 */
export function MobileCtaBar() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const target = document.getElementById("acces");
    if (!target) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(!entry?.isIntersecting && (entry?.boundingClientRect.top ?? 0) < 0));
    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      aria-hidden={!visible}
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-night-950/90 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-md transition-transform duration-250 ease-brand md:hidden",
        visible ? "translate-y-0" : "translate-y-full",
      )}
    >
      <Button className="w-full" tabIndex={visible ? 0 : -1} nativeButton={false} render={<Link href="/register#acces" />}>
        Créer mon compte gratuit
      </Button>
    </div>
  );
}
