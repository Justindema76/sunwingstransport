import HeroBanner from '@/components/HeroBanner';
import ServiceCards from '@/components/ServiceCards';
import { getLocationBySlug, getServices } from '@/lib/content';
import { notFound } from 'next/navigation';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const location = await getLocationBySlug(slug);
  if (!location) return {};
  return {
    title: location.seo_title || location.title,
    description: location.seo_description || location.hero_description,
    openGraph: {
      title: location.seo_title || location.title,
      description: location.seo_description || location.hero_description,
      images: location.og_image ? [location.og_image] : [],
    },
  };
}

export default async function LocationPage({ params }) {
  const { slug } = await params;
  const [location, services] = await Promise.all([
    getLocationBySlug(slug),
    getServices(),
  ]);
  if (!location) notFound();

  const relatedServices = services.filter(service =>
    !Array.isArray(location.service_slugs) || location.service_slugs.includes(service.slug)
  );

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
    </>
  );
}
