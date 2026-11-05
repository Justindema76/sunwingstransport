import { getLocations, getSiteSettings } from './content';
import { CONTENT_DEFAULTS } from './contentDefaults';
import { servicePricing as DEFAULT_SERVICE_PRICING } from './servicePricing';

const SNOW_SLUG = 'snow-removal';

// Content edited in Admin › Promotions & Banners. Each piece is stored as JSON in a
// sunwings_site_settings key; anything missing or unreadable falls back to the defaults.

function parse(raw) {
  if (raw && typeof raw === 'object') return raw;
  try {
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function objectSetting(settings, key, fallback) {
  const value = parse(settings[key]);
  return value && typeof value === 'object' && !Array.isArray(value) ? { ...fallback, ...value } : fallback;
}

function listSetting(settings, key, fallback) {
  const value = parse(settings[key]);
  return Array.isArray(value) ? value : fallback;
}

// Only the values actually saved in the admin (blank ones ignored), or null if nothing is saved.
function savedObject(settings, key) {
  const value = parse(settings[key]);
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const filled = Object.fromEntries(Object.entries(value).filter(([, item]) =>
    item !== null && item !== undefined && item !== '' && !(Array.isArray(item) && !item.length)));
  return Object.keys(filled).length ? filled : null;
}

// Snow service areas = the published locations that have Snow Removal ticked in Admin › Locations
// (or that tick it from the Snow Removal service post), grouped by region.
function snowRegionsFromLocations(locations = []) {
  const picked = locations.filter(location => Array.isArray(location.service_slugs) && location.service_slugs.includes(SNOW_SLUG));
  const groups = new Map();
  for (const location of picked) {
    const label = String(location.region || 'Service area').trim();
    if (!groups.has(label)) groups.set(label, []);
    groups.get(label).push({ label: location.title, href: `/locations/${location.slug}` });
  }
  return [...groups.entries()].map(([label, places]) => ({ label, places }));
}

export function placesText(regions = []) {
  const names = regions.flatMap(region => region.places.map(place => place.label)).filter(Boolean);
  if (names.length <= 1) return names[0] || '';
  return `${names.slice(0, -1).join(', ')} & ${names[names.length - 1]}`;
}


export async function getSiteContent() {
  const [settings, locations] = await Promise.all([getSiteSettings(), getLocations()]);

  const savedSnowPricing = savedObject(settings, 'snow_pricing');
  const snowPricing = { ...DEFAULT_SERVICE_PRICING[SNOW_SLUG], ...(savedSnowPricing || {}) };
  // Areas typed into Promotions › Snow removal plans win; otherwise follow the ticked locations.
  if (!savedSnowPricing?.regions) {
    const regions = snowRegionsFromLocations(locations);
    if (regions.length) snowPricing.regions = regions;
  }
  const snowAreas = placesText(snowPricing.regions);
  // The Snow Removal service post is the page's content. Promotions › Snow removal page only
  // replaces the fields that were actually filled in there.
  const snowPage = savedObject(settings, 'snow_page');
  const withAreas = text => typeof text === 'string' && snowAreas ? text.replace(/Markham, Stouffville & Toronto/g, snowAreas) : text;
  const pageBanners = Object.fromEntries(
    Object.entries(CONTENT_DEFAULTS.page_banners).map(([pageId, fallback]) => {
      const saved = parse(settings.page_banners)?.[pageId];
      return [pageId, saved && typeof saved === 'object' ? { ...fallback, ...saved } : fallback];
    }),
  );

  return {
    pricing: { ...DEFAULT_SERVICE_PRICING, [SNOW_SLUG]: snowPricing },
    serviceCopy: snowPage ? { [SNOW_SLUG]: snowPage } : {},
    snowAreas,
    // The starting promo text names the snow areas; keep it in step with the ticked locations.
    popup: (popup => ({ ...popup, text: withAreas(popup.text) }))(objectSetting(settings, 'promo_popup', CONTENT_DEFAULTS.promo_popup)),
    heroSlides: listSetting(settings, 'hero_slides', CONTENT_DEFAULTS.hero_slides)
      .filter(slide => slide?.enabled !== false)
      .map(slide => slide.slug === SNOW_SLUG ? { ...slide, text: withAreas(slide.text) } : slide),
    pageBanners,
    pricingPanel: listSetting(settings, 'pricing_panel', CONTENT_DEFAULTS.pricing_panel),
    priceMatch: objectSetting(settings, 'price_match', CONTENT_DEFAULTS.price_match),
    trustLinks: listSetting(settings, 'trust_links', CONTENT_DEFAULTS.trust_links),
  };
}

// Helpers that used to read the hard-coded pricing; they now take the loaded content.
export function servicePricingFor(content, slug) {
  return content.pricing[slug] || null;
}

export function withServiceCopy(content, service) {
  return service && content.serviceCopy[service.slug] ? { ...service, ...content.serviceCopy[service.slug] } : service;
}

export function pricedServicesForLocation(content, locationSlug) {
  const href = `/locations/${locationSlug}`;
  return Object.entries(content.pricing)
    .filter(([, pricing]) => (pricing.regions || []).some(region => region.places.some(place => place.href === href)))
    .map(([slug, pricing]) => ({ slug, ...pricing }));
}

// The featured plan's price as one string, e.g. "from $175/month".
export function featuredPrice(pricing) {
  const plan = pricing?.cards?.find(card => card.featured);
  return plan ? `${plan.prefix ? `${plan.prefix} ` : ''}${plan.amount}${plan.unit || ''}` : '';
}
