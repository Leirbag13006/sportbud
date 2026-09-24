"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { useGeolocation } from "./use-geolocation";

const PROMPT_DISMISSED_KEY = "sportbud:location-prompt-dismissed";

/** La fenêtre de localisation a-t-elle déjà été fermée pendant cette session ? */
function readPromptDismissed() {
  try {
    return typeof window !== "undefined" && sessionStorage.getItem(PROMPT_DISMISSED_KEY) === "1";
  } catch {
    return false;
  }
}

/**
 * Géolocalisation + fenêtre d'explication (« Autoriser la localisation »).
 * - La fenêtre s'ouvre d'elle-même une fois par session si le navigateur n'a encore rien décidé ;
 * - `ensureLocation()` la rouvre (ou affiche l'aide si la localisation est bloquée).
 */
export function useLocationAccess() {
  const { state, permission, request } = useGeolocation();
  const [promptDismissed, setPromptDismissed] = useState(readPromptDismissed);
  const [manualDialog, setManualDialog] = useState<"prompt" | "denied" | null>(null);

  // Informe l'utilisateur si la localisation échoue après avoir été demandée.
  useEffect(() => {
    if (state.status === "denied") {
      toast.info("Position non partagée : les distances ne sont pas disponibles.", {
        description: "Tu peux l'activer à tout moment avec le bouton de localisation.",
      });
    } else if (state.status === "unavailable") {
      toast.warning("Impossible de déterminer ta position.");
    }
  }, [state.status]);

  const autoPrompt = permission === "prompt" && state.status === "idle" && !promptDismissed;
  const dialogVariant = manualDialog ?? (autoPrompt ? "prompt" : null);

  const closeDialog = useCallback(() => {
    setManualDialog(null);
    setPromptDismissed(true);
    try {
      sessionStorage.setItem(PROMPT_DISMISSED_KEY, "1");
    } catch {
      // Stockage indisponible (navigation privée…) : la fenêtre pourra réapparaître, sans gravité.
    }
  }, []);

  const allow = useCallback(() => {
    closeDialog();
    // Déclenche la demande native du navigateur.
    request();
  }, [closeDialog, request]);

  /** À appeler quand une fonctionnalité a besoin de la position et qu'elle est inconnue. */
  const ensureLocation = useCallback(() => {
    if (state.position || state.status === "locating") return;
    if (permission === "denied") setManualDialog("denied");
    else if (permission === "unsupported") toast.warning("Ton navigateur ne permet pas la localisation.");
    else setManualDialog("prompt");
  }, [permission, state.position, state.status]);

  return {
    position: state.position,
    isLocating: state.status === "locating",
    ensureLocation,
    dialog: { variant: dialogVariant, onAllow: allow, onClose: closeDialog },
  };
}
