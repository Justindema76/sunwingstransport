import Link from 'next/link';
import { notFound } from 'next/navigation';
import BreadcrumbSchema from '@/components/BreadcrumbSchema';
import HowItWorks from '@/components/HowItWorks';
import PageHero from '@/components/PageHero';
import QuoteDrawerTrigger from '@/components/QuoteDrawerTrigger';
import QuoteForm from '@/components/QuoteForm';
import TrustStrip from '@/components/TrustStrip';
import { HERO_IMAGE_OPTIONS } from '@/lib/contentDefaults';
import { getBaseUrl, getLocations, getServices, getSiteSettings } from '@/lib/content';
import { telHref } from '@/lib/phone';
import { ROUTES, ROUTE_SERVICE, reverseRoute, routeBySlug, routeHref, routeTips, townAreas } from '@/lib/routes';

// One landing page per moving route (e.g. /long-distance/hamilton-to-toronto), made for ads.
// No prices: the visitor sends the job and gets a quote.

export function generateStaticParams() {
  return ROUTES.map(route => ({ route: route.slug }));
}

export async function generateMetadata({ params }) {
  const { route: slug } = await params;
  const route = routeBySlug(slug);
  if (!route) return {};
  const url = `${getBaseUrl()}${routeHref(route)}`;
  const title = `${route.from} to ${route.to} Movers | Free Quote | Sunwings Transport`;
  const description = `${route.from} to ${route.to} movers: one crew and one truck, door to door, ${route.distance}. Condos, apartments, houses and single items. Get a free moving quote.`;
  const image = { url: HERO_IMAGE_OPTIONS.truck, alt: `Sunwings moving truck for ${route.from} to ${route.to} moves` };
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: url },
    openGraph: { type: 'website', url, title, description, siteName: 'Sunwings Transport', locale: 'en_CA', images: [image] },
    twitter: { card: 'summary_large_image', title, description, images: [image.url] },
  };
}

