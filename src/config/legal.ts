/**
 * Documents légaux, accessibles depuis les pieds de page (landing et profil).
 * Contenu en cours de rédaction : chaque page présente pour l'instant son objet.
 */
export const LEGAL_PAGES = [
  {
    slug: "mentions-legales",
    title: "Mentions",
    accent: "légales.",
    summary: "Éditeur du site, directeur de la publication, hébergeur et coordonnées de contact.",
  },
  {
    slug: "cgu",
    title: "Conditions générales",
    accent: "d'utilisation.",
    summary:
      "Règles d'utilisation de SportMates : inscription, organisation et participation aux séances, avis, comportement attendu et modération.",
  },
  {
    slug: "confidentialite",
    title: "Politique de",
    accent: "confidentialité.",
    summary:
      "Données collectées (profil, position, messages), finalités, durée de conservation et exercice de tes droits (accès, rectification, suppression).",
  },
  {
    slug: "cookies",
    title: "Gestion des",
    accent: "cookies.",
    summary: "SportMates n'utilise qu'un cookie de session, indispensable pour rester connecté. Aucun cookie publicitaire.",
  },
] as const;

export type LegalSlug = (typeof LEGAL_PAGES)[number]["slug"];

export function getLegalPage(slug: string) {
  return LEGAL_PAGES.find((page) => page.slug === slug);
}
