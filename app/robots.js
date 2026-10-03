import { getBaseUrl } from '@/lib/content';

export default function robots() {
  return {
    rules: [{ userAgent: '*', allow: '/' }],
    sitemap: `${getBaseUrl()}/sitemap.xml`,
  };
}
