// Hamilton & Niagara: a self-contained section of the site (its own menu and footer).
// Every link inside it stays inside /hamilton-niagara.
import { getSiteSettings } from './content';
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

// Everything in the section that's editable in Admin › Banners & Pop-up › Hamilton & Niagara.
// Saved as JSON in the `hn_content` site setting; blank fields fall back to these defaults.
// Keep in sync with the admin's copy in promotionsDefaults.js (hn_content).
export const HN_CONTENT_DEFAULTS = {
  home: {
    eyebrow: 'Hamilton · Burlington · Grimsby · Niagara',
    heading: 'Hamilton & Niagara',
    accent: 'movers & transport.',
    text: 'Long-distance moves, furniture delivery and large-item transport across Hamilton and the Niagara Region, and to Toronto and the GTA. Tell us where it’s going and get a tailored quote.',
    image: 'https://nowsajdmbpxvlvrhopjg.supabase.co/storage/v1/object/public/blog-images/sunwings/1792805164536-image.png',
    cards: [
      { title: 'Long-distance moves', text: 'Full home moves between Hamilton or Niagara and Toronto, Mississauga and the GTA, planned around access at both ends.', href: `${HN}/long-distance`, cta: 'Long-distance moving' },
      { title: 'Furniture & store delivery', text: 'Store pickups, Marketplace finds and single large items brought from anywhere in the region and placed in the room you want.', href: `${HN}/furniture-delivery`, cta: 'Furniture delivery' },
      { title: 'Commercial & large-item transport', text: 'Office moves, equipment, inventory and business deliveries between cities, one-off or on a schedule.', href: `${HN}/commercial-transport`, cta: 'Commercial transport' },
    ],
    faqs: [
      { question: 'Do you move between Niagara and Toronto?', answer: 'Yes. Moves and deliveries between the Niagara Region, Hamilton and Toronto or the GTA are our main long-distance routes. Send both addresses and your date for a tailored quote.' },
      { question: 'Which towns do you cover in Hamilton and Niagara?', answer: 'Hamilton, Stoney Creek, Ancaster, Dundas, Waterdown, Burlington, Grimsby, Lincoln, St. Catharines, Niagara Falls, Welland, Thorold and Fort Erie, plus nearby towns on request.' },
      { question: 'Can you deliver one large item from Hamilton or Niagara to Toronto?', answer: 'Yes. Furniture, appliances and other large items can be picked up and delivered between cities. Tell us the item, size, stairs and both addresses.' },
      { question: 'How is a long-distance quote priced?', answer: 'It depends on the route, the amount being moved, the crew and vehicle needed, and access at both ends. You get a written quote before anything is booked.' },
    ],
  },
  'long-distance': {
    eyebrow: 'Hamilton & Niagara',
    heading: 'Long-distance moving',
    accent: 'Hamilton & Niagara ↔ Toronto.',
    text: 'Full home moves between Hamilton, Burlington, Grimsby, St. Catharines, Niagara Falls and Toronto, Mississauga and the GTA. Planned around access at both ends, quoted in writing before you book.',
    image: 'https://nowsajdmbpxvlvrhopjg.supabase.co/storage/v1/object/public/blog-images/sunwings/1794229390663-IMG_8141.jpeg',
    sendList: [
      'Pickup and delivery cities and addresses, and your moving date.',
      'Home size or item list, with photos of large or awkward pieces.',
      'Stairs, elevators, parking and carrying distance at both ends.',
    ],
  },
  // Blank text/photo = the main site's Service Post for that service.
  'furniture-delivery': { eyebrow: 'Hamilton & Niagara', heading: '', accent: 'Hamilton & Niagara.', text: '', image: '' },
  'commercial-transport': { eyebrow: 'Hamilton & Niagara', heading: '', accent: 'Hamilton & Niagara.', text: '', image: '' },
  routes: { image: '' },
  // The Long-Distance Moving card added to the service cards on the main site.
  servicesCard: {
    enabled: true,
    title: 'Long-Distance Moving',
    text: 'Moving between Hamilton, Niagara and Toronto or the GTA? One crew loads, drives and unloads, with a written quote before you book.',
    image: 'https://nowsajdmbpxvlvrhopjg.supabase.co/storage/v1/object/public/blog-images/sunwings/1794229390663-IMG_8141.jpeg',
    linkText: 'Learn more →',
    url: `${HN}/long-distance`,
  },
};

const filled = value => (Array.isArray(value) ? value.length > 0 : value !== '' && value != null);

// Saved values win field by field; empty saved fields keep the default.
export function mergeHnContent(saved) {
  let parsed = saved;
  if (typeof saved === 'string') { try { parsed = JSON.parse(saved); } catch { parsed = null; } }
  return Object.fromEntries(Object.entries(HN_CONTENT_DEFAULTS).map(([key, fallback]) => {
    const own = parsed && typeof parsed[key] === 'object' ? parsed[key] : {};
    const merged = { ...fallback };
    for (const [field, value] of Object.entries(own || {})) if (filled(value) || typeof value === 'boolean') merged[field] = value;
    return [key, merged];
  }));
}

export async function getHnContent() {
  return mergeHnContent((await getSiteSettings())?.hn_content);
}
