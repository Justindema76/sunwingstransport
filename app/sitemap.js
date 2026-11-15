import { getBaseUrl, getBlogPosts, getLocations, getServices } from '@/lib/content';
import { readSiteSections, sectionFor } from '@/lib/siteSections';
import { getSiteSettings } from '@/lib/content';
import { offersSnow, snowTownHref } from '@/lib/siteContent';
import { ROUTES, routeHref } from '@/lib/routes';

function lastModified(item) {
  const value = item?.updated_at || item?.publishedAt || item?.published_at || '';
  return value ? new Date(value) : undefined;
}

export default async function sitemap() {
  const base = getBaseUrl();
  const [services, locations, posts, hnPosts, settings] = await Promise.all([getServices(), getLocations(), getBlogPosts(), getBlogPosts({ area: 'hn' }), getSiteSettings()]);
  const sections = readSiteSections(settings);

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
    ...locations.filter(offersSnow).map(location => ({
      url: `${base}${snowTownHref(location.slug)}`,
      lastModified: lastModified(location),
      changeFrequency: 'monthly',
      priority: .8,
    })),
    { url: `${base}/hamilton-niagara`, changeFrequency: 'monthly', priority: .9 },
    ...['long-distance', 'furniture-delivery', 'commercial-transport'].map(slug => ({ url: `${base}/hamilton-niagara/${slug}`, changeFrequency: 'monthly', priority: .8 })),
    // Store partner program pages.
    { url: `${base}/partners`, changeFrequency: 'monthly', priority: .6 },
    { url: `${base}/hamilton-niagara/partners`, changeFrequency: 'monthly', priority: .6 },
    ...['pricing', 'contact', 'blog'].map(slug => ({ url: `${base}/hamilton-niagara/${slug}`, changeFrequency: 'monthly', priority: .7 })),
    // Posts shown only in the Hamilton & Niagara section (posts on both sites are listed once, under /blog).
    ...hnPosts.filter(post => sectionFor('blog', post.slug, sections) === 'hn').map(post => ({
      url: `${base}/hamilton-niagara/blog/${post.slug}`,
      lastModified: lastModified(post),
      changeFrequency: 'monthly',
      priority: .6,
    })),
    { url: `${base}/long-distance`, changeFrequency: 'monthly', priority: .9 },
    ...ROUTES.map(route => ({ url: `${base}${routeHref(route)}`, changeFrequency: 'monthly', priority: .9 })),
    ...posts.map(post => ({
      url: `${base}/blog/${post.slug}`,
      lastModified: lastModified(post),
      changeFrequency: 'monthly',
      priority: .6,
    })),
  ];
}
