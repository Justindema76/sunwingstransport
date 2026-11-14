import { getPageBuilderData, getServices } from '@/lib/content';
import { getSiteContent } from '@/lib/siteContent';
import { safeHeroImage } from '@/components/heroSlides';

// The exact photo each banner shows on the live site, so the admin's photo position
// editor previews the same picture. Uses the same rules as the pages themselves.
const PAGES = ['services', 'locations', 'pricing', 'blog', 'contact', 'privacy'];
const isHero = block => block?.type === 'SunwingsHeroBlock' || block?.type === 'HeroBlock';
const heroImage = data => (data?.content || []).find(isHero)?.props?.image || '';

export async function GET() {
  const [content, services, home, ...pages] = await Promise.all([
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
  };
  return Response.json(body, { headers: { 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'no-store' } });
}
