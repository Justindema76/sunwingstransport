import Link from 'next/link';
import { notFound } from 'next/navigation';
import PageHero from '@/components/PageHero';
import QuoteDrawerTrigger from '@/components/QuoteDrawerTrigger';
import TrustStrip from '@/components/TrustStrip';
import { rotatingHeroImage } from '@/components/heroSlides';
import { getLocations, getServices, getSiteSettings } from '@/lib/content';
import { HN, HN_ROUTES, HN_SERVICES, HN_TRUST, hnRouteHref, isHnTown, keepLinksInSection } from '@/lib/hamiltonNiagara';
import { ROUTE_SERVICE } from '@/lib/routes';

// One page per Hamilton & Niagara town (/hamilton-niagara/grimsby) and per section service
// (/hamilton-niagara/furniture-delivery). Links on these pages stay inside the section.
const LONG_DISTANCE = {
  title: 'Long-distance moving', accent: 'Hamilton & Niagara ↔ Toronto.',
  text: 'Full home moves between Hamilton, Burlington, Grimsby, St. Catharines, Niagara Falls and Toronto, Mississauga and the GTA. Planned around access at both ends, quoted in writing before you book.',
  image: 'https://nowsajdmbpxvlvrhopjg.supabase.co/storage/v1/object/public/blog-images/sunwings/1794229390663-IMG_8141.jpeg',
};

async function findPage(slug) {
  const service = HN_SERVICES.find(item => item.slug === slug);
  if (service) return { kind: 'service', service };
  const towns = (await getLocations()).filter(isHnTown);
  const town = towns.find(item => item.slug === slug);
  return town ? { kind: 'town', town, towns } : null;
}

export async function generateStaticParams() {
  const towns = (await getLocations()).filter(isHnTown);
  return [...HN_SERVICES.map(item => ({ slug: item.slug })), ...towns.map(town => ({ slug: town.slug }))];
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const page = await findPage(slug);
  if (!page) return {};
  if (page.kind === 'town') {
    const title = `${page.town.title} Movers & Long-Distance Transport | Sunwings Hamilton & Niagara`;
    // Same text as the main town page, so Google is pointed at that one.
    return { title: { absolute: title }, description: page.town.seo_description || page.town.intro, alternates: { canonical: `/locations/${page.town.slug}` } };
  }
  const title = `${page.service.label} in Hamilton & Niagara | Sunwings Transport`;
  return { title: { absolute: title }, description: `${page.service.label} across Hamilton, Burlington and the Niagara Region, and to Toronto and the GTA.`, alternates: { canonical: `${HN}/${page.service.slug}` } };
}

