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
export const hnRouteLinks = () => HN_ROUTES.map(route => ({ label: `${route.from} to ${route.to}`, url: hnRouteHref(route) }));

// The section menu, like the main site's: Services, Routes and Towns dropdowns, Pricing, Moving
// Tips, Contact. The layout fills the dropdowns (hnServiceLinks, hnRouteLinks, hnTownLinks).
// Routes and Towns have no url: tapping them opens the list instead of jumping down the page.
export const HN_NAV = [
  { label: 'Services', url: `${HN}#services`, children: [], fill: 'services' },
  { label: 'Routes', url: '', children: [], fill: 'routes' },
  { label: 'Towns', url: '', children: [], fill: 'towns' },
  { label: 'Pricing', url: `${HN}/pricing` },
  { label: 'Moving Tips', url: `${HN}/blog` },
  { label: 'Contact', url: `${HN}/contact` },
];

// Search-engine text for each Hamilton & Niagara page, edited in Admin › Pages › Hamilton & Niagara
// (setting "hn_seo": { <page id>: { title, description, image } }). Blank = the defaults below.
export const HN_SEO_DEFAULTS = {
  home: { title: 'Hamilton & Niagara Movers | Long-Distance Moving & Transport | Sunwings', description: 'Moving, furniture delivery and long-distance transport across Hamilton, Burlington, Grimsby, St. Catharines, Niagara Falls and the Niagara Region, and to Toronto and the GTA. Free tailored quotes.' },
  'long-distance': { title: 'Long-Distance Moving in Hamilton & Niagara | Sunwings Transport', description: 'Long-distance moving across Hamilton, Burlington and the Niagara Region, and to Toronto and the GTA.' },
  'furniture-delivery': { title: 'Furniture Delivery in Hamilton & Niagara | Sunwings Transport', description: 'Furniture delivery across Hamilton, Burlington and the Niagara Region, and to Toronto and the GTA.' },
  'commercial-transport': { title: 'Commercial Transport in Hamilton & Niagara | Sunwings Transport', description: 'Commercial transport across Hamilton, Burlington and the Niagara Region, and to Toronto and the GTA.' },
  pricing: { title: 'Moving & Delivery Prices in Hamilton & Niagara | Sunwings Transport', description: 'Upfront, written prices for moving, furniture delivery and long-distance transport in Hamilton, Burlington and the Niagara Region.' },
  contact: { title: 'Contact Sunwings Transport | Hamilton & Niagara', description: 'Questions about moving, delivery or long-distance transport in Hamilton, Burlington or Niagara? Contact Sunwings Transport.' },
  blog: { title: 'Moving Tips for Hamilton & Niagara | Sunwings Transport', description: 'Moving tips, pricing guides and delivery advice for Hamilton, Burlington and the Niagara Region.' },
  facebook: { title: 'Latest from Sunwings | Hamilton & Niagara', description: 'Recent jobs, open spots and news from Sunwings Transport.' },
  partners: { title: 'Furniture Delivery Partners in Hamilton & Niagara | Sunwings Transport', description: 'Furniture stores and consignment shops in Hamilton, Burlington, Grimsby and the Niagara Region: free delivery partner program with written quotes for your customers.' },
};

export async function getHnSeo(id) {
  let saved = (await getSiteSettings())?.hn_seo;
  if (typeof saved === 'string') { try { saved = JSON.parse(saved); } catch { saved = null; } }
  const own = saved && typeof saved[id] === 'object' ? saved[id] : {};
  const fallback = HN_SEO_DEFAULTS[id] || {};
  return { title: own.title || fallback.title || 'Sunwings Transport | Hamilton & Niagara', description: own.description || fallback.description || '', image: own.image || '' };
}

// Page metadata for a Hamilton & Niagara page from its SEO settings.
export async function hnMetadata(id, path, fallbackImage = '') {
  const seo = await getHnSeo(id);
  const image = seo.image || fallbackImage;
  return {
    title: { absolute: seo.title },
    description: seo.description,
    alternates: { canonical: path },
    openGraph: { type: 'website', url: path, title: seo.title, description: seo.description, siteName: 'Sunwings Transport', locale: 'en_CA', ...(image ? { images: [{ url: image }] } : {}) },
    twitter: { card: image ? 'summary_large_image' : 'summary', title: seo.title, description: seo.description, ...(image ? { images: [image] } : {}) },
  };
}

