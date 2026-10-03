import Link from 'next/link';
import PageHero from '@/components/PageHero';
import QuoteForm from '@/components/QuoteForm';
import ServiceAreaGrid from '@/components/ServiceAreaGrid';
import ServiceIcon from '@/components/ServiceIcon';
import { getBaseUrl, getLocations, getServiceBySlug, getServices, getSiteSettings } from '@/lib/content';
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
  };
}

export default async function ServicePage({ params }) {
  const { slug } = await params;
  const [service, locations, services, settings] = await Promise.all([
    getServiceBySlug(slug),
    getLocations(),
    getServices(),
    getSiteSettings(),
  ]);
  if (!service) notFound();

  const relatedLocations = locations.filter(location =>
    !Array.isArray(location.service_slugs) || !location.service_slugs.length || location.service_slugs.includes(service.slug)
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
  };

  return (
    <>
      <PageHero
        crumbs={[{label:'Home',href:'/'},{label:'Services',href:'/services'},{label:service.title}]}
        title={service.hero_title || service.title}
        description={service.intro || service.hero_description}
        image={service.banner_image}
        phone={settings.phone}
      />

      <section className="section">
        <div className="container with-side">
          <article className="prose">
            <p className="lead-p">{service.intro}</p>

            {(service.bullets || []).length ? <>
              <h2>What’s included</h2>
              <ul className="checks">
                {service.bullets.map(item => <li key={item}>{item}</li>)}
              </ul>
            </> : null}

            {service.body_html ? <div dangerouslySetInnerHTML={{__html:service.body_html}}/> : null}

            <div className="cta-inline">
              <div>
                <h3>Need {service.title.toLowerCase()}?</h3>
                <p>Get an upfront price, usually the same day.</p>
              </div>
              <Link className="btn btn-accent" href="/contact">Get a Quote →</Link>
            </div>

            <h2>Where we offer {service.title.toLowerCase()}</h2>
            {relatedLocations.length ? <ServiceAreaGrid locations={relatedLocations}/> : <p>No published service areas yet.</p>}
          </article>

          <aside className="side">
            <QuoteForm services={services} compact preset={service.title}/>
            <div className="side-card">
              <h3>Other services</h3>
              <div className="side-links">
                {services.filter(item => item.slug !== service.slug).map(item => (
                  <Link href={`/services/${item.slug}`} key={item.slug}>
                    <ServiceIcon slug={item.slug} size={18}/>{item.title}
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </section>

      <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(serviceSchema)}}/>
    </>
  );
}
