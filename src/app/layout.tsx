import type { Metadata, Viewport } from "next";
import { Caveat, Inter, Montserrat } from "next/font/google";

import { Toaster } from "@/components/ui/sonner";
import { SITE_URL } from "@/config/site";
import "./globals.css";

/* Typographies du design system : Montserrat (titres, logo), Inter (texte), Caveat (accroche). */
const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["600", "700", "800", "900"],
  style: ["normal", "italic"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  weight: ["700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "SportMates · Bouge. Rencontre. Partage.",
    template: "%s · SportMates",
  },
  description: "Le sport nous rapproche, partout. Trouve des partenaires sportifs près de chez toi.",
  applicationName: "SportMates",
  appleWebApp: {
    capable: true,
    title: "SportMates",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Permet au contenu de s'étendre sous l'encoche / la barre d'accueil iOS ;
  // les zones de sécurité sont gérées via env(safe-area-inset-*).
  viewportFit: "cover",
  // Barre du navigateur mobile aux couleurs de l'en-tête (nuit).
  themeColor: "#050f0d",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fr"
      className={`${montserrat.variable} ${inter.variable} ${caveat.variable} h-full antialiased`}
    >
      <body className="h-full">
        {children}
        {/* Toasts globaux, affichés en haut pour ne pas masquer la barre de navigation. */}
        <Toaster position="top-center" theme="light" richColors closeButton />
      </body>
    </html>
  );
}
