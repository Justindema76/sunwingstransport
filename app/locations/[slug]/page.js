import HeroBanner from '@/components/HeroBanner';
import ServiceCards from '@/components/ServiceCards';
import { getBaseUrl, getLocationBySlug, getServices, getSiteSettings } from '@/lib/content';
import { notFound } from 'next/navigation';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const location = await getLocationBySlug(slug);
  if (!location) return {};

  const url = `${getBaseUrl()}/locations/${location.slug}`;
  const title = location.seo_title || location.title;
  const description = location.seo_description || location.hero_description;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: 'website',
      url,
      title,
      description,
      images: location.og_image ? [{ url: location.og_image, alt: location.title }] : [],
    },
    twitter: {
      card: location.og_image ? 'summary_large_image' : 'summary',
      title,
      description,
      images: location.og_image ? [location.og_image] : [],
    },
  };
}

export default async function LocationPage({ params }) {
  const { slug } = await params;
  const [location, services, settings] = await Promise.all([
    getLocationBySlug(slug),
    getServices(),
    getSiteSettings(),
  ]);
  if (!location) notFound();

  const relatedServices = services.filter(service =>
    !Array.isArray(location.service_slugs) || location.service_slugs.includes(service.slug)
  );

  const placeSchema = {
    '@context': 'https://schema.org',
    '@type': 'Place',
    name: location.title,
    description: location.seo_description || location.hero_description || location.intro,
    url: `${getBaseUrl()}/locations/${location.slug}`,
    containedInPlace: location.region
      ? { '@type': 'AdministrativeArea', name: location.region }
      : undefined,
  };

  const faqSchema = Array.isArray(location.faq) && location.faq.length
    ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: location.faq.map(item => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: item.answer,
          },
        })),
      }
    : null;

  const providerSchema = {
    '@context': 'https://schema.org',
    '@type': 'MovingCompany',
    name: settings.site_name || 'Sunwings Transport',
    telephone: settings.phone || '647-526-5132',
    email: settings.email || 'dispatch@sunwingstransport.ca',
    url: getBaseUrl(),
    areaServed: {
      '@type': 'City',
      name: location.title,
    },
  };

  return (
    <>
      <HeroBanner
        eyebrow={location.eyebrow}
        title={location.hero_title || location.title}
        description={location.hero_description}
        image={location.banner_image}
        ctaLabel="Request a Quote"
        ctaUrl="/#quote"
      />
      <section className="section">
        <div className="container detail-grid">
          <article className="rich-content">
            <p className="lead">{location.intro}</p>
            {location.body_html ? <div dangerouslySetInnerHTML={{ __html: location.body_html }} /> : null}
          </article>
          <aside className="side-panel">
            <h2>Areas served</h2>
            <div className="chips chips-dark">
              {(location.neighbourhoods || []).map(item => <span className="chip" key={item}>{item}</span>)}
            </div>
          </aside>
        </div>
      </section>
      <section className="section section-soft">
        <div className="container">
          <div className="section-heading">
            <div><span className="kicker">{location.title}</span><h2>Services available in this area.</h2></div>
          </div>
          <ServiceCards services={relatedServices} />
        </div>
      </section>
      {Array.isArray(location.faq) && location.faq.length ? (
        <section className="section">
          <div className="container faq-wrap">
            <span className="kicker">Local Questions</span>
            <h2>Frequently asked questions.</h2>
            {location.faq.map(item => (
              <details key={item.question}>
                <summary>{item.question}</summary>
                <p>{item.answer}</p>
              </details>
            ))}
          </div>
        </section>
      ) : null}
      <section className="section">
        <div className="container inline-cta">
          <div><h2>{location.cta_title || 'Need transport in this area?'}</h2><p>{location.cta_text}</p></div>
          <a className="button button-light" href="/#quote">Request a Quote</a>
        </div>
      </section>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(placeSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(providerSchema) }}
      />
      {faqSchema ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      ) : null}
    </>
  );
}
