"use client";

import { Share2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

/**
 * Partage le lien public d'une séance (/seances/…), consultable sans compte : partage natif
 * du téléphone (WhatsApp, SMS…) s'il existe, sinon copie du lien.
 */
export function ShareActivityButton({ activityId, text }: { activityId: string; text: string }) {
  const share = async () => {
    const url = `${window.location.origin}/seances/${activityId}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "SportMates", text, url });
      } catch {
        // Partage annulé : rien à faire.
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Lien de la séance copié : colle-le dans WhatsApp !");
    } catch {
      toast.error("Impossible de copier le lien.");
    }
  };

  return (
    <Button variant="ghost" size="icon-sm" aria-label="Partager la séance" title="Partager la séance" className="-mt-1" onClick={share}>
      <Share2 />
    </Button>
  );
}
