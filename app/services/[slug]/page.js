import HeroBanner from '@/components/HeroBanner';
import LocationCards from '@/components/LocationCards';
import { getBaseUrl, getLocations, getServiceBySlug, getSiteSettings } from '@/lib/content';
import { notFound } from 'next/navigation';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);
  if (!service) return {};

  const url = `${getBaseUrl()}/services/${service.slug}`;
  const title = service.seo_title || service.title;
  const description = service.seo_description || service.hero_description;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: 'website',
      url,
      title,
      description,
      images: service.og_image ? [{ url: service.og_image, alt: service.title }] : [],
    },
    twitter: {
      card: service.og_image ? 'summary_large_image' : 'summary',
      title,
      description,
      images: service.og_image ? [service.og_image] : [],
    },
  };
}

export default async function ServicePage({ params }) {
  const { slug } = await params;
  const [service, locations, settings] = await Promise.all([
    getServiceBySlug(slug),
    getLocations(),
    getSiteSettings(),
  ]);
  if (!service) notFound();

  const relatedLocations = locations.filter(location =>
    !Array.isArray(location.service_slugs) || location.service_slugs.includes(service.slug)
  );

  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.title,
    description: service.seo_description || service.hero_description || service.intro,
    url: `${getBaseUrl()}/services/${service.slug}`,
    provider: {
      '@type': 'MovingCompany',
      name: settings.site_name || 'Sunwings Transport',
      telephone: settings.phone || '647-526-5132',
      email: settings.email || 'dispatch@sunwingstransport.ca',
      url: getBaseUrl(),
    },
    areaServed: relatedLocations.map(location => ({
      '@type': 'City',
      name: location.title,
    })),
  };

  return (
    <>
      <HeroBanner
        eyebrow={service.eyebrow}
        title={service.hero_title || service.title}
        description={service.hero_description}
        image={service.banner_image}
        ctaLabel="Request a Quote"
        ctaUrl="/#quote"
      />
      <section className="section">
        <div className="container detail-grid">
          <article className="rich-content">
            <p className="lead">{service.intro}</p>
            {service.body_html ? <div dangerouslySetInnerHTML={{ __html: service.body_html }} /> : null}
          </article>
          <aside className="side-panel">
            <h2>Service includes</h2>
            <ul>
              {(service.bullets || []).map(item => <li key={item}>{item}</li>)}
            </ul>
          </aside>
        </div>
      </section>
      {relatedLocations.length ? (
        <section className="section section-soft">
          <div className="container">
            <div className="section-heading">
              <div><span className="kicker">Service Areas</span><h2>Where this service is available.</h2></div>
            </div>
            <LocationCards locations={relatedLocations} />
          </div>
        </section>
      ) : null}
      <section className="section">
        <div className="container inline-cta">
          <div><h2>{service.cta_title || 'Need this service?'}</h2><p>{service.cta_text}</p></div>
          <a className="button button-light" href="/#quote">Request a Quote</a>
        </div>
      </section>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
    </>
  );
}
