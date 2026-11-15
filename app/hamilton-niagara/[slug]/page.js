import Link from 'next/link';
import { notFound } from 'next/navigation';
import PageHero from '@/components/PageHero';
import PhotoGallery from '@/components/PhotoGallery';
import QuoteDrawerTrigger from '@/components/QuoteDrawerTrigger';
import TrustStrip from '@/components/TrustStrip';
import { photoSettings, rotatingHeroImage } from '@/components/heroSlides';
import { getLocations, getServices, getSiteSettings } from '@/lib/content';
import { HN, HN_ROUTES, HN_SERVICES, HN_TRUST, getHnContent, hnRouteHref, isHnTown, keepLinksInSection } from '@/lib/hamiltonNiagara';
import { ROUTE_SERVICE } from '@/lib/routes';
import { extractServicePhotos } from '@/lib/servicePhotos';
import { getHnTownBanner } from '@/lib/routeBanners';

// One page per Hamilton & Niagara town (/hamilton-niagara/grimsby) and per section service
// (/hamilton-niagara/furniture-delivery). Links on these pages stay inside the section.
// Town pages use the town's Location Post; service page banners are edited in
// Admin › Banners & Pop-up › Hamilton & Niagara (blank = the main site's Service Post).
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
    // Photos typed into the post's text go into the proper gallery (same size, opens over the page).
    const townBody = extractServicePhotos(town.body_html);
    // This town's own Hamilton & Niagara banner (Admin › H&N town banners); blank = its Location Post.
    const own = await getHnTownBanner(town.slug);
    return (
      <>
        <PageHero
          placement={`hamilton-niagara-${town.slug}`}
          crumbs={[{ label: 'Hamilton & Niagara', href: HN }, { label: town.title }]}
          eyebrow={own.eyebrow || town.eyebrow || `${town.title} moving & transport`}
          title={own.heading || town.hero_title || `${town.title} movers`}
          accent={own.accent || undefined}
          description={own.text || town.hero_description || town.intro}
          image={own.image || town.banner_image}
          imagePosition={photoSettings(own)}
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
            {townBody.html ? <div dangerouslySetInnerHTML={{ __html: keepLinksInSection(townBody.html, townSlugs) }}/> : null}
            {townBody.photos.length ? <><h2>{townBody.title || `Our work in ${town.title}`}</h2><PhotoGallery photos={townBody.photos} initial={3}/></> : null}
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
  const [services, content] = await Promise.all([getServices(), getHnContent()]);
  const main = services.find(item => item.slug === service.serviceSlug);
  const isLong = service.slug === 'long-distance';
  const copy = content[service.slug] || {};
  const title = copy.heading || (isLong ? service.label : (main?.hero_title || service.label));
  const description = copy.text || (isLong ? '' : (main?.hero_description || main?.intro || ''));
  const image = copy.image || (isLong ? '' : main?.banner_image);
  const sendList = (copy.sendList || []).filter(Boolean);
  const preset = service.preset || main?.title || service.label;
  // Photos typed into the Service Post's text go into the proper gallery (same size, opens over the page).
  const body = extractServicePhotos(isLong ? '' : main?.body_html);
  return (
    <>
      <PageHero
        placement={`hamilton-niagara-${service.slug}`}
        crumbs={[{ label: 'Hamilton & Niagara', href: HN }, { label: service.label }]}
        eyebrow={copy.eyebrow}
        title={title}
        accent={copy.accent}
        description={description}
        image={image}
        imagePosition={photoSettings(copy)}
        imageAlt={main?.banner_alt || service.label}
        phone={settings.phone}
        preset={preset}
      />
      <TrustStrip items={HN_TRUST}/>
      <section className="section">
        <div className="container prose hn-prose" style={{ maxWidth: 900 }}>
          {!isLong && main?.intro ? <p className="lead-p">{main.intro}</p> : null}
          {body.html ? <div dangerouslySetInnerHTML={{ __html: keepLinksInSection(body.html, townSlugs) }}/> : null}
          {body.photos.length ? <>
            <h2>{body.title || `${service.label} photos`}</h2>
            <PhotoGallery photos={body.photos} initial={3}/>
          </> : null}
          {isLong ? <>
            <h2>Routes we run</h2>
            <div className="side-links" style={{ marginTop: 10 }}>
              {HN_ROUTES.map(route => <Link key={route.slug} href={hnRouteHref(route)}>{route.from} → {route.to}</Link>)}
            </div>
            {sendList.length ? <>
              <h2>What to send for your quote</h2>
              <ul>{sendList.map(line => <li key={line}>{line}</li>)}</ul>
            </> : null}
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
