import Link from 'next/link';
import { Building2, GraduationCap, MapPin, Mountain, Route, Truck } from 'lucide-react';
import { notFound } from 'next/navigation';
import PageHero from '@/components/PageHero';
import PhotoGallery from '@/components/PhotoGallery';
import QuoteDrawerTrigger from '@/components/QuoteDrawerTrigger';
import { HnPriceTeaser, HnQuoteBand } from '@/components/HnPricing';
import TrustStrip from '@/components/TrustStrip';
import { photoSettings, rotatingHeroImage } from '@/components/heroSlides';
import { HERO_IMAGE_OPTIONS } from '@/lib/contentDefaults';
import { getLocations, getServices, getSiteSettings } from '@/lib/content';
import { HN, HN_ROUTES, HN_SERVICES, HN_TRUST, getHnContent, hnRouteHref, isHnTown, keepLinksInSection, hnMetadata } from '@/lib/hamiltonNiagara';
import { extractAllPhotos, extractServicePhotos } from '@/lib/servicePhotos';
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
  return hnMetadata(page.service.slug, `${HN}/${page.service.slug}`);
}

const NOTE_ICONS = { map: MapPin, building: Building2, route: Route, mountain: Mountain, graduation: GraduationCap, truck: Truck };

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
    const townBody = extractAllPhotos(town.body_html);
    // This town's own Hamilton & Niagara banner (Admin › H&N town banners). Photo blank = the default for
    // all towns (Admin › Hamilton & Niagara › Town pages), else the Lakeside Drive van; text blank =
    // its Location Post.
    const [own, hnContent] = await Promise.all([getHnTownBanner(town.slug), getHnContent()]);
    const townDefault = hnContent.towns?.image ? hnContent.towns : null;
    const localNotes = Array.isArray(town.local_notes) ? town.local_notes.filter(note => note?.title || note?.text) : [];
    const townFaqs = Array.isArray(town.faq) ? town.faq.filter(item => item?.question && item?.answer) : [];
    return (
      <>
        <PageHero
          placement={`hamilton-niagara-${town.slug}`}
          crumbs={[{ label: 'Hamilton & Niagara', href: HN }, { label: town.title }]}
          eyebrow={own.eyebrow || town.eyebrow || `${town.title} moving & transport`}
          title={own.heading || town.hero_title || `${town.title} movers`}
          accent={own.accent || undefined}
          description={own.text || town.hero_description || town.intro}
          image={own.image || townDefault?.image || HERO_IMAGE_OPTIONS.lakeside}
          imagePosition={photoSettings(own.image || own.desktopPosition || own.mobilePosition ? own : (townDefault || {}))}
          imageAlt={town.banner_alt}
          fallbackImage={rotatingHeroImage(town.slug)}
          phone={settings.phone}
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
            {/* Local details, recent job and questions: edited in Admin › Location Posts › <town>. */}
            {localNotes.length ? <>
              <h2>Moving in {town.title}: what to know</h2>
              <div className="grid-3 local-note-grid">
                {localNotes.map((note, index) => {
                  const Icon = NOTE_ICONS[note.icon] || MapPin;
                  return <div className="side-card local-note-card" key={`${note.title}-${index}`}>
                    <div className="local-note-icon"><Icon size={24}/></div>
                    <h3>{note.title}</h3>
                    <p>{note.text}</p>
                  </div>;
                })}
              </div>
            </> : null}
            {town.recent_job ? <div className="note-box"><b>Recent {town.title} job:</b> {town.recent_job}</div> : null}
            {townBody.html ? <div dangerouslySetInnerHTML={{ __html: keepLinksInSection(townBody.html, townSlugs) }}/> : null}
            {townBody.photos.length ? <><h2>Sunwings job photos</h2><PhotoGallery photos={townBody.photos} initial={3}/></> : null}
            {townFaqs.length ? <>
              <h2>{town.title} moving questions</h2>
              <div className="service-faqs">
                {townFaqs.map((item, index) => <details key={`${item.question}-${index}`} open><summary>{item.question}</summary><p>{item.answer}</p></details>)}
              </div>
            </> : null}
            <HnPriceTeaser pricing={hnContent.pricing} pricingHref={`${HN}/pricing`}/>
          </div>
        </section>
        <HnQuoteBand phone={settings.phone} heading={town.cta_title || `Moving in ${town.title}? Get your price.`}/>
        {townFaqs.length ? <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: townFaqs.map(item => ({ '@type': 'Question', name: item.question, acceptedAnswer: { '@type': 'Answer', text: item.answer } })),
        }) }}/> : null}
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
  // Page sections, all edited in Admin › Hamilton & Niagara › <page>. Empty ones are hidden.
  const list = value => (Array.isArray(value) ? value : String(value || '').split('\n')).map(item => (typeof item === 'string' ? item.trim() : item)).filter(Boolean);
  const intro = copy.intro || (isLong ? '' : main?.intro || '');
  const handle = list(copy.handle);
  const steps = list(copy.steps).filter(step => step?.title || step?.text);
  const local = String(copy.local || '').split(/\n\s*\n/).map(text => text.trim()).filter(Boolean);
  const quoteFactors = list(copy.quoteFactors);
  const faqs = list(copy.faqs).filter(item => item?.question && item?.answer);
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
          {intro ? <p className="lead-p">{intro}</p> : null}
          {/* The Service Post's own text is the main-site version, so only its photos are used here. */}
          {!copy.intro && body.html ? <div dangerouslySetInnerHTML={{ __html: keepLinksInSection(body.html, townSlugs) }}/> : null}
          {handle.length ? <>
            <h2>{copy.handleTitle || 'What we handle'}</h2>
            <ul className="checks">{handle.map(item => <li key={item}>{item}</li>)}</ul>
          </> : null}
          {body.photos.length ? <>
            <h2>{body.title || `${service.label} photos`}</h2>
            <PhotoGallery photos={body.photos} initial={3}/>
          </> : null}
          {steps.length ? <>
            <h2>{copy.stepsTitle || 'How it works'}</h2>
            <div className="hn-steps">
              {steps.map((step, index) => <div className="hn-step" key={`${step.title}-${index}`}><span>{index + 1}</span><div><b>{step.title}</b>{step.text ? <p>{step.text}</p> : null}</div></div>)}
            </div>
          </> : null}
          {local.length ? <>
            <h2>{copy.localTitle || `${service.label} in Hamilton and Niagara`}</h2>
            {local.map(text => <p key={text.slice(0, 40)}>{text}</p>)}
          </> : null}
          {quoteFactors.length ? <>
            <h2>{copy.quoteTitle || 'What your quote is based on'}</h2>
            <ul className="checks one">{quoteFactors.map(item => <li key={item}>{item}</li>)}</ul>
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
          {faqs.length ? <>
            <h2>{service.label} questions</h2>
            <div className="service-faqs">
              {faqs.map((item, index) => <details key={`${item.question}-${index}`} open><summary>{item.question}</summary><p>{item.answer}</p></details>)}
            </div>
          </> : null}
          <HnPriceTeaser pricing={content.pricing} pricingHref={`${HN}/pricing`} preset={preset}/>
        </div>
      </section>
      <HnQuoteBand phone={settings.phone} preset={preset}/>
      {faqs.length ? <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map(item => ({ '@type': 'Question', name: item.question, acceptedAnswer: { '@type': 'Answer', text: item.answer } })),
      }) }}/> : null}
    </>
  );
}
