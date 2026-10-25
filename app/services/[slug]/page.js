import Link from 'next/link';
import BreadcrumbSchema from '@/components/BreadcrumbSchema';
import PageHero from '@/components/PageHero';
import QuoteForm from '@/components/QuoteForm';
import QuoteDrawerTrigger from '@/components/QuoteDrawerTrigger';
import ServiceIcon from '@/components/ServiceIcon';
import ServicePricing from '@/components/ServicePricing';
import { getBaseUrl, getLocations, getServiceBySlug, getServices, getSiteSettings } from '@/lib/content';
import { getServicePricing, withServiceCopy } from '@/lib/servicePricing';
import { notFound } from 'next/navigation';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const service = withServiceCopy(await getServiceBySlug(slug));
  if (!service) return {};

  const url = `${getBaseUrl()}/services/${service.slug}`;
  const title = service.seo_title || service.title;
  const description = service.seo_description || service.hero_description;

  return {
    title: service.seo_title ? { absolute: title } : title,
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
    getServiceBySlug(slug).then(withServiceCopy),
    getLocations(),
    getServices(),
    getSiteSettings(),
  ]);
  if (!service) notFound();

  const pricing = getServicePricing(service.slug);
  const regionSlugs = (pricing?.regions || []).flatMap(region => region.places.map(place => place.href.replace('/locations/', '')));
  const relatedLocations = regionSlugs.length
    ? regionSlugs.map(slug => locations.find(location => location.slug === slug)).filter(Boolean)
    : locations.filter(location =>
      !Array.isArray(location.service_slugs) || !location.service_slugs.length || location.service_slugs.includes(service.slug)
    );

  const faqs = Array.isArray(service.faq) ? service.faq.filter(item => item?.question && item?.answer) : [];

  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.title,
    description: service.seo_description || service.hero_description || service.intro,
    url: `${getBaseUrl()}/services/${service.slug}`,
    provider: {
      '@type': 'MovingCompany',
      name: settings.site_name || 'Sunwings Transport',
      telephone: settings.phone || '1-800-555-5555',
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

      <ServicePricing slug={service.slug} pricing={pricing} serviceTitle={service.title} showAllLink/>

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
                <h3>{service.cta_title || `Need ${service.title.toLowerCase()}?`}</h3>
                <p>{service.cta_text || 'Get an upfront price, usually the same day.'}</p>
              </div>
              <QuoteDrawerTrigger className="btn btn-accent" preset={service.title}>Request a Quote →</QuoteDrawerTrigger>
            </div>

            <h2>Where we offer {service.title.toLowerCase()}</h2>
            {relatedLocations.length ? (
              <div className="chips">
                {relatedLocations.map(location => (
                  <Link className="chip" href={`/locations/${location.slug}`} key={location.slug}>{location.title}</Link>
                ))}
                {regionSlugs.length ? null : <Link className="chip" href="/locations">All areas →</Link>}
              </div>
            ) : <p>No published service areas yet.</p>}

            {faqs.length ? <>
              <h2>{service.title} FAQs</h2>
              <div className="service-faqs">
                {faqs.map((item, index) => (
                  <details key={`${item.question}-${index}`} open>
                    <summary>{item.question}</summary>
                    <p>{item.answer}</p>
                  </details>
                ))}
              </div>
            </> : null}

            {pricing?.otherAreas?.length ? (
              <div className="service-other-areas">
                <span>Also serving:</span>
                {pricing.otherAreas.map(area => area.href
                  ? <Link href={area.href} key={area.label}>{area.label}</Link>
                  : <span key={area.label}>{area.label}</span>)}
              </div>
            ) : null}
          </article>

          <aside className="side">
            <QuoteForm services={services} compact preset={service.title} replyHours={settings.quote_reply_hours}/>
            <div className="side-card">
              <h3>Other services</h3>
              <div className="side-links service-side-links">
                {services.filter(item => item.slug !== service.slug).map(item => (
                  <Link href={`/services/${item.slug}`} key={item.slug}>
                    <span className="service-side-icon"><ServiceIcon slug={item.slug} size={19}/></span>
                    <span>{item.title}</span>
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </section>

      <BreadcrumbSchema baseUrl={getBaseUrl()} items={[{label:'Home',href:'/'},{label:'Services',href:'/services'},{label:service.title}]}/>
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(serviceSchema)}}/>
      {faqs.length ? <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map(item => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: { '@type': 'Answer', text: item.answer },
        })),
      })}}/> : null}
    </>
  );
}
