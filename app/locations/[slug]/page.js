import Link from 'next/link';
import BreadcrumbSchema from '@/components/BreadcrumbSchema';
import { Building2, GraduationCap, MapPin, Mountain, Route, Truck } from 'lucide-react';
import PageHero from '@/components/PageHero';
import { rotatingHeroImage } from '@/components/heroSlides';
import QuoteForm from '@/components/QuoteForm';
import ServiceCards from '@/components/ServiceCards';
import TrustStrip from '@/components/TrustStrip';
import QuoteDrawerTrigger from '@/components/QuoteDrawerTrigger';
import { getBaseUrl, getLocationBySlug, getLocations, getServices, getSiteSettings } from '@/lib/content';
import { SNOW_SLUG, getSiteContent, pricedServicesForLocation, snowTownHref } from '@/lib/siteContent';
import { notFound } from 'next/navigation';
import { telHref } from '@/lib/phone';
import { routeHref, routesForTown } from '@/lib/routes';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const location = await getLocationBySlug(slug);
  if (!location) return {};
  const url = `${getBaseUrl()}/locations/${location.slug}`;
  const title = location.seo_title || location.title;
  const description = location.seo_description || location.hero_description;
  return {
    title: location.seo_title ? { absolute: title } : title,
    description,
    alternates:{canonical:url},
    openGraph:{type:'website',url,title,description,images:location.og_image?[{url:location.og_image,alt:location.title}]:[]},
  };
}

