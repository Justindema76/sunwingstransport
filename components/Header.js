import Link from 'next/link';
import { Phone } from 'lucide-react';

function telHref(phone = '') {
  const digits = String(phone).replace(/\D/g, '');
  return digits ? `tel:+${digits.startsWith('1') ? digits : `1${digits}`}` : '#';
}

export default function Header({ settings }) {
  const phone = settings?.phone || '647-526-5132';

  return (
    <>
      <div className="topbar">
        <div className="container">
          <span><b>Reliable • On-Time • Professional</b> — Moving &amp; delivery from Toronto to Niagara</span>
          <a href={telHref(phone)}><Phone size={15}/> {phone}</a>
        </div>
      </div>

      <header className="site">
        <div className="container nav">
          <Link className="logo" href="/">
            <img
              src="https://sunwingstransport.ca/wp-content/uploads/2026/01/SUNWING-site-logo.png"
              alt="Sunwings Transport"
            />
          </Link>

          <nav className="nav-links" aria-label="Main navigation">
            <Link href="/services">Services</Link>
            <Link href="/locations">Service Areas</Link>
            <Link href="/pricing">Pricing</Link>
            <Link href="/blog">Moving Tips</Link>
            <Link href="/contact">Contact</Link>
          </nav>

          <div className="nav-cta">
            <a className="nav-phone" href={telHref(phone)}>{phone}</a>
            <Link className="btn btn-accent" href="/contact">Free Quote</Link>
          </div>
        </div>
      </header>
    </>
  );
}
