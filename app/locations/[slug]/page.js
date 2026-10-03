import Link from 'next/link';
import { Building2, MapPin, Route } from 'lucide-react';
import PageHero from '@/components/PageHero';
import QuoteForm from '@/components/QuoteForm';
import ServiceCards from '@/components/ServiceCards';
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
    title,
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

  return (
    <>
      <PageHero
        crumbs={[{label:'Home',href:'/'},{label:'Service Areas',href:'/locations'},{label:location.title}]}
        title={location.hero_title || `${location.title} movers & delivery`}
        description={location.intro || location.hero_description}
        image={location.banner_image}
        phone={settings.phone}
      />

      <section className="section">
        <div className="container with-side">
          <article className="prose">
            <span className="kicker">Services in {location.title}</span>
            <h2 style={{marginTop:0}}>Everything we do in {location.title}</h2>
            {relatedServices.length ? <ServiceCards services={relatedServices} compact/> : <div className="empty-state">No published services linked yet.</div>}

            {(location.neighbourhoods || []).length ? <>
              <h2>Neighbourhoods we cover</h2>
              <div className="chips">
                {location.neighbourhoods.map(item => <span className="chip" key={item}>{item}</span>)}
              </div>
            </> : null}

            <h2>Moving in {location.title}: what to know</h2>
            <div className="grid-3">
              <div className="side-card"><MapPin size={26}/><h3>Local coverage</h3><p>Routes, pickups and deliveries planned around {location.title} and nearby communities.</p></div>
              <div className="side-card"><Building2 size={26}/><h3>Buildings & access</h3><p>Tell us about elevators, loading zones, stairs or access restrictions before move day.</p></div>
              <div className="side-card"><Route size={26}/><h3>Route planning</h3><p>We plan travel time and truck access around the job, distance and destination.</p></div>
            </div>

            {location.body_html ? <div dangerouslySetInnerHTML={{__html:location.body_html}}/> : null}

            {Array.isArray(location.faq) && location.faq.length ? <>
              <h2>{location.title} moving FAQs</h2>
              {location.faq.map(item => <details key={item.question}><summary>{item.question}</summary><p>{item.answer}</p></details>)}
            </> : null}

            {nearby.length ? <>
              <h2>Nearby areas</h2>
              <div className="chips">
                {nearby.map(item => <Link className="chip" href={`/locations/${item.slug}`} key={item.slug}>{item.title}</Link>)}
              </div>
            </> : null}
          </article>

          <aside className="side">
            <QuoteForm services={services} compact/>
            <div className="side-card">
              <h3>Call the crew</h3>
              <a className="btn btn-navy" style={{width:'100%'}} href={`tel:+1${String(settings.phone || '6475265132').replace(/\D/g,'')}`}>{settings.phone || '647-526-5132'}</a>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
