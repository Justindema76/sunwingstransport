import Link from 'next/link';

function telHref(phone = '') {
  const digits = String(phone).replace(/\D/g, '');
  return digits ? `tel:+${digits.startsWith('1') ? digits : `1${digits}`}` : '#';
}

export default function Footer({ settings }) {
  const phone = settings?.phone || '647-526-5132';
  const email = settings?.email || 'dispatch@sunwingstransport.ca';

  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <div className="brand footer-brand">
            <span className="brand-mark">SW</span>
            <span className="brand-copy">{settings?.site_name || 'Sunwings Transport'}</span>
          </div>
          <p>Residential moving, delivery, commercial transport and labour services across Toronto, the GTA, Hamilton and Niagara.</p>
        </div>
        <div>
          <h3>Services</h3>
          <Link href="/services/residential-moving">Residential Moving</Link>
          <Link href="/services/commercial-transport">Commercial Transport</Link>
          <Link href="/services/furniture-delivery">Furniture Delivery</Link>
          <Link href="/services/warehouse-container-unloading">Warehouse Support</Link>
        </div>
        <div>
          <h3>Locations</h3>
          <Link href="/locations/toronto">Toronto</Link>
          <Link href="/locations/mississauga">Mississauga</Link>
          <Link href="/locations/hamilton">Hamilton</Link>
          <Link href="/locations/st-catharines">St. Catharines</Link>
          <Link href="/locations">View All Locations</Link>
        </div>
        <div>
          <h3>Contact</h3>
          <a href={telHref(phone)}>{phone}</a>
          <a href={`mailto:${email}`}>{email}</a>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© {new Date().getFullYear()} {settings?.site_name || 'Sunwings Transport'}</span>
        <span>Moving • Delivery • Commercial Transport</span>
      </div>
    </footer>
  );
}
