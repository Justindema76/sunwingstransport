import { getBaseUrl, getLocations, getServices } from '@/lib/content';

export default async function sitemap() {
  const base = getBaseUrl();
  const [services, locations] = await Promise.all([getServices(), getLocations()]);
  return [
    { url: base, changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/services`, changeFrequency: 'weekly', priority: .9 },
    { url: `${base}/locations`, changeFrequency: 'weekly', priority: .9 },
    ...services.map(service => ({
      url: `${base}/services/${service.slug}`,
      changeFrequency: 'monthly',
      priority: .8,
    })),
    ...locations.map(location => ({
      url: `${base}/locations/${location.slug}`,
      changeFrequency: 'monthly',
      priority: .8,
    })),
  ];
}
