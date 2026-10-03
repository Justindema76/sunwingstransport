import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <div className="brand footer-brand">
            <span className="brand-mark">SW</span>
            <span className="brand-copy">Sunwings Transport</span>
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
          <a href="tel:+16475265132">647-526-5132</a>
          <a href="mailto:dispatch@sunwingstransport.ca">dispatch@sunwingstransport.ca</a>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© 2026 Sunwings Transport</span>
        <span>Managed through Just Innovate Admin</span>
      </div>
    </footer>
  );
}
