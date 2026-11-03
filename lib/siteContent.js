import { getSiteSettings } from './content';
import { CONTENT_DEFAULTS } from './contentDefaults';
import { serviceCopy as DEFAULT_SERVICE_COPY, servicePricing as DEFAULT_SERVICE_PRICING } from './servicePricing';

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

export async function getSiteContent() {
  const settings = await getSiteSettings();

  const snowPricing = objectSetting(settings, 'snow_pricing', DEFAULT_SERVICE_PRICING['snow-removal']);
  const snowPage = objectSetting(settings, 'snow_page', DEFAULT_SERVICE_COPY['snow-removal']);
  const pageBanners = Object.fromEntries(
    Object.entries(CONTENT_DEFAULTS.page_banners).map(([pageId, fallback]) => {
      const saved = parse(settings.page_banners)?.[pageId];
      return [pageId, saved && typeof saved === 'object' ? { ...fallback, ...saved } : fallback];
    }),
  );

  return {
    pricing: { ...DEFAULT_SERVICE_PRICING, 'snow-removal': snowPricing },
    serviceCopy: { ...DEFAULT_SERVICE_COPY, 'snow-removal': snowPage },
    popup: objectSetting(settings, 'promo_popup', CONTENT_DEFAULTS.promo_popup),
    heroSlides: listSetting(settings, 'hero_slides', CONTENT_DEFAULTS.hero_slides).filter(slide => slide?.enabled !== false),
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
