import { getLocations, getPageBuilderData, getServices, getSiteSettings } from '@/lib/content';
import { isHnTown } from '@/lib/hamiltonNiagara';
import { getSiteContent } from '@/lib/siteContent';
import { safeHeroImage } from '@/components/heroSlides';
import { HERO_IMAGE_OPTIONS, RETIRED_HERO_IMAGES } from '@/lib/contentDefaults';
import { getRouteBanners } from '@/lib/routeBanners';
import { ROUTES } from '@/lib/routes';

// The exact photo each banner shows on the live site, so the admin's photo position
// editor previews the same picture. Uses the same rules as the pages themselves.
const PAGES = ['services', 'locations', 'pricing', 'blog', 'contact', 'privacy'];
const isHero = block => block?.type === 'SunwingsHeroBlock' || block?.type === 'HeroBlock';
const heroImage = data => (data?.content || []).find(isHero)?.props?.image || '';

export async function GET() {
  const [locations, townBannersRaw, routeBanners, content, services, home, ...pages] = await Promise.all([
    getLocations(),
    getSiteSettings().then(settings => settings?.hn_town_banners),
    getRouteBanners(),
    getSiteContent(),
    getServices(),
    getPageBuilderData('home'),
    ...PAGES.map(id => getPageBuilderData(id)),
  ]);
  const banner = slug => services.find(service => service.slug === slug)?.banner_image || '';
  const homeImage = heroImage(home);

  const body = {
    // Homepage slider: the first slide uses the Home page photo when it has none of its own.
    slides: content.heroSlides.map((slide, index) => safeHeroImage(slide.image || (index === 0 && homeImage ? homeImage : banner(slide.slug)))),
    pages: Object.fromEntries(PAGES.map((id, i) => [id, safeHeroImage(content.pageBanners?.[id]?.image || heroImage(pages[i]))])),
    services: Object.fromEntries(services.map(service => [service.slug, safeHeroImage(service.banner_image)])),
    // Route pages (Admin › Route pages): the route's own photo, else the QEW highway photo.
    routes: Object.fromEntries([['long-distance', routeBanners['long-distance']?.image || HERO_IMAGE_OPTIONS.highway], ...ROUTES.map(route => [route.slug, routeBanners[route.slug]?.image || HERO_IMAGE_OPTIONS.highway])]),
    // Hamilton & Niagara town pages (Admin › H&N town banners): list + the photo each shows now.
    hnTowns: (() => {
      let own = {};
      try { own = (typeof townBannersRaw === 'string' ? JSON.parse(townBannersRaw) : townBannersRaw) || {}; } catch {}
      return locations.filter(isHnTown).map(town => ({ slug: town.slug, title: town.title, region: town.region, image: own[town.slug]?.image || HERO_IMAGE_OPTIONS.road }));
    })(),
    // Old photos the site swaps for newer ones, so the admin can show (and save) the photo that's really live.
    retired: RETIRED_HERO_IMAGES,
  };
  return Response.json(body, { headers: { 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'no-store' } });
}
