import Link from 'next/link';
import BreadcrumbSchema from '@/components/BreadcrumbSchema';
import { Building2, GraduationCap, MapPin, Mountain, Route, Truck } from 'lucide-react';
import PageHero from '@/components/PageHero';
import QuoteForm from '@/components/QuoteForm';
import ServiceCards from '@/components/ServiceCards';
import TrustStrip from '@/components/TrustStrip';
import { getBaseUrl, getLocationBySlug, getLocations, getServices, getSiteSettings } from '@/lib/content';
import { notFound } from 'next/navigation';

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
    email:settings.email || 'dispatch@sunwingstransport.ca',
    url:getBaseUrl(),
    areaServed:{ '@type':'City', name:location.title },
  };

  return (
    <>
      <PageHero
        crumbs={[{label:'Home',href:'/'},{label:'Service Areas',href:'/locations'},{label:location.title}]}
        title={location.hero_title || `${location.title} movers & delivery`}
        description={location.intro || location.hero_description}
        image={location.banner_image}
        phone={settings.phone}
      />

      <TrustStrip/>

      <section className="section">
        <div className="container with-side">
          <article className="prose">
            <span className="kicker">Services in {location.title}</span>
            <h2 style={{marginTop:0}}>Everything we do in {location.title}</h2>
            {relatedServices.length ? <ServiceCards services={relatedServices} compact locationName={location.title}/> : <div className="empty-state">No published services linked yet.</div>}

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

            {faqs.length ? <>
              <h2>{location.title} moving FAQs</h2>
              {faqs.map(item => <details key={item.question}><summary>{item.question}</summary><p>{item.answer}</p></details>)}
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
              <a className="btn btn-navy" style={{width:'100%'}} href={`tel:+1${String(settings.phone || '18005555555').replace(/\D/g,'')}`}>{settings.phone || '1-800-555-5555'}</a>
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
