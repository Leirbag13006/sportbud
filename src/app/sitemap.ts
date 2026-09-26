import type { MetadataRoute } from "next";

import { LEGAL_PAGES } from "@/config/legal";
import { SITE_URL } from "@/config/site";
import { getPublicActivities } from "@/lib/activities/public";

/** Régénéré au plus toutes les heures : les séances à venir changent souvent. */
export const revalidate = 3600;

/** Pages publiques : l'accueil, les séances à venir, la connexion, les documents légaux et les crédits. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const activities = await getPublicActivities({ limit: 500 });
  return [
    { url: SITE_URL, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/seances`, changeFrequency: "hourly", priority: 0.9 },
    ...activities.map(({ id }) => ({ url: `${SITE_URL}/seances/${id}`, changeFrequency: "daily" as const, priority: 0.6 })),
    { url: `${SITE_URL}/login`, changeFrequency: "monthly", priority: 0.3 },
    ...LEGAL_PAGES.map(({ slug }) => ({
      url: `${SITE_URL}/legal/${slug}`,
      changeFrequency: "yearly" as const,
      priority: 0.2,
    })),
    { url: `${SITE_URL}/credits`, changeFrequency: "yearly", priority: 0.1 },
  ];
}
