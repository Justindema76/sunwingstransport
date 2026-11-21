import Link from 'next/link';
import BlogCards from '@/components/BlogCards';
import FacebookPosts from '@/components/FacebookPosts';
import GoogleReviews from '@/components/GoogleReviews';
import { HnPriceTeaser, HnQuoteBand } from '@/components/HnPricing';
import PageHero from '@/components/PageHero';
import ServiceCards from '@/components/ServiceCards';
import QuoteDrawerTrigger from '@/components/QuoteDrawerTrigger';
import TrustStrip from '@/components/TrustStrip';
import { photoSettings } from '@/components/heroSlides';
import { HERO_IMAGE_OPTIONS } from '@/lib/contentDefaults';
import { getBlogPosts, getLocations, getServicesFor, getSiteSettings } from '@/lib/content';
import { HN, HN_CONTENT_DEFAULTS, HN_ROUTES, HN_SERVICES, HN_TRUST, getHnContent, hnMetadata, hnRouteHref } from '@/lib/hamiltonNiagara';

// Banner, service boxes and FAQs are edited in Admin › Banners & Pop-up › Hamilton & Niagara.
// Hamilton & Niagara regional hub: the landing page for regional ads. Long-distance
// moving and transportation between Hamilton/Niagara and Toronto/GTA is the lead service.
// SEO (title, description, share image) is edited in Admin › Pages › Hamilton & Niagara.

const REGIONS = [
  { key: 'Hamilton Region', title: 'Hamilton', note: 'Hamilton, Stoney Creek, Ancaster, Dundas and Waterdown' },
  { key: 'Niagara Region', title: 'Niagara', note: 'Grimsby, Lincoln, St. Catharines, Niagara Falls, Welland, Thorold and Fort Erie' },
  { key: 'Halton Region', title: 'Halton', note: 'Burlington, Oakville and Milton' },
];

export async function generateMetadata() {
  const hero = (await getHnContent()).home.image || HN_CONTENT_DEFAULTS.home.image;
  return hnMetadata('home', HN, hero);
}

export default async function HamiltonNiagaraPage() {
  const [settings, locations, content, services, posts] = await Promise.all([getSiteSettings(), getLocations(), getHnContent(), getServicesFor('hn'), getBlogPosts({ area: 'hn' })]);
  const { home } = content;
  // Service cards: every service set to show here (Admin › Service Posts › Show on). Services this
  // section has its own page for link there; the rest open the main service page.
  const sectionPages = Object.fromEntries(HN_SERVICES.map(item => [item.serviceSlug, `${HN}/${item.slug}`]));
  const cardLinks = services.map(service => ({ url: service.slug !== 'residential-moving' && sectionPages[service.slug] ? sectionPages[service.slug] : `/services/${service.slug}` }));
  const FAQS = home.faqs.filter(item => item?.question && item?.answer);
  const crumbs = [];
  const regionalRoutes = HN_ROUTES;

  return (
    <>
      <PageHero
        placement="hamilton-niagara"
        crumbs={crumbs}
        eyebrow={home.eyebrow}
        title={home.heading}
        accent={home.accent}
        description={home.text}
        image={home.image}
        imagePosition={photoSettings(home)}
        fallbackImage={HERO_IMAGE_OPTIONS.truck}
        imageAlt="Sunwings Transport cargo van"
        phone={settings.phone}
      />

      <TrustStrip items={HN_TRUST}/>

      <section className="section" id="services">
        <div className="container">
          <div className="section-head">
            <span className="kicker">What we do here</span>
            <h2>Moving and transport across the region.</h2>
            <p>Sunwings is a small, owner-run moving company, not a broker. Every job matters to us, from one sofa to a full house, and every job is quoted in writing before it’s booked.</p>
          </div>
          <ServiceCards services={services} cardOverrides={cardLinks} area="hn"/>
        </div>
      </section>

      <section className="section section-soft" id="prices">
        <div className="container">
          <HnPriceTeaser pricing={content.pricing} pricingHref={`${HN}/pricing`} title="Moving to or from Toronto? Starting prices." preset="Long-Distance Moving"/>
        </div>
      </section>

      <HnQuoteBand phone={settings.phone}/>

      <GoogleReviews/>

      <section className="section section-soft" id="routes">
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
                    <Link href={hnRouteHref(route)} key={route.slug}>{route.from} → {route.to}</Link>
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
            <QuoteDrawerTrigger className="btn btn-accent">Get my quote →</QuoteDrawerTrigger>
          </div>
        </div>
      </section>

      <section className="section" id="towns">
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
                      {towns.map(town => <Link href={`${HN}/${town.slug}`} key={town.slug}>{town.title} movers</Link>)}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {posts.length ? (
        <section className="section section-soft">
          <div className="container">
            <div className="section-head">
              <span className="kicker">Moving tips</span>
              <h2>Advice before you move.</h2>
            </div>
            <BlogCards posts={posts.slice(0, 3)} basePath={`${HN}/blog`}/>
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 28 }}>
              <Link className="btn btn-navy" href={`${HN}/blog`}>All moving tips</Link>
            </div>
          </div>
        </section>
      ) : null}

      <FacebookPosts viewAllHref={`${HN}/facebook`}/>

      <section className="section">
        <div className="container prose" style={{ maxWidth: 900 }}>
          <span className="kicker">Questions</span>
          <h2>Hamilton & Niagara moving questions</h2>
          <div className="service-faqs">
            {FAQS.map(item => <details key={item.question}><summary>{item.question}</summary><p>{item.answer}</p></details>)}
          </div>
          <QuoteDrawerTrigger className="btn btn-accent">Request a free quote</QuoteDrawerTrigger>
        </div>
      </section>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: FAQS.map(item => ({ '@type': 'Question', name: item.question, acceptedAnswer: { '@type': 'Answer', text: item.answer } })),
      }) }}/>
    </>
  );
}
