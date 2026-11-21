import { getLocations, getServiceBySlug } from '@/lib/content';
import { SNOW_SLUG, getSiteContent, servicePricingFor, withServiceCopy } from '@/lib/siteContent';
import { HN_REGIONS, getHnContent, hnSnowHref, isHnTown } from '@/lib/hamiltonNiagara';

// Everything the Hamilton & Niagara snow pages need: the section's own snow text, the main
// site's snow plans (same prices), and the section's towns in place of the GTA "Now booking in" list.
export async function getHnSnow() {
  const [locations, rawService, content, hn] = await Promise.all([getLocations(), getServiceBySlug(SNOW_SLUG), getSiteContent(), getHnContent()]);
  const service = withServiceCopy(content, rawService);
  const skip = new Set(hn['snow-removal'].skipTowns || []);
  const towns = locations.filter(town => isHnTown(town) && !skip.has(town.slug));
  const base = servicePricingFor(content, SNOW_SLUG);
  const regions = HN_REGIONS
    .map(region => ({ label: region.title, places: towns.filter(town => town.region === region.key).map(town => ({ label: town.title, href: hnSnowHref(town) })) }))
    .filter(region => region.places.length);
  const pricing = base ? { ...base, eyebrow: 'Snow removal pricing', text: hn['snow-removal'].text || base.text, regions } : null;
  return { service, towns, pricing, copy: hn['snow-removal'], hn };
}
