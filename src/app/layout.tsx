import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";

import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "SportBud",
    template: "%s · SportBud",
  },
  description: "Trouve des partenaires de sport autour de toi.",
  applicationName: "SportBud",
  appleWebApp: {
    capable: true,
    title: "SportBud",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Permet au contenu de s'étendre sous l'encoche / la barre d'accueil iOS ;
  // les zones de sécurité sont gérées via env(safe-area-inset-*).
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className={`${inter.variable} h-full antialiased`}>
      <body className="h-full">
        {children}
        {/* Toasts globaux, affichés en haut pour ne pas masquer la Bottom Bar.
            Thème forcé en clair tant que le mode sombre n'est pas activé dans l'app. */}
        <Toaster position="top-center" theme="light" richColors closeButton />
      </body>
    </html>
  );
}
