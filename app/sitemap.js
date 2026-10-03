import { getBaseUrl, getLocations, getServices } from '@/lib/content';

export default async function sitemap() {
  const base = getBaseUrl();
  const [services, locations] = await Promise.all([getServices(), getLocations()]);
  return [
    { url: base, changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/services`, changeFrequency: 'weekly', priority: .9 },
    { url: `${base}/locations`, changeFrequency: 'weekly', priority: .9 },
    { url: `${base}/pricing`, changeFrequency: 'monthly', priority: .7 },
    { url: `${base}/contact`, changeFrequency: 'monthly', priority: .8 },
    { url: `${base}/blog`, changeFrequency: 'weekly', priority: .7 },
    { url: `${base}/privacy`, changeFrequency: 'yearly', priority: .2 },
    { url: `${base}/blog/how-much-do-movers-cost`, changeFrequency: 'monthly', priority: .6 },
    { url: `${base}/blog/condo-move-checklist`, changeFrequency: 'monthly', priority: .6 },
    { url: `${base}/blog/marketplace-furniture-pickup`, changeFrequency: 'monthly', priority: .6 },
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
