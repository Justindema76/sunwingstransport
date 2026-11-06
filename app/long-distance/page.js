import Link from 'next/link';
import BreadcrumbSchema from '@/components/BreadcrumbSchema';
import PageHero from '@/components/PageHero';
import QuoteDrawerTrigger from '@/components/QuoteDrawerTrigger';
import TrustStrip from '@/components/TrustStrip';
import { HERO_IMAGE_OPTIONS } from '@/lib/contentDefaults';
import { getBaseUrl, getSiteSettings } from '@/lib/content';
import { ROUTES, ROUTE_GROUPS, ROUTE_SERVICE, routeHref } from '@/lib/routes';

export const metadata = {
  title: { absolute: 'Long-Distance Movers: Hamilton, Niagara & Toronto | Sunwings Transport' },
  description: 'Long-distance and intercity moves between Toronto, Hamilton, Mississauga, St. Catharines and Niagara Falls. One crew and one truck, door to door. Free quote.',
  alternates: { canonical: '/long-distance' },
};

export default async function LongDistancePage() {
  const settings = await getSiteSettings();
  const crumbs = [{ label: 'Home', href: '/' }, { label: 'Long Distance' }];
  return (
    <>
      <PageHero
        crumbs={crumbs}
        eyebrow="Long-distance & intercity moving"
        title="Moving between cities?"
        accent="One crew, door to door."
        description="Toronto, Hamilton, Mississauga and Niagara. We load your home, drive it straight to the new place and unload it with the same crew. Send your move for a free quote."
        image={HERO_IMAGE_OPTIONS.truck}
        phone={settings.phone}
        preset={ROUTE_SERVICE}
      />

      <TrustStrip/>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <span className="kicker">Routes we move</span>
            <h2>Pick your move</h2>
            <p>Every route works both ways. Don’t see yours? Send it anyway and we’ll quote it.</p>
          </div>
          <div className="grid-2 route-groups">
            {ROUTE_GROUPS.map(group => (
              <div className="side-card route-group" key={group.key}>
                <h3>{group.label}</h3>
                <p className="muted">{group.note}</p>
                <div className="side-links">
                  {ROUTES.filter(route => route.group === group.key).map(route => (
                    <Link href={routeHref(route)} key={route.slug}>{route.from} → {route.to} movers</Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="cta-inline" style={{ marginTop: 28 }}>
            <div>
              <h3>Moving somewhere else?</h3>
              <p>Send us both addresses, your date and what’s moving. We’ll reply with a quote.</p>
            </div>
            <QuoteDrawerTrigger className="btn btn-accent" preset={ROUTE_SERVICE}>Get my free quote →</QuoteDrawerTrigger>
          </div>
        </div>
      </section>

      <BreadcrumbSchema baseUrl={getBaseUrl()} items={crumbs}/>
    </>
  );
}
