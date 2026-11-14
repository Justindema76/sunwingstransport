import Link from 'next/link';
import { notFound } from 'next/navigation';
import HowItWorks from '@/components/HowItWorks';
import PageHero from '@/components/PageHero';
import QuoteDrawerTrigger from '@/components/QuoteDrawerTrigger';
import TrustStrip from '@/components/TrustStrip';
import { HERO_IMAGE_OPTIONS } from '@/lib/contentDefaults';
import { getLocations, getSiteSettings } from '@/lib/content';
import { HN, HN_ROUTES, HN_TRUST, hnRouteHref, isHnTown } from '@/lib/hamiltonNiagara';
import { ROUTE_SERVICE, reverseRoute, routeHref, routeTips, townAreas } from '@/lib/routes';

// Route pages inside the Hamilton & Niagara section (/hamilton-niagara/routes/grimsby-...).
export function generateStaticParams() {
  return HN_ROUTES.map(route => ({ route: route.slug }));
}

export async function generateMetadata({ params }) {
  const { route: slug } = await params;
  const route = HN_ROUTES.find(item => item.slug === slug);
  if (!route) return {};
  // Same content as the main route page, so Google is pointed at that one.
  return { title: { absolute: `${route.from} to ${route.to} Movers | Sunwings Hamilton & Niagara` }, description: route.intro, alternates: { canonical: routeHref(route) } };
}

export default async function HnRoutePage({ params }) {
  const { route: slug } = await params;
  const route = HN_ROUTES.find(item => item.slug === slug);
  if (!route) notFound();
  const [settings, locations] = await Promise.all([getSiteSettings(), getLocations()]);
  const hnTowns = new Set(locations.filter(isHnTown).map(town => town.slug));
  const back = reverseRoute(route);
  const others = HN_ROUTES.filter(item => item.slug !== route.slug && item.slug !== back?.slug);
  const fromAreas = townAreas(route.fromSlug);
  const toAreas = townAreas(route.toSlug);
  const tips = routeTips(route);
  const townLink = (slug, name) => (hnTowns.has(slug) ? <Link href={`${HN}/${slug}`}>{name}</Link> : name);

  return (
    <>
      <PageHero
        placement={`hamilton-niagara-route-${route.slug}`}
        crumbs={[{ label: 'Hamilton & Niagara', href: HN }, { label: `${route.from} to ${route.to}` }]}
        eyebrow={`Long-distance moving · ${route.from} → ${route.to}`}
        title={`${route.from} to ${route.to} Movers`}
        description={route.intro}
        image={HERO_IMAGE_OPTIONS.truck}
        imageAlt={`Sunwings moving truck for ${route.from} to ${route.to} moves`}
        phone={settings.phone}
        preset={ROUTE_SERVICE}
        quoteFill={{ pickupCity: route.from, dropoffCity: route.to }}
      />
      <TrustStrip items={HN_TRUST}/>
      <section className="section">
        <div className="container prose hn-prose" style={{ maxWidth: 900 }}>
          <span className="kicker">{route.from} → {route.to}</span>
          <h2 style={{ marginTop: 0 }}>Your move from {townLink(route.fromSlug, route.from)} to {townLink(route.toSlug, route.to)}</h2>
          <p>The drive is {route.distance}, {route.drive}. One crew and one truck for the whole trip: we load in {route.from}, drive straight to {route.to} and unload.</p>
          <ul className="checks">
            <li>Same crew loads, drives and unloads</li>
            <li>Blankets and wrapping for furniture</li>
            <li>Disassembly and reassembly of beds and tables</li>
            <li>Furniture placed in the rooms you want</li>
            <li>Condos, apartments, houses and single items</li>
            <li>Evenings and weekends available</li>
          </ul>
          {fromAreas.length ? <><h3>Picking up in {route.from}</h3><div className="chips">{fromAreas.map(area => <span className="chip" key={area}>{area}</span>)}</div></> : null}
          {toAreas.length ? <><h3>Delivering in {route.to}</h3><div className="chips">{toAreas.map(area => <span className="chip" key={area}>{area}</span>)}</div></> : null}
          {tips.length ? <><h2>Tips for this move</h2><ul className="checks one">{tips.map(tip => <li key={tip}>{tip}</li>)}</ul></> : null}
          <h2>How it works</h2>
          <HowItWorks
            step1Title="Send the details" step1Text={`Your ${route.from} and ${route.to} addresses, moving date, item list and a few photos.`}
            step2Title="Get your quote" step2Text="We look at the job and send you a written quote."
            step3Title="Moving day" step3Text={`The crew loads in ${route.from}, drives to ${route.to} and places everything where you want it.`}
          />
          <div className="cta-inline">
            <div><h3>Moving from {route.from} to {route.to}?</h3><p>Get a written quote for your move.</p></div>
            <QuoteDrawerTrigger className="btn btn-accent" preset={ROUTE_SERVICE} fill={{ pickupCity: route.from, dropoffCity: route.to }}>Get my quote →</QuoteDrawerTrigger>
          </div>
          <h2>Other routes</h2>
          <div className="side-links" style={{ marginTop: 10 }}>
            {back ? <Link href={hnRouteHref(back)}>{back.from} → {back.to}</Link> : null}
            {others.map(item => <Link key={item.slug} href={hnRouteHref(item)}>{item.from} → {item.to}</Link>)}
          </div>
        </div>
      </section>
    </>
  );
}
