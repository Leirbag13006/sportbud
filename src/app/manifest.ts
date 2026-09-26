import type { MetadataRoute } from "next";

/** Installation sur l'écran d'accueil du téléphone (couleurs nuit du design system). */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SportMates",
    short_name: "SportMates",
    description: "Trouve des partenaires de sport près de chez toi.",
    lang: "fr",
    start_url: "/",
    display: "standalone",
    background_color: "#050f0d",
    theme_color: "#050f0d",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