export default async function HnSlugPage({ params }) {
  const { slug } = await params;
  const page = await findPage(slug);
  if (!page) notFound();
  const settings = await getSiteSettings();
  const towns = page.towns || (await getLocations()).filter(isHnTown);
  const townSlugs = towns.map(town => town.slug);

  if (page.kind === 'town') {
    const { town } = page;
    const routes = HN_ROUTES.filter(route => route.fromSlug === town.slug || route.toSlug === town.slug);
    return (
      <>
        <PageHero
          placement={`hamilton-niagara-${town.slug}`}
          crumbs={[{ label: 'Hamilton & Niagara', href: HN }, { label: town.title }]}
          eyebrow={town.eyebrow || `${town.title} moving & transport`}
          title={town.hero_title || `${town.title} movers`}
          description={town.hero_description || town.intro}
          image={town.banner_image}
          imageAlt={town.banner_alt}
          fallbackImage={rotatingHeroImage(town.slug)}
          phone={settings.phone}
          preset={ROUTE_SERVICE}
        />
        <TrustStrip items={HN_TRUST}/>
        <section className="section">
          <div className="container prose hn-prose" style={{ maxWidth: 900 }}>
            {town.intro ? <p className="lead-p">{town.intro}</p> : null}
            <span className="kicker">In {town.title}</span>
            <h2 style={{ marginTop: 0 }}>What we do in {town.title}</h2>
            <div className="grid-3">
              {HN_SERVICES.map(item => (
                <Link className="side-card" key={item.slug} href={`${HN}/${item.slug}`}>
                  <h3>{item.label}</h3>
                  <p>{item.slug === 'long-distance' ? `${town.title} to Toronto, Mississauga and the GTA.` : `In ${town.title} and across the region.`}</p>
                </Link>
              ))}
            </div>
            {routes.length ? <>
              <h2>Popular routes from {town.title}</h2>
              <div className="side-links" style={{ marginTop: 10 }}>
                {routes.map(route => <Link key={route.slug} href={hnRouteHref(route)}>{route.from} → {route.to}</Link>)}
              </div>
            </> : null}
            {(town.neighbourhoods || []).length ? <>
              <h2>Neighbourhoods we cover</h2>
              <div className="chips">{town.neighbourhoods.map(item => <span className="chip" key={item}>{item}</span>)}</div>
            </> : null}
            {town.body_html ? <div dangerouslySetInnerHTML={{ __html: keepLinksInSection(town.body_html, townSlugs) }}/> : null}
            <div className="cta-inline">
              <div>
                <h3>{town.cta_title || `Moving in ${town.title}?`}</h3>
                <p>Pickup city, destination, your date and what’s being moved is all we need to start.</p>
              </div>
              <QuoteDrawerTrigger className="btn btn-accent" preset={ROUTE_SERVICE}>Get my quote →</QuoteDrawerTrigger>
            </div>
          </div>
        </section>
      </>
    );
  }

  // Service page
  const { service } = page;
  const services = await getServices();
  const main = services.find(item => item.slug === service.serviceSlug);
  const isLong = service.slug === 'long-distance';
  const title = isLong ? LONG_DISTANCE.title : (main?.hero_title || service.label);
  const description = isLong ? LONG_DISTANCE.text : (main?.hero_description || main?.intro || '');
  const preset = service.preset || main?.title || service.label;
  return (
    <>
      <PageHero
        placement={`hamilton-niagara-${service.slug}`}
        crumbs={[{ label: 'Hamilton & Niagara', href: HN }, { label: service.label }]}
        eyebrow="Hamilton & Niagara"
        title={title}
        accent={isLong ? LONG_DISTANCE.accent : 'Hamilton & Niagara.'}
        description={description}
        image={isLong ? LONG_DISTANCE.image : main?.banner_image}
        imageAlt={main?.banner_alt || service.label}
        phone={settings.phone}
        preset={preset}
      />
      <TrustStrip items={HN_TRUST}/>
      <section className="section">
        <div className="container prose hn-prose" style={{ maxWidth: 900 }}>
          {!isLong && main?.intro ? <p className="lead-p">{main.intro}</p> : null}
          {!isLong && main?.body_html ? <div dangerouslySetInnerHTML={{ __html: keepLinksInSection(main.body_html, townSlugs) }}/> : null}
          {isLong ? <>
            <h2>Routes we run</h2>
            <div className="side-links" style={{ marginTop: 10 }}>
              {HN_ROUTES.map(route => <Link key={route.slug} href={hnRouteHref(route)}>{route.from} → {route.to}</Link>)}
            </div>
            <h2>What to send for your quote</h2>
            <ul>
              <li>Pickup and delivery cities and addresses, and your moving date.</li>
              <li>Home size or item list, with photos of large or awkward pieces.</li>
              <li>Stairs, elevators, parking and carrying distance at both ends.</li>
            </ul>
          </> : null}
          <h2>Towns we serve</h2>
          <div className="chips">{towns.map(town => <Link className="chip" key={town.slug} href={`${HN}/${town.slug}`}>{town.title}</Link>)}</div>
          <div className="cta-inline">
            <div>
              <h3>Get a written quote</h3>
              <p>Tell us where it’s going and what’s being moved.</p>
            </div>
            <QuoteDrawerTrigger className="btn btn-accent" preset={preset}>Get my quote →</QuoteDrawerTrigger>
          </div>
        </div>
      </section>
    </>
  );
}
