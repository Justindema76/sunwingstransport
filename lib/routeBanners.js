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
