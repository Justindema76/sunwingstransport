import { getBaseUrl } from '@/lib/content';

export default function robots() {
  const base = getBaseUrl();
  const isLiveDomain = base.includes('sunwingstransport.ca');

  return {
    rules: isLiveDomain
      ? [{ userAgent: '*', allow: '/' }]
      : [{ userAgent: '*', disallow: '/' }],
    sitemap: isLiveDomain ? `${base}/sitemap.xml` : undefined,
  };
}
