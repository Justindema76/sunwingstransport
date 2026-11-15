// Hamilton & Niagara: a self-contained section of the site (its own menu and footer).
// Every link inside it stays inside /hamilton-niagara.
import { getSiteSettings } from './content';
import { HN_NO_BLUE_CSS } from './hnNoBlueCss';
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
  // Look of the section. Blank colour = the main site's colour (Admin › Global Styles).
  theme: {
    // 'blackgold' = Hamilton black & gold with no blue anywhere; 'main' = same colours as the main site.
    scheme: 'blackgold',
    badge: 'Hamilton & Niagara',
    // Area names in the switch beside the logo: main site / this section.
    mainBadge: 'Toronto & GTA',
    backLabel: '',
    topbarLine: 'Hamilton & Niagara moving and transport',
    accent: '',
    accent2: '',
    accentInk: '',
    navy: '',
    blue: '',
    topbar: '',
    topbarInk: '',
    header: '',
  },
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

// Colour settings → CSS variables for the section's pages (set on body's children, so they win over
// Global Styles, which are set on body itself). Only plain colour values get through.
const COLOR_RE = /^(#[0-9a-f]{3,8}|rgba?\([\d\s.,%]+\)|hsla?\([\d\s.,%deg]+\))$/i;
const THEME_VARS = { accent: '--accent', accent2: '--accent-2', accentInk: '--accent-ink', navy: '--navy', blue: '--blue', topbar: '--topbar', header: '--header' };
// Black & gold scheme: black top bar, white header, gold buttons, black text, black banner tint,
// black footer, and every other blue (borders, light-blue backgrounds, shadows) swapped too.
const BLACK_GOLD_CSS = [
  'body>*{--navy:#111111;--navy-2:#1c1c1c;--blue:#111111;--sky:#FFF5D6;--ink:#111111;--muted:#5E5A52;--line:#ECE5D3;--bg:#FBF8F0;--accent:#FFB81C;--accent-2:#E5A000;--accent-ink:#000000;--topbar:#111111;--topbar-ink:#FFFFFF;--header:#FFFFFF}',
  'body>*:not(footer){color:#111111}',
  'html body{background-color:#FBF8F0}',
  'body .topbar b{color:#FFB81C}',
  HN_NO_BLUE_CSS,
  // The banner's dark tint is set on the slide itself; on phones the slide uses a plain background.
  '@media (min-width:701px){body .hero-slide{background-image:linear-gradient(90deg,rgba(0,0,0,.86) 0%,rgba(0,0,0,.66) 38%,rgba(0,0,0,.2) 75%,rgba(0,0,0,.05) 100%),var(--hero-photo)!important}}',
].join('');

export function hnThemeCss(theme = {}) {
  const scheme = theme.scheme === 'blackgold' ? BLACK_GOLD_CSS : '';
  const rules = Object.entries(THEME_VARS)
    .map(([field, cssVar]) => [cssVar, String(theme[field] || '').trim()])
    .filter(([, value]) => COLOR_RE.test(value))
    .map(([cssVar, value]) => `${cssVar}:${value}`);
  if (theme.navy && COLOR_RE.test(String(theme.navy).trim())) rules.push(`--navy-2:${String(theme.navy).trim()}`);
  // Top bar text: all of it (the bold part and links too) in the one colour.
  const ink = String(theme.topbarInk || '').trim();
  const inkCss = COLOR_RE.test(ink) ? `body .topbar,body .topbar b,body .topbar a{color:${ink}}` : '';
  // Colours picked in the admin come after the scheme, so they win.
  return scheme + (rules.length ? `body>*{${rules.join(';')}}` : '') + inkCss;
}

// The two-way switch beside the logo on both sites.
export const hnRegions = (theme = {}, onSection = false) => (
  theme.mainBadge && theme.badge
    ? [{ label: theme.mainBadge, href: '/', current: !onSection }, { label: theme.badge, href: HN, current: onSection }]
    : null
);