// Services in the section menu: Long-Distance first, then every service set to show here
// (Admin › Service Posts › Show on). Ones with a section page link there; the rest to the main page.
export function hnServiceLinks(services = []) {
  const own = Object.fromEntries(HN_SERVICES.filter(item => !item.preset).map(item => [item.serviceSlug, `${HN}/${item.slug}`]));
  return [
    { label: 'Long-Distance Moving', url: `${HN}/long-distance` },
    ...services.filter(service => service.slug !== 'residential-moving').map(service => ({ label: service.title, url: own[service.slug] || `/services/${service.slug}` })),
  ];
}

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
  { title: 'Small & owner-run', text: 'Not a broker. Every job matters to us' },
  { title: 'Google reviews', text: 'Rated 4.9 by local customers', href: 'https://search.google.com/local/reviews?placeid=ChIJXTBVHE3zTkcRiUEmU5P3CsI' },
  { title: 'Upfront quotes', text: 'Written price before you book' },
  { title: 'Long-distance', text: 'Hamilton & Niagara ↔ Toronto/GTA' },
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
  // Service pages. Every section below is edited in Admin › Hamilton & Niagara › <page>; an empty
  // section is hidden. Photos come from the main site's Service Post.
  'long-distance': {
    eyebrow: 'Hamilton & Niagara',
    heading: 'Long-distance moving',
    accent: 'Hamilton & Niagara ↔ Toronto.',
    text: 'Full home moves between Hamilton, Burlington, Grimsby, St. Catharines, Niagara Falls and Toronto, Mississauga and the GTA. Planned around access at both ends, quoted in writing before you book.',
    image: 'https://nowsajdmbpxvlvrhopjg.supabase.co/storage/v1/render/image/public/blog-images/sunwings/1794707943328-Q.E.W.-Highway-Exit-Panorama.png?width=1600&quality=75',
    intro: 'Moving between Hamilton or Niagara and Toronto is a full day on the QEW, not a local job. Sunwings plans these moves as one trip with one crew: we load at your old place, drive it ourselves and unload at the new one, so your things never sit in a warehouse or change hands. You get a written quote first, based on your home, your date and the access at both ends.',
    handleTitle: 'What we move',
    handle: [
      'Apartments, condos and townhouses',
      'Houses, including basements and garages',
      'Partial moves: a room, a storage unit, a few big pieces',
      'Students and seniors moving to or from Hamilton and Niagara',
      'Furniture bought or sold between the two regions',
      'Office and small business moves',
    ],
    stepsTitle: 'How a long-distance move works',
    steps: [
      { title: 'Tell us the move', text: 'Both addresses, your date and the size of the home or a list of the big pieces. Photos help.' },
      { title: 'Get a written quote', text: 'We plan the truck, crew and drive time, and send the price in writing before anything is booked.' },
      { title: 'Moving day', text: 'We wrap and load at your old place, drive the QEW or 403 ourselves, and unload into the rooms you choose.' },
      { title: 'Set up', text: 'Beds and tables we took apart go back together, and we take the blankets with us.' },
    ],
    localTitle: 'Moving between Hamilton, Niagara and the GTA',
    local: 'The drive is the part people underestimate. Traffic on the QEW, the Burlington Skyway and the Gardiner can turn a one-hour trip into three, so we plan the start time around it and tell you when to expect us at the other end.\n\nAccess matters at both ends. Toronto condos usually need the elevator and loading dock booked, and some ask for a certificate of insurance. Older homes in Hamilton and Niagara often have narrow stairs or tight doorways. Tell us about both places and we plan the crew and equipment for them.',
    quoteTitle: 'What your quote is based on',
    quoteFactors: [
      'The size of the home or the list of large items',
      'The distance and drive time between the two addresses',
      'Stairs, elevators, parking and how far we carry at each end',
      'Your date and time (weekends and month-end book up first)',
      'Extra work: disassembly, packing, a storage stop or a second drop-off',
    ],
    sendList: [
      'Pickup and delivery cities and addresses, and your moving date.',
      'Home size or item list, with photos of large or awkward pieces.',
      'Stairs, elevators, parking and carrying distance at both ends.',
    ],
    faqs: [
      { question: 'Do you move from Hamilton or Niagara to Toronto in one day?', answer: 'Most moves between the two regions are done in one day with one crew and one truck. Larger homes or difficult access can take longer, and your quote will say so.' },
      { question: 'Do you move the other way, from Toronto to Hamilton or Niagara?', answer: 'Yes. We run moves in both directions, from Toronto, Mississauga and the GTA to Hamilton, Burlington and the Niagara Region too.' },
      { question: 'Will my things be transferred to another truck?', answer: 'No. The crew that loads your things drives them and unloads them. Nothing goes through a warehouse unless you ask for storage.' },
      { question: 'How do I get a price?', answer: 'Send both addresses, your date and the home size or item list. You get a written quote before you book, with nothing to pay to ask.' },
    ],
  },
  'furniture-delivery': {
    eyebrow: 'Hamilton & Niagara',
    heading: '',
    accent: 'Hamilton & Niagara.',
    text: '',
    image: '',
    intro: 'Bought a couch on Marketplace in Grimsby, or a dining set from a store in Burlington? Sunwings picks up furniture across Hamilton and the Niagara Region and delivers it to your door, or to Toronto and the GTA. Two careful movers, blankets and straps, and the piece goes into the room you want, not left at the curb.',
    handleTitle: 'What we deliver',
    handle: [
      'Marketplace and Kijiji pickups',
      'Furniture store and consignment shop purchases',
      'Sofas, sectionals and recliners',
      'Beds, mattresses and dressers',
      'Dining tables, cabinets and bookcases',
      'Appliances and other large single items',
    ],
    stepsTitle: 'How furniture delivery works',
    steps: [
      { title: 'Send the details', text: 'A photo or link of the piece, its size, and the pickup and delivery addresses.' },
      { title: 'Get a written quote', text: 'We confirm the van fits the piece, check the access at both ends and send the price before you book.' },
      { title: 'Pickup', text: 'We meet the seller or store, check the piece, wrap it and strap it in the van.' },
      { title: 'Delivery and placement', text: 'We carry it in, place it in the room you choose and take the packing with us.' },
    ],
    localTitle: 'Furniture delivery around Hamilton and Niagara',
    local: 'A lot of what we deliver here is bought second-hand or from local shops, across towns that are spread out along the QEW. We pick up from Hamilton, Stoney Creek, Burlington, Grimsby, St. Catharines, Niagara Falls and the towns between, and deliver anywhere in the region or into Toronto and the GTA.\n\nIf you are buying from a private seller, tell us when they are home and whether the piece is upstairs or in a basement. For store pickups, send the order number and pickup window so we can book it with the store.',
    quoteTitle: 'What your quote is based on',
    quoteFactors: [
      'How many pieces, and how big and heavy they are',
      'The distance between the pickup and the delivery',
      'Stairs, elevators and tight corners at either end',
      'Whether anything needs taking apart or putting back together',
      'Your date and pickup window',
    ],
    faqs: [
      { question: 'Can you pick up from a Marketplace seller?', answer: 'Yes. Send us the listing or a photo, the seller’s address and when they are home, and we handle the pickup and delivery.' },
      { question: 'Do you deliver from Hamilton or Niagara to Toronto?', answer: 'Yes. We deliver within Hamilton and Niagara and to Toronto, Mississauga and the rest of the GTA.' },
      { question: 'Will you bring it inside and up the stairs?', answer: 'Yes. We carry it in and place it in the room you choose. Tell us about stairs, elevators and narrow doors so we bring the right crew.' },
      { question: 'Can you take apart a bed or table to get it in?', answer: 'Yes, when it is designed to come apart. Mention it when you ask for a quote.' },
    ],
  },
  'commercial-transport': {
    eyebrow: 'Hamilton & Niagara',
    heading: '',
    accent: 'Hamilton & Niagara.',
    text: '',
    image: '',
    intro: 'Sunwings moves goods for retailers, offices, contractors and property managers across Hamilton, Burlington and the Niagara Region, and to Toronto and the GTA. One-off jobs or a regular route, with a written quote before we start.',
    handleTitle: 'What we transport',
    handle: [
      'Store deliveries and stock transfers between locations',
      'Office furniture and equipment',
      'Building materials and contractor supplies',
      'Property turnovers: furniture in or out of units',
      'Event and display equipment',
      'Recurring routes between Hamilton, Niagara and the GTA',
    ],
    stepsTitle: 'How it works',
    steps: [
      { title: 'Tell us the job', text: 'What is moving, how much of it, the addresses and your timing.' },
      { title: 'Get a written quote', text: 'We plan the vehicle and crew and send the price before you book.' },
      { title: 'On the day', text: 'We load, transport and unload, and keep you posted if anything changes.' },
    ],
    localTitle: 'Commercial transport in Hamilton and Niagara',
    local: 'Businesses here often need goods moved between their own locations, or between the region and Toronto. We plan around loading docks, building hours and traffic on the QEW so your delivery arrives when someone is there to receive it.',
    quoteTitle: 'What your quote is based on',
    quoteFactors: [
      'What is being moved, how much and how heavy',
      'Distance and drive time between the stops',
      'Loading access: docks, elevators, stairs and parking',
      'One-off job or a regular schedule',
    ],
    faqs: [
      { question: 'Can you do a regular route?', answer: 'Yes. Tell us the stops and how often, and we quote it as a recurring job.' },
      { question: 'Do you work outside business hours?', answer: 'Evenings and weekends are possible when the job needs it. Mention it when you ask for a quote.' },
    ],
  },
  // Hamilton & Niagara prices (before HST). Starting prices based on what Hamilton and Niagara
  // movers advertise (Nov 2026: 2 movers + truck about $115–$150/hour, Hamilton ↔ Toronto
  // 1-bedroom from about $899–$1,000). Every number is editable; the written quote is final.
  pricing: {
    heading: 'Moving prices for',
    accent: 'Hamilton & Niagara.',
    text: 'Real starting prices, before you call. Hourly rates for local moves, flat starting prices for moves to Toronto and the GTA, and a written quote before anything is booked.',
    image: '',
    note: 'Starting prices before HST. Distance, fuel and access can change the price; your written quote confirms it before you book.',
    hourly: [
      { title: 'Van + 1 mover', amount: '$95', unit: '/hour', note: '2-hour minimum', text: 'Single items, Marketplace pickups and small loads.', features: ['Cargo van', 'Blankets & straps', 'Placed in the room you want'] },
      { title: 'Truck + 2 movers', amount: '$130', unit: '/hour', note: '3-hour minimum', text: 'Most apartments and 1–2 bedroom homes.', features: ['Moving truck', 'Wrapping & protection', 'Disassembly & reassembly'], featured: true },
      { title: 'Truck + 3 movers', amount: '$170', unit: '/hour', note: '4-hour minimum', text: 'Houses and bigger loads, done faster.', features: ['Larger crew', 'Moving truck', 'Built for bigger jobs'] },
    ],
    longTitle: 'Long-distance: Hamilton & Niagara ↔ Toronto & the GTA',
    longText: 'One crew loads, drives and unloads. Flat starting prices from Hamilton; Niagara routes are a little more for the extra distance.',
    disclaimerTitle: 'How much does a long-distance move from Hamilton or Niagara cost?',
    disclaimer: 'Every move is different. The price depends on the size of your home, the distance between both addresses, fuel and travel time, how much you’re moving, stairs, elevators and parking at both ends, packing help and your date. The prices below are where most moves start. Send us your details and we confirm your exact price in writing before anything is booked: no hidden fees, no surprises on moving day.',
    long: [
      { title: 'Single item', amount: '$249', note: 'sofa, dresser, appliance', text: 'One large piece, picked up and delivered between cities and placed in the room you want.', features: ['1–2 movers', 'Cargo van', 'Blankets and straps', 'Placed in the room you want'] },
      { title: 'Small move', amount: '$549', note: 'studio or partial load', text: 'Students, studios and partial loads that fit in one van trip.', features: ['2 movers', 'Cargo van or small truck', 'Furniture wrapped in blankets', 'Loading and unloading'] },
      { title: '1-bedroom', amount: '$949', note: 'apartment or condo', text: 'Most 1-bedroom apartments and condos, moved in one trip with one crew.', features: ['2 movers', '1 moving truck', 'Blankets and stretch wrap', 'Beds and tables taken apart and rebuilt'], featured: true },
      { title: '2-bedroom', amount: '$1,599', note: 'apartment or small home', text: 'Couples and small families with more furniture and boxes.', features: ['2–3 movers', '1 full-size truck', 'Blankets and stretch wrap', 'Beds and tables taken apart and rebuilt'] },
      { title: '3-bedroom', amount: '$2,499', note: 'house', text: 'Family homes with full rooms of furniture, planned so the day runs on time.', features: ['3 movers', '1 large truck', 'Careful loading, room by room', 'Beds and tables taken apart and rebuilt'] },
      { title: '4 bedrooms & offices', amount: 'Quote', note: 'priced on the job', text: 'Large homes, offices and bigger loads that may need a larger crew or a second truck.', features: ['4+ movers', '1–2 large trucks', 'Packing help available', 'Planned with you in advance'] },
    ],
    routesTitle: 'Starting prices by route',
    routes: [
      { route: 'Hamilton ↔ Niagara', item: '$199', move: '$849' },
      { route: 'Burlington ↔ Toronto', item: '$229', move: '$899' },
      { route: 'Hamilton ↔ Toronto', item: '$249', move: '$949' },
      { route: 'Grimsby ↔ Toronto', item: '$279', move: '$1,049' },
      { route: 'St. Catharines ↔ Toronto', item: '$299', move: '$1,149' },
      { route: 'Niagara Falls ↔ Toronto', item: '$329', move: '$1,249' },
    ],
    extras: [
      'Distance: routes past Toronto and the GTA are priced by the kilometre',
      'Fuel surcharge: may be added when fuel prices are high',
      'Highway 407 tolls, only if the route uses it',
      'Travel time to the first address on hourly jobs',
      'Stairs: $50 per flight after the first',
      'Very heavy items (300 lb+): from $75',
      'Packing help: $60 per hour per packer, plus materials',
      'Evenings and weekends: same price when we have room',
    ],
    included: [
      'Moving blankets, wrapping and straps',
      'Furniture taken apart and put back together',
      'Fuel and travel for the routes listed above',
      'A written price before you book: no surprise fees',
    ],
    faqs: [
      { question: 'Are these the final prices?', answer: 'They are starting prices for a normal job. Your written quote is based on what you’re moving, the stairs and access at both ends and your date, and it’s confirmed before anything is booked.' },
      { question: 'How do distance and fuel change the price?', answer: 'The listed route prices already include fuel and driving time for those routes. Longer trips are priced by the kilometre, a fuel surcharge may be added when fuel prices are high, and 407 tolls are only added if the route uses it. Your written quote shows all of it.' },
      { question: 'Do hourly prices include travel time?', answer: 'Local hourly jobs include a short travel time to the first address. Long-distance moves are quoted as a flat price that already includes the drive.' },
      { question: 'Is there a deposit?', answer: 'A small deposit holds your date. The rest is paid when the job is done.' },
      { question: 'Can I get a price without a home visit?', answer: 'Yes. Send your addresses, date and a list or photos of what’s moving, and you get a written quote, usually the same day.' },
    ],
  },
  routes: { image: '' },
  // Default banner for every town page (each town can have its own under H&N town banners).
  towns: { image: '' },
  // The Long-Distance Moving card added to the service cards on the main site.
  servicesCard: {
    enabled: true,
    title: 'Long-Distance Moving',
    text: 'Moving between Hamilton, Niagara and Toronto or the GTA? One crew loads, drives and unloads, with a written quote before you book.',
    image: 'https://nowsajdmbpxvlvrhopjg.supabase.co/storage/v1/object/public/blog-images/sunwings/1794780070381-grimsby-toronto-moving-van.jpg',
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
  // The banner's bottom wave matches the cream page, so no white strip shows under it.
  'body .wave path{fill:#FBF8F0}',
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
