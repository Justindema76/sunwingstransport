// Banners for the long-distance pages, edited in Admin › Banners & Pop-up › Route pages.
// Saved in the `route_banners` site setting: { 'long-distance': {...}, '<route slug>': {...} }.
// Each: eyebrow, heading, accent, text, image + photo position. Blank fields keep the page's own.
// A route's banner is used on both the main-site route page and the Hamilton & Niagara one.
import { getSiteSettings } from './content';

export async function getRouteBanners() {
  const raw = (await getSiteSettings())?.route_banners;
  try {
    const value = typeof raw === 'string' ? JSON.parse(raw) : raw;
    return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  } catch {
    return {};
  }
}

export async function getRouteBanner(key) {
  const banner = (await getRouteBanners())[key];
  return banner && typeof banner === 'object' ? banner : {};
}

// Banners for the Hamilton & Niagara town pages (Admin › H&N town banners), saved in the
// `hn_town_banners` setting by town slug. Blank fields keep the town's Location Post.
export async function getHnTownBanner(slug) {
  const raw = (await getSiteSettings())?.hn_town_banners;
  try {
    const value = typeof raw === 'string' ? JSON.parse(raw) : raw;
    const banner = value && typeof value === 'object' ? value[slug] : null;
    return banner && typeof banner === 'object' ? banner : {};
  } catch {
    return {};
  }
}
