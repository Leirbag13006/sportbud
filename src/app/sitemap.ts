import type { MetadataRoute } from "next";

import { LEGAL_PAGES } from "@/config/legal";
import { SITE_URL } from "@/config/site";

/** Pages publiques : la landing (/register), la connexion, les documents légaux et les crédits. */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${SITE_URL}/register`, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/login`, changeFrequency: "monthly", priority: 0.5 },
    ...LEGAL_PAGES.map(({ slug }) => ({
      url: `${SITE_URL}/legal/${slug}`,
      changeFrequency: "yearly" as const,
      priority: 0.2,
    })),
    { url: `${SITE_URL}/credits`, changeFrequency: "yearly", priority: 0.1 },
  ];
}
