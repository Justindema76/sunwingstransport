import Link from 'next/link';

function telHref(phone = '') {
  const digits = String(phone).replace(/\D/g, '');
  return digits ? `tel:+${digits.startsWith('1') ? digits : `1${digits}`}` : '#';
}

export default function Footer({ settings, services = [] }) {
  const phone = settings?.phone || '647-526-5132';
  const email = settings?.email || 'dispatch@sunwingstransport.ca';

  return (
    <>
      <section className="cta-band">
        <div className="container">
          <h2>Ready when you are.</h2>
          <div className="cta-actions">
            <Link className="btn btn-navy" href="/contact">Get a Free Quote</Link>
            <a className="btn btn-line" href={telHref(phone)}>Call {phone}</a>
          </div>
        </div>
      </section>

      <footer>
        <div className="container">
          <div className="foot">
            <div>
              <img
                className="foot-logo"
                src="https://sunwingstransport.ca/wp-content/uploads/2026/01/SUNWING-site-logo.png"
                alt="Sunwings Transport"
              />
              <p>Reliable • On-Time • Professional. Moving, delivery and commercial transport from Toronto to Niagara.</p>
            </div>

            <div>
              <h4>Services</h4>
              {(services.length ? services.slice(0,5) : [
                { slug:'residential-moving', title:'Residential Moving' },
                { slug:'furniture-delivery', title:'Furniture Delivery' },
                { slug:'commercial-transport', title:'Commercial Transport' },
                { slug:'warehouse-container-unloading', title:'Warehouse Support' },
              ]).map(service => <Link key={service.slug} href={`/services/${service.slug}`}>{service.title}</Link>)}
            </div>

            <div>
              <h4>Service Areas</h4>
              <Link href="/locations/toronto">Toronto</Link>
              <Link href="/locations/mississauga">Mississauga</Link>
              <Link href="/locations/hamilton">Hamilton</Link>
              <Link href="/locations/st-catharines">St. Catharines</Link>
              <Link href="/locations">All areas →</Link>
            </div>

            <div>
              <h4>Company</h4>
              <Link href="/pricing">Pricing</Link>
              <Link href="/blog">Moving Tips</Link>
              <Link href="/contact">Contact</Link>
              <a href={telHref(phone)}>{phone}</a>
              <a href={`mailto:${email}`}>{email}</a>
            </div>
          </div>

          <div className="foot-bottom">
            <span>© {new Date().getFullYear()} Sunwings Transport</span>
            <Link href="/privacy">Privacy Policy</Link>
          </div>
        </div>
      </footer>

      <div className="mbar">
        <a href={telHref(phone)}>Call</a>
        <Link href="/contact">Free Quote</Link>
      </div>
    </>
  );
}
