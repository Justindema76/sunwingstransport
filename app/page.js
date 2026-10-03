import HeroBanner from '@/components/HeroBanner';
import LocationDirectory from '@/components/LocationDirectory';
import QuoteForm from '@/components/QuoteForm';
import ServiceCards from '@/components/ServiceCards';
import { getLocations, getServices, getSiteSettings } from '@/lib/content';

export default async function HomePage() {
  const [settings, services, locations] = await Promise.all([
    getSiteSettings(),
    getServices(),
    getLocations(),
  ]);

  return (
    <>
      <HeroBanner
        eyebrow="Toronto • GTA • Hamilton • Niagara"
        title={settings.hero_title}
        description={settings.hero_description}
        image={settings.hero_image}
        ctaLabel={settings.hero_cta_label}
        ctaUrl={settings.hero_cta_url}
      />

      <section className="section section-soft">
        <div className="container">
          <div className="section-heading">
            <div>
              <span className="kicker">Core Services</span>
              <h2>More than just another moving company.</h2>
            </div>
            <p>Each service is its own managed post with dedicated content, SEO fields and a reusable Sunwings page template.</p>
          </div>
          <ServiceCards services={services} />
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-heading">
            <div>
              <span className="kicker">Service Areas</span>
              <h2>Serving Toronto, the GTA, Hamilton and Niagara.</h2>
            </div>
            <p>Every published Location Post appears here automatically, so the service-area list grows from the admin instead of being hard-coded.</p>
          </div>
          <LocationDirectory locations={locations} />
        </div>
      </section>

      <section className="section business-section" id="business">
        <div className="container business-grid">
          <div>
            <span className="kicker">Business Services</span>
            <h2>Built to win recurring commercial work.</h2>
            <p>Sunwings can support warehouses, retailers, contractors, property managers and businesses that need transportation or labour more than once.</p>
            <a className="button button-primary" href="#quote">Discuss Business Service</a>
          </div>
          <div className="feature-grid">
            {['Warehouse transfers','Container unloading','Retail deliveries','Office relocations','Inventory movement','Equipment transport','Driver + labour support','Recurring scheduled routes'].map(item => (
              <div className="feature-item" key={item}>✓ {item}</div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" id="quote">
        <div className="container quote-grid">
          <div>
            <span className="kicker">Request a Quote</span>
            <h2>Tell us what needs to move.</h2>
            <p>Send the job details, pickup, destination and preferred date. This form is wired to the backend and can be connected to the Just Innovate workflow.</p>
          </div>
          <QuoteForm services={services} />
        </div>
      </section>
    </>
  );
}
