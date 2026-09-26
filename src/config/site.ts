/** Adresse publique du site (Vercel la fournit en production) : aperçus de liens, sitemap, robots. */
export const SITE_URL = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : "http://localhost:3000";
