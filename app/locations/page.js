import Link from 'next/link';
import PageHero from '@/components/PageHero';
import QuoteForm from '@/components/QuoteForm';
import ServiceAreaGrid from '@/components/ServiceAreaGrid';
import { getLocations, getServices, getSiteSettings } from '@/lib/content';

export const metadata = {
  title: 'Sunwings Transport Service Areas',
  description: 'Sunwings Transport service areas across Toronto, the GTA, Hamilton and the Niagara Region.',
  alternates: { canonical: '/locations' },
};

export default async function LocationsPage() {
  const [locations, services, settings] = await Promise.all([getLocations(), getServices(), getSiteSettings()]);
  return (
    <>
      <PageHero
        crumbs={[{label:'Home',href:'/'},{label:'Service Areas'}]}
        title="Service areas: Toronto to Niagara"
        description="Pick your city to see local services, neighbourhoods we cover and answers to local questions."
        image="https://sunwingstransport.ca/wp-content/uploads/2026/01/cargo-van-1.png"
        phone={settings.phone}
      />
      <section className="section">
        <div className="container">
          {locations.length ? <ServiceAreaGrid locations={locations} detailed/> : <div className="empty-state">No published Location Posts yet.</div>}
        </div>
      </section>
      <section className="section section-soft">
        <div className="container split">
          <div>
            <span className="kicker">Not listed?</span>
            <h2>Moving somewhere else in Ontario?</h2>
            <p className="muted" style={{margin:'14px 0 24px',fontSize:17}}>We run longer trips on request. Tell us the route and we’ll quote it.</p>
            <Link className="btn btn-accent" href="/contact">Ask about your route →</Link>
          </div>
          <QuoteForm services={services} compact/>
        </div>
      </section>
    </>
  );
}
