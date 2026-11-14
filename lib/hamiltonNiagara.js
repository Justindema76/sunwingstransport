// Hamilton & Niagara: a self-contained section of the site (its own menu and footer).
// Every link inside it stays inside /hamilton-niagara.
import { ROUTES } from './routes';

export const HN = '/hamilton-niagara';
export const HN_REGIONS = [
  { key: 'Hamilton Region', title: 'Hamilton', note: 'Hamilton, Stoney Creek, Ancaster, Dundas and Waterdown' },
  { key: 'Niagara Region', title: 'Niagara', note: 'Grimsby, Lincoln, St. Catharines, Niagara Falls, Welland, Thorold and Fort Erie' },
  { key: 'Halton Region', title: 'Halton', note: 'Burlington, Oakville and Milton' },
];
export const HN_REGION_KEYS = HN_REGIONS.map(region => region.key);

// Services offered in the section: [section slug, main-site service slug, menu label].
export const HN_SERVICES = [
  { slug: 'long-distance', label: 'Long-Distance Moving', serviceSlug: 'residential-moving', preset: 'Long Distance Moving' },
  { slug: 'furniture-delivery', label: 'Furniture Delivery', serviceSlug: 'furniture-delivery' },
  { slug: 'commercial-transport', label: 'Commercial Transport', serviceSlug: 'commercial-transport' },
];

export const HN_ROUTES = ROUTES.filter(route => route.group === 'hamilton' || route.group === 'niagara');
export const hnRouteHref = route => `${HN}/routes/${route.slug}`;
export const hnTownHref = town => `${HN}/${town.slug || town}`;

export const HN_NAV = [
  { label: 'Long-Distance', url: `${HN}/long-distance` },
  { label: 'Furniture Delivery', url: `${HN}/furniture-delivery` },
  { label: 'Commercial', url: `${HN}/commercial-transport` },
  { label: 'Routes', url: `${HN}#routes` },
  { label: 'Towns', url: `${HN}#towns` },
];

export const isHnTown = location => HN_REGION_KEYS.includes(location?.region);

// Keeps admin-written page text inside the section: links to section towns/services are
// pointed at the section's own pages, any other site link becomes plain text.
export function keepLinksInSection(html = '', townSlugs = []) {
  const towns = new Set(townSlugs);
  const services = new Map(HN_SERVICES.map(item => [item.serviceSlug, item.slug]));
  services.set('long-distance', 'long-distance');
  return String(html || '').replace(/<a\b([^>]*?)href=["']([^"']+)["']([^>]*)>([\s\S]*?)<\/a>/gi, (whole, before, href, after, text) => {
    const url = href.replace(/^https?:\/\/(www\.)?sunwingstransport\.ca/i, '');
    if (/^(https?:|tel:|mailto:|#)/i.test(url)) return whole;
    const town = url.match(/^\/locations\/([^/?#]+)/);
    if (town && towns.has(town[1])) return `<a href="${HN}/${town[1]}">${text}</a>`;
    const service = url.match(/^\/services\/([^/?#]+)/);
    if (service && services.has(service[1]) && service[1] !== 'residential-moving') return `<a href="${HN}/${services.get(service[1])}">${text}</a>`;
    if (/^\/long-distance\/?$/.test(url)) return `<a href="${HN}/long-distance">${text}</a>`;
    return text;
  });
}

// Trust strip for the section (no links out of the section; Google reviews opens Google).
export const HN_TRUST = [
  { title: 'Google reviews', text: 'Rated 4.9 by local customers', href: 'https://search.google.com/local/reviews?placeid=ChIJXTBVHE3zTkcRiUEmU5P3CsI' },
  { title: 'Upfront quotes', text: 'Written price before you book' },
  { title: 'Long-distance', text: 'Hamilton & Niagara ↔ Toronto/GTA' },
  { title: 'Hamilton to Niagara', text: 'Burlington, Grimsby, St. Catharines & more' },
];
