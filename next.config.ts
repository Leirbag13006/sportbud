import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // L'image de partage d'une séance lit les photos de sport, le logo et les polices sur le disque :
  // ces fichiers doivent être embarqués dans la fonction serveur (public/ n'y est pas par défaut).
  outputFileTracingIncludes: {
    "/seances/*": ["./public/sports/*.jpg", "./src/assets/fonts/*.ttf", "./src/app/icon.svg"],
  },
};

export default nextConfig;
