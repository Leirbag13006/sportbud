import type { MetadataRoute } from "next";

import { SITE_URL } from "@/config/site";

/** Seules la landing et les pages publiques sont indexables ; l'espace membre reste privé. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/auth/", "/activities", "/messages", "/profile", "/welcome", "/admin", "/reset-password"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