export default async function LocationPage({ params }) {
  const { slug } = await params;
  const [location, services, locations, settings] = await Promise.all([
    getLocationBySlug(slug),
    getServices(),
    getLocations(),
    getSiteSettings(),
  ]);
  const content = await getSiteContent();
  if (!location) notFound();

  const relatedServices = services.filter(service =>
    !Array.isArray(location.service_slugs) || !location.service_slugs.length || location.service_slugs.includes(service.slug)
  );
  const nearby = locations.filter(item => item.region === location.region && item.slug !== location.slug).slice(0,8);
  const localNotes = Array.isArray(location.local_notes) ? location.local_notes : [];
  const iconMap = { map: MapPin, building: Building2, route: Route, mountain: Mountain, graduation: GraduationCap, truck: Truck };
  const faqs = Array.isArray(location.faq) ? location.faq.filter(item => item?.question && item?.answer) : [];

  const placeSchema = {
    '@context':'https://schema.org',
    '@type':'Place',
    name:location.title,
    description:location.seo_description || location.hero_description || location.intro,
    url:`${getBaseUrl()}/locations/${location.slug}`,
    containedInPlace: location.region ? { '@type':'AdministrativeArea', name:location.region } : undefined,
  };

  const providerSchema = {
    '@context':'https://schema.org',
    '@type':'MovingCompany',
    name:settings.site_name || 'Sunwings Transport',
    telephone:settings.phone || '1-800-555-5555',
    url:getBaseUrl(),
    areaServed:{ '@type':'City', name:location.title },
  };

  return (
    <>
      <PageHero
        fallbackImage={rotatingHeroImage(location.slug)}
        crumbs={[{label:'Home',href:'/'},{label:'Service Areas',href:'/locations'},{label:location.title}]}
        eyebrow={location.eyebrow}
        title={location.hero_title || `${location.title} movers & delivery`}
        description={location.hero_description || location.intro}
        image={location.banner_image}
        imageAlt={location.banner_alt}
        phone={settings.phone}
      />

      <TrustStrip/>

      {pricedServicesForLocation(content, location.slug).map(item => {
        const service = services.find(entry => entry.slug === item.slug);
        const plan = item.cards.find(card => card.featured) || item.cards[0];
        return (
          <section className="section location-promo" key={item.slug}>
            <div className="container">
              <div className="cta-inline">
                <div>
                  <span className="kicker" style={{color:'var(--accent-2)'}}>Now booking in {location.title}</span>
                  <h3>{item.label} in {location.title} from {plan.amount}{plan.unit || ''}</h3>
                  <p>{plan.features.slice(0, 3).join(' · ')}. Limited spots available.</p>
                </div>
                <div className="location-promo-actions">
                  <QuoteDrawerTrigger className="btn btn-accent" preset={service?.title || item.label} plan={plan.title}>{plan.buttonText || 'Book now'}</QuoteDrawerTrigger>
                  <Link className="btn btn-line location-promo-link" href={item.slug === SNOW_SLUG ? snowTownHref(location.slug) : `/services/${item.slug}`}>See {item.label.toLowerCase()} in {location.title} →</Link>
                </div>
              </div>
            </div>
          </section>
        );
      })}

      <section className="section">
        <div className="container with-side">
          <article className="prose">
            {location.intro && location.hero_description ? <p className="lead-p">{location.intro}</p> : null}
            <span className="kicker">Services in {location.title}</span>
            <h2 style={{marginTop:0}}>Everything we do in {location.title}</h2>
            {relatedServices.length ? <ServiceCards services={relatedServices} compact locationName={location.title} locationSlug={location.slug}/> : <div className="empty-state">No published services linked yet.</div>}

            {(location.neighbourhoods || []).length ? <>
              <h2>Neighbourhoods we cover</h2>
              <div className="chips">
                {location.neighbourhoods.map(item => <span className="chip" key={item}>{item}</span>)}
              </div>
            </> : null}

            {localNotes.length ? <>
              <h2>Moving in {location.title}: what to know</h2>
              <div className="grid-3 local-note-grid">
                {localNotes.map((note, index) => {
                  const Icon = iconMap[note.icon] || MapPin;
                  return <div className="side-card local-note-card" key={`${note.title}-${index}`}>
                    <div className="local-note-icon"><Icon size={26}/></div>
                    <h3>{note.title}</h3>
                    <p>{note.text}</p>
                  </div>;
                })}
              </div>
            </> : null}

            {location.recent_job ? <div className="note-box"><b>Recent {location.title} job:</b> {location.recent_job}</div> : null}

            {location.body_html ? <div dangerouslySetInnerHTML={{__html:location.body_html}}/> : null}

            <div className="cta-inline">
              <div>
                <h3>{location.cta_title || `Moving in ${location.title}?`}</h3>
                <p>{location.cta_text || 'Get an upfront price, usually the same day.'}</p>
              </div>
              <QuoteDrawerTrigger className="btn btn-accent">Request a Quote →</QuoteDrawerTrigger>
            </div>

            {faqs.length ? <>
              <h2>{location.title} moving FAQs</h2>
              {faqs.map(item => <details key={item.question}><summary>{item.question}</summary><p>{item.answer}</p></details>)}
            </> : null}

            {routesForTown(location.slug).length ? <>
              <h2>Long-distance moves to and from {location.title}</h2>
              <div className="chips">
                {routesForTown(location.slug).map(route => <Link className="chip" href={routeHref(route)} key={route.slug}>{route.from} to {route.to} movers</Link>)}
              </div>
            </> : null}

            {nearby.length ? <>
              <h2>Nearby areas</h2>
              <div className="chips">
                {nearby.map(item => <Link className="chip" href={`/locations/${item.slug}`} key={item.slug}>{item.title}</Link>)}
              </div>
            </> : null}
          </article>

          <aside className="side">
            <QuoteForm services={services} compact replyHours={settings.quote_reply_hours}/>
            <div className="side-card">
              <h3>Call the crew</h3>
              <a className="btn btn-navy" style={{width:'100%'}} href={telHref(settings.phone)}>Call Now</a>
            </div>
          </aside>
        </div>
      </section>

      <BreadcrumbSchema baseUrl={getBaseUrl()} items={[{label:'Home',href:'/'},{label:'Service Areas',href:'/locations'},{label:location.title}]}/>
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(placeSchema)}}/>
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(providerSchema)}}/>
      {faqs.length ? <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify({
        '@context':'https://schema.org',
        '@type':'FAQPage',
        mainEntity:faqs.map(item => ({
          '@type':'Question',
          name:item.question,
          acceptedAnswer:{ '@type':'Answer', text:item.answer },
        })),
      })}}/> : null}
    </>
  );
}
