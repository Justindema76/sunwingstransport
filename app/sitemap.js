import { getBaseUrl, getBlogPosts, getLocations, getServices } from '@/lib/content';

function lastModified(item) {
  const value = item?.updated_at || item?.publishedAt || item?.published_at || '';
  return value ? new Date(value) : undefined;
}

export default async function sitemap() {
  const base = getBaseUrl();
  const [services, locations, posts] = await Promise.all([getServices(), getLocations(), getBlogPosts()]);

  return [
    { url: base, changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/services`, changeFrequency: 'weekly', priority: .9 },
    { url: `${base}/locations`, changeFrequency: 'weekly', priority: .9 },
    { url: `${base}/pricing`, changeFrequency: 'monthly', priority: .7 },
    { url: `${base}/contact`, changeFrequency: 'monthly', priority: .8 },
    { url: `${base}/blog`, changeFrequency: 'weekly', priority: .7 },
    { url: `${base}/privacy`, changeFrequency: 'yearly', priority: .2 },
    ...services.map(service => ({
      url: `${base}/services/${service.slug}`,
      lastModified: lastModified(service),
      changeFrequency: 'monthly',
      priority: .8,
    })),
    ...locations.map(location => ({
      url: `${base}/locations/${location.slug}`,
      lastModified: lastModified(location),
      changeFrequency: 'monthly',
      priority: .8,
    })),
    ...posts.map(post => ({
      url: `${base}/blog/${post.slug}`,
      lastModified: lastModified(post),
      changeFrequency: 'monthly',
      priority: .6,
    })),
  ];
}
