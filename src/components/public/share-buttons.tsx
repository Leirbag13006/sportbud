"use client";

import { Check, Link2, Share2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ShareButtonsProps {
  /** Adresse complète de la page à partager. */
  url: string;
  /** Texte d'accompagnement (WhatsApp, partage natif). */
  text: string;
  className?: string;
}

/** Partage d'une séance : WhatsApp, partage natif du téléphone et copie du lien. */
export function ShareButtons({ url, text, className }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Lien copié !");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Impossible de copier le lien.");
    }
  };

  const share = async () => {
    if (!navigator.share) return copy();
    try {
      await navigator.share({ title: "SportMates", text, url });
    } catch {
      // Partage annulé : rien à faire.
    }
  };

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      <Button
        variant="outline"
        nativeButton={false}
        render={
          <a href={`https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`} target="_blank" rel="noopener noreferrer" />
        }
      >
        <Share2 aria-hidden />
        WhatsApp
      </Button>
      <Button variant="outline" onClick={share} className="sm:hidden">
        <Share2 aria-hidden />
        Partager
      </Button>
      <Button variant="outline" onClick={copy}>
        {copied ? <Check aria-hidden /> : <Link2 aria-hidden />}
        {copied ? "Copié" : "Copier le lien"}
      </Button>
    </div>
  );
}