export default async function RoutePage({ params }) {
  const { route: slug } = await params;
  const route = routeBySlug(slug);
  if (!route) notFound();
  const [services, settings, locations] = await Promise.all([getServices(), getSiteSettings(), getLocations()]);

  const fill = { pickupCity: route.from, dropoffCity: route.to };
  const back = reverseRoute(route);
  const others = ROUTES.filter(item => item.slug !== route.slug && item.slug !== back?.slug);
  const townPage = townSlug => locations.find(location => location.slug === townSlug);
  const fromAreas = townAreas(route.fromSlug);
  const toAreas = townAreas(route.toSlug);
  const tips = routeTips(route);
  const crumbs = [{ label: 'Home', href: '/' }, { label: 'Long Distance', href: '/long-distance' }, { label: `${route.from} to ${route.to}` }];

  const faqs = [
    { question: `How much does it cost to move from ${route.from} to ${route.to}?`, answer: `Every move is different, so we quote each one. Send your addresses, moving date, item list and a few photos, and we’ll reply with a quote for your ${route.from} to ${route.to} move.` },
    { question: `How long does a move from ${route.from} to ${route.to} take?`, answer: `The drive is ${route.distance}, ${route.drive}. Most apartment and smaller home moves on this route are done in one day; we confirm the timing with your quote.` },
    { question: 'Does the same crew do the whole move?', answer: `Yes. The crew that loads your home in ${route.from} drives it to ${route.to} and unloads it. Your things stay on one truck the whole way.` },
    { question: 'Do you move furniture and appliances only?', answer: 'Yes, we can move a single large item, a few pieces or a full home. List what you need moved on the quote form.' },
  ];

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: `${route.from} to ${route.to} Movers`,
    serviceType: 'Long-distance moving',
    url: `${getBaseUrl()}${routeHref(route)}`,
    description: route.intro,
    areaServed: [{ '@type': 'City', name: route.from }, { '@type': 'City', name: route.to }],
    provider: { '@type': 'MovingCompany', name: settings.site_name || 'Sunwings Transport', telephone: settings.phone || undefined, url: getBaseUrl() },
  };

  return (
    <>
      <PageHero
        crumbs={crumbs}
        eyebrow={`Long-distance moving · ${route.from} → ${route.to}`}
        title={`${route.from} to ${route.to} Movers`}
        description={route.intro}
        image={HERO_IMAGE_OPTIONS.truck}
        imageAlt={`Sunwings moving truck for ${route.from} to ${route.to} moves`}
        phone={settings.phone}
        preset={ROUTE_SERVICE}
        quoteFill={fill}
      />

      <TrustStrip/>

      <section className="section">
        <div className="container with-side">
          <article className="prose">
            <span className="kicker">{route.from} → {route.to}</span>
            <h2 style={{ marginTop: 0 }}>Your move from {route.from} to {route.to}</h2>
            <p>The drive is {route.distance}, {route.drive}. You get one crew and one truck for the whole trip: we load in {route.from}, drive straight to {route.to} and unload, with no hand-offs and no storage stop.</p>
            <ul className="checks">
              <li>Same crew loads, drives and unloads</li>
              <li>Blankets and wrapping for furniture</li>
              <li>Disassembly and reassembly of beds and tables</li>
              <li>Furniture placed in the rooms you want</li>
              <li>Condos, apartments, houses and single items</li>
              <li>Evenings and weekends available</li>
            </ul>

            {fromAreas.length || toAreas.length ? <>
              <h2>Where we pick up and deliver</h2>
              {fromAreas.length ? <><h3>Picking up in {route.from}</h3><div className="chips">{fromAreas.map(area => <span className="chip" key={area}>{area}</span>)}</div></> : null}
              {toAreas.length ? <><h3>Delivering in {route.to}</h3><div className="chips">{toAreas.map(area => <span className="chip" key={area}>{area}</span>)}</div></> : null}
            </> : null}

            {tips.length ? <>
              <h2>Tips for a {route.from} to {route.to} move</h2>
              <ul className="checks one">{tips.map(tip => <li key={tip}>{tip}</li>)}</ul>
            </> : null}

            <h2>How it works</h2>
            <HowItWorks
              step1Title="Send the details" step1Text={`Your ${route.from} and ${route.to} addresses, moving date, item list and a few photos. It takes about two minutes.`}
              step2Title="Get your quote" step2Text="We look at the job and send you a quote. No surprises on moving day."
              step3Title="Moving day" step3Text={`The crew loads in ${route.from}, drives to ${route.to} and places everything where you want it.`}
            />

            <div className="cta-inline">
              <div>
                <h3>Get a free {route.from} to {route.to} moving quote</h3>
                <p>Tell us what’s moving and when. We’ll reply with a quote.</p>
              </div>
              <QuoteDrawerTrigger className="btn btn-accent" preset={ROUTE_SERVICE} fill={fill}>Get my free quote →</QuoteDrawerTrigger>
            </div>

            <h2>{route.from} to {route.to} moving FAQs</h2>
            <div className="service-faqs">
              {faqs.map(item => <details key={item.question}><summary>{item.question}</summary><p>{item.answer}</p></details>)}
            </div>

            {back ? <>
              <h2>Moving the other way?</h2>
              <div className="chips"><Link className="chip" href={routeHref(back)}>{back.from} to {back.to} movers</Link></div>
            </> : null}

            <h2>Other long-distance moves</h2>
            <div className="chips">
              {others.map(item => <Link className="chip" href={routeHref(item)} key={item.slug}>{item.from} to {item.to}</Link>)}
              <Link className="chip" href="/long-distance">All routes →</Link>
            </div>
          </article>

          <aside className="side">
            <QuoteForm services={services} compact preset={ROUTE_SERVICE} fill={fill} replyHours={settings.quote_reply_hours}/>
            <div className="side-card">
              <h3>Call us</h3>
              <a className="btn btn-navy" style={{ width: '100%' }} href={telHref(settings.phone)}>Call Now</a>
            </div>
            {[route.fromSlug, route.toSlug].some(townPage) ? <div className="side-card">
              <h3>Local moves</h3>
              <div className="side-links">
                {[route.fromSlug, route.toSlug].map(townPage).filter(Boolean).map(town => (
                  <Link href={`/locations/${town.slug}`} key={town.slug}>{town.title} movers & delivery</Link>
                ))}
              </div>
            </div> : null}
          </aside>
        </div>
      </section>

      <BreadcrumbSchema baseUrl={getBaseUrl()} items={crumbs}/>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}/>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map(item => ({ '@type': 'Question', name: item.question, acceptedAnswer: { '@type': 'Answer', text: item.answer } })),
      }) }}/>
    </>
  );
}
