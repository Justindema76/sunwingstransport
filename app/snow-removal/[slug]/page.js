import Link from 'next/link';
import { notFound } from 'next/navigation';
import BreadcrumbSchema from '@/components/BreadcrumbSchema';
import PageHero from '@/components/PageHero';
import QuoteDrawerTrigger from '@/components/QuoteDrawerTrigger';
import QuoteForm from '@/components/QuoteForm';
import ServicePricing from '@/components/ServicePricing';
import { priceBadge } from '@/components/heroSlides';
import { getBaseUrl, getLocationBySlug, getLocations, getServiceBySlug, getServices, getSiteSettings } from '@/lib/content';
import { SNOW_SLUG, getSiteContent, offersSnow, servicePricingFor, snowTownHref, withServiceCopy } from '@/lib/siteContent';
import { telHref } from '@/lib/phone';

// Snow removal for one town, e.g. /snow-removal/markham. Only towns with Snow Removal ticked
// (Admin › Locations) have a page. Content comes from the Snow Removal service post; the
// town's own movers page stays at /locations/<town>.

async function loadTown(slug) {
  const [location, rawService, content] = await Promise.all([getLocationBySlug(slug), getServiceBySlug(SNOW_SLUG), getSiteContent()]);
  if (!location || !offersSnow(location)) return null;
  const service = withServiceCopy(content, rawService);
  if (!service) return null;
  return { location, service, content };
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const town = await loadTown(slug);
  if (!town) return {};
  const { location, service } = town;
  const url = `${getBaseUrl()}${snowTownHref(location.slug)}`;
  const title = `Snow Removal ${location.title} | Driveways, Walkways & Steps | Sunwings Transport`;
  const description = `Residential snow removal in ${location.title}: driveways, walkways and front steps cleared after every 5 cm snowfall. Get a quote for your property.`;
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: url },
    openGraph: { type: 'website', url, title, description, images: service.banner_image ? [{ url: service.banner_image, alt: service.banner_alt || `Snow removal in ${location.title}` }] : [] },
  };
}

export default async function SnowTownPage({ params }) {
  const { slug } = await params;
  const [town, locations, services, settings] = await Promise.all([loadTown(slug), getLocations(), getServices(), getSiteSettings()]);
  if (!town) notFound();
  const { location, service, content } = town;

  const pricing = servicePricingFor(content, SNOW_SLUG);
  const otherTowns = locations.filter(item => item.slug !== location.slug && offersSnow(item));
  const faqs = Array.isArray(service.faq) ? service.faq.filter(item => item?.question && item?.answer) : [];
  const neighbourhoods = Array.isArray(location.neighbourhoods) ? location.neighbourhoods : [];
  const crumbs = [{ label: 'Home', href: '/' }, { label: 'Snow Removal', href: `/services/${SNOW_SLUG}` }, { label: location.title }];

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: `Snow Removal in ${location.title}`,
    serviceType: 'Residential snow removal',
    url: `${getBaseUrl()}${snowTownHref(location.slug)}`,
    areaServed: { '@type': 'City', name: location.title },
    provider: { '@type': 'LocalBusiness', name: settings.site_name || 'Sunwings Transport', telephone: settings.phone || undefined, url: getBaseUrl() },
  };

  return (
    <>
      <PageHero
        crumbs={crumbs}
        eyebrow={`Snow removal · ${location.title}`}
        title={`Snow Removal in ${location.title}`}
        description={service.hero_description || service.intro}
        image={service.banner_image}
        imageAlt={service.banner_alt}
        phone={settings.phone}
        badge={priceBadge(pricing)}
        preset={service.title}
      />

      <ServicePricing slug={SNOW_SLUG} anchor="plans" pricing={pricing} serviceTitle={service.title}/>

      <section className="section">
        <div className="container with-side">
          <article className="prose">
            {service.intro ? <p className="lead-p">{service.intro}</p> : null}

            {(service.bullets || []).length ? <>
              <h2>What’s included in {location.title}</h2>
              <ul className="checks">{service.bullets.map(item => <li key={item}>{item}</li>)}</ul>
            </> : null}

            {neighbourhoods.length ? <>
              <h2>Areas we clear in {location.title}</h2>
              <div className="chips">{neighbourhoods.map(item => <span className="chip" key={item}>{item}</span>)}</div>
            </> : null}

            {service.body_html ? <div dangerouslySetInnerHTML={{ __html: service.body_html }}/> : null}

            <div className="cta-inline">
              <div>
                <h3>{service.cta_title || `Snow removal in ${location.title}`}</h3>
                <p>{service.cta_text || 'Send your address and we’ll confirm the price and route availability.'}</p>
              </div>
              <QuoteDrawerTrigger className="btn btn-accent" preset={service.title}>Request a Quote →</QuoteDrawerTrigger>
            </div>

            {faqs.length ? <>
              <h2>Snow removal FAQs</h2>
              <div className="service-faqs">
                {faqs.map((item, index) => (
                  <details key={`${item.question}-${index}`}>
                    <summary>{item.question}</summary>
                    <p>{item.answer}</p>
                  </details>
                ))}
              </div>
            </> : null}

            {otherTowns.length ? <>
              <h2>Snow removal in other towns</h2>
              <div className="chips">
                {otherTowns.map(item => <Link className="chip" href={snowTownHref(item.slug)} key={item.slug}>{item.title}</Link>)}
              </div>
            </> : null}
          </article>

          <aside className="side">
            <QuoteForm services={services} compact preset={service.title} replyHours={settings.quote_reply_hours}/>
            <div className="side-card">
              <h3>Call us</h3>
              <a className="btn btn-navy" style={{ width: '100%' }} href={telHref(settings.phone)}>Call Now</a>
            </div>
            <div className="side-card">
              <h3>Moving in {location.title}?</h3>
              <p className="muted">Moving, delivery and junk removal have their own page.</p>
              <Link className="more" href={`/locations/${location.slug}`}>{location.title} movers & delivery →</Link>
            </div>
          </aside>
        </div>
      </section>

      <BreadcrumbSchema baseUrl={getBaseUrl()} items={crumbs}/>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}/>
      {faqs.length ? <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map(item => ({ '@type': 'Question', name: item.question, acceptedAnswer: { '@type': 'Answer', text: item.answer } })),
      }) }}/> : null}
    </>
  );
}
