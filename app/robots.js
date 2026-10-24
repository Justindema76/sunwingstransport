import { getBaseUrl, isProductionDeploy } from '@/lib/content';

export default function robots() {
  const base = getBaseUrl();

  return {
    rules: isProductionDeploy
      ? [{ userAgent: '*', allow: '/' }]
      : [{ userAgent: '*', disallow: '/' }],
    sitemap: isProductionDeploy ? `${base}/sitemap.xml` : undefined,
  };
}
