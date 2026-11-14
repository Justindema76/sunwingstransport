import Link from 'next/link';
import BreadcrumbSchema from '@/components/BreadcrumbSchema';
import PageHero from '@/components/PageHero';
import QuoteDrawerTrigger from '@/components/QuoteDrawerTrigger';
import TrustStrip from '@/components/TrustStrip';
import { HERO_IMAGE_OPTIONS } from '@/lib/contentDefaults';
import { getBaseUrl, getLocations, getSiteSettings } from '@/lib/content';
import { ROUTES, ROUTE_SERVICE, routeHref } from '@/lib/routes';

// Hamilton & Niagara regional hub: the landing page for regional ads. Long-distance
// moving and transportation between Hamilton/Niagara and Toronto/GTA is the lead service.
const TITLE = 'Hamilton & Niagara Movers | Long-Distance Moving & Transport | Sunwings';
const DESCRIPTION = 'Moving, furniture delivery and long-distance transport across Hamilton, Burlington, Grimsby, St. Catharines, Niagara Falls and the Niagara Region, and to Toronto and the GTA. Free tailored quotes.';
const PATH = '/hamilton-niagara';
const HERO = 'https://nowsajdmbpxvlvrhopjg.supabase.co/storage/v1/object/public/blog-images/sunwings/1792805164536-image.png';

const REGIONS = [
  { key: 'Hamilton Region', title: 'Hamilton', note: 'Hamilton, Stoney Creek, Ancaster, Dundas and Waterdown' },
  { key: 'Niagara Region', title: 'Niagara', note: 'Grimsby, Lincoln, St. Catharines, Niagara Falls, Welland, Thorold and Fort Erie' },
  { key: 'Halton Region', title: 'Halton', note: 'Burlington, Oakville and Milton' },
];

const SERVICES = [
  { title: 'Long-distance moves', text: 'Full home moves between Hamilton or Niagara and Toronto, Mississauga and the GTA, planned around access at both ends.', href: '/long-distance', cta: 'Long-distance moving' },
  { title: 'Furniture & store delivery', text: 'Store pickups, Marketplace finds and single large items brought from anywhere in the region and placed in the room you want.', href: '/services/furniture-delivery', cta: 'Furniture delivery' },
  { title: 'Commercial & large-item transport', text: 'Office moves, equipment, inventory and business deliveries between cities, one-off or on a schedule.', href: '/services/commercial-transport', cta: 'Commercial transport' },
];

const FAQS = [
  { question: 'Do you move between Niagara and Toronto?', answer: 'Yes. Moves and deliveries between the Niagara Region, Hamilton and Toronto or the GTA are our main long-distance routes. Send both addresses and your date for a tailored quote.' },
  { question: 'Which towns do you cover in Hamilton and Niagara?', answer: 'Hamilton, Stoney Creek, Ancaster, Dundas, Waterdown, Burlington, Grimsby, Lincoln, St. Catharines, Niagara Falls, Welland, Thorold and Fort Erie, plus nearby towns on request.' },
  { question: 'Can you deliver one large item from Hamilton or Niagara to Toronto?', answer: 'Yes. Furniture, appliances and other large items can be picked up and delivered between cities. Tell us the item, size, stairs and both addresses.' },
  { question: 'How is a long-distance quote priced?', answer: 'It depends on the route, the amount being moved, the crew and vehicle needed, and access at both ends. You get a written quote before anything is booked.' },
];

export const metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: PATH },
  openGraph: { type: 'website', url: PATH, title: TITLE, description: DESCRIPTION, siteName: 'Sunwings Transport', locale: 'en_CA', images: [{ url: HERO, alt: 'Sunwings Transport cargo van' }] },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION, images: [HERO] },
};

export default async function HamiltonNiagaraPage() {
  const [settings, locations] = await Promise.all([getSiteSettings(), getLocations()]);
  const crumbs = [{ label: 'Home', href: '/' }, { label: 'Hamilton & Niagara' }];
  const regionalRoutes = ROUTES.filter(route => route.group === 'hamilton' || route.group === 'niagara');

  return (
    <>
      <PageHero
        placement="hamilton-niagara"
        crumbs={crumbs}
        eyebrow="Hamilton · Burlington · Grimsby · Niagara"
        title="Hamilton & Niagara"
        accent="movers & transport."
        description="Long-distance moves, furniture delivery and large-item transport across Hamilton and the Niagara Region, and to Toronto and the GTA. Tell us where it’s going and get a tailored quote."
        image={HERO}
        fallbackImage={HERO_IMAGE_OPTIONS.truck}
        imageAlt="Sunwings Transport cargo van"
        phone={settings.phone}
        preset={ROUTE_SERVICE}
      />

      <TrustStrip/>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <span className="kicker">What we do here</span>
            <h2>Moving and transport across the region.</h2>
            <p>From one sofa to a full house, between towns or into Toronto. Every job is quoted in writing before it’s booked.</p>
          </div>
          <div className="grid-3">
            {SERVICES.map(item => (
              <div className="side-card" key={item.title}>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
                <Link href={item.href} style={{ fontWeight: 700, color: 'var(--blue)' }}>{item.cta} →</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-soft">
        <div className="container">
          <div className="section-head">
            <span className="kicker">Popular routes</span>
            <h2>Hamilton & Niagara ↔ Toronto and the GTA.</h2>
            <p>Our regular intercity routes, in both directions. Going somewhere else? Send both addresses and we’ll check it.</p>
          </div>
          <div className="grid-2">
            {['hamilton', 'niagara'].map(group => (
              <div className="side-card" key={group}>
                <h3>{group === 'hamilton' ? 'From & to Hamilton' : 'From & to Niagara'}</h3>
                <div className="side-links" style={{ marginTop: 10 }}>
                  {regionalRoutes.filter(route => route.group === group).map(route => (
                    <Link href={routeHref(route)} key={route.slug}>{route.from} → {route.to}</Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="cta-inline" style={{ marginTop: 28 }}>
            <div>
              <h3>Moving between two other towns?</h3>
              <p>Pickup city, destination city, your date and what’s being moved is all we need to start.</p>
            </div>
            <QuoteDrawerTrigger className="btn btn-accent" preset={ROUTE_SERVICE}>Get my quote →</QuoteDrawerTrigger>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <span className="kicker">Towns we serve</span>
            <h2>Local pages for your area.</h2>
          </div>
          <div className="grid-3">
            {REGIONS.map(region => {
              const towns = locations.filter(location => location.region === region.key);
              return (
                <div className="side-card" key={region.key}>
                  <h3>{region.title}</h3>
                  <p className="muted">{region.note}</p>
                  {towns.length ? (
                    <div className="side-links" style={{ marginTop: 10 }}>
                      {towns.map(town => <Link href={`/locations/${town.slug}`} key={town.slug}>{town.title} movers</Link>)}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section section-soft">
        <div className="container prose" style={{ maxWidth: 900 }}>
          <span className="kicker">Questions</span>
          <h2>Hamilton & Niagara moving questions</h2>
          <div className="service-faqs">
            {FAQS.map(item => <details key={item.question}><summary>{item.question}</summary><p>{item.answer}</p></details>)}
          </div>
          <QuoteDrawerTrigger className="btn btn-accent" preset={ROUTE_SERVICE}>Request a free quote →</QuoteDrawerTrigger>
        </div>
      </section>

      <BreadcrumbSchema baseUrl={getBaseUrl()} items={crumbs}/>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: FAQS.map(item => ({ '@type': 'Question', name: item.question, acceptedAnswer: { '@type': 'Answer', text: item.answer } })),
      }) }}/>
    </>
  );
}
