// Which part of the site each service and blog post shows on: the main site (Toronto & GTA),
// the Hamilton & Niagara section, or both. Chosen per item in the admin ("Show on") and saved
// in the `site_sections` setting as { services: { <slug>: 'both'|'main'|'hn' }, blog: { ... } }.
export const AREAS = ['both', 'main', 'hn'];

// Before anything is chosen: blog posts show on both; services show on the main site, and the
// ones the Hamilton & Niagara section already offered show there too.
const HN_DEFAULT_SERVICES = ['furniture-delivery', 'commercial-transport'];

export function readSiteSections(settings) {
  let value = settings?.site_sections;
  if (typeof value === 'string') { try { value = JSON.parse(value); } catch { value = null; } }
  return {
    services: value && typeof value.services === 'object' ? value.services : {},
    blog: value && typeof value.blog === 'object' ? value.blog : {},
  };
}

export function sectionFor(kind, slug, sections) {
  const saved = sections?.[kind]?.[slug];
  if (AREAS.includes(saved)) return saved;
  if (kind === 'services') return HN_DEFAULT_SERVICES.includes(slug) ? 'both' : 'main';
  return 'both';
}

// Snow removal is only offered in Markham, Stouffville and Toronto, so snow services and snow posts
// stay off the Hamilton & Niagara section unless one is set to "Hamilton & Niagara" on purpose.
const isSnow = slug => /snow/i.test(String(slug || ''));

export const showsOn = (kind, slug, area, sections) => {
  const choice = sectionFor(kind, slug, sections);
  if (area === 'hn' && isSnow(slug)) return choice === 'hn';
  return choice === 'both' || choice === area;
};
