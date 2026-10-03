import Link from 'next/link';

export default function Header() {
  return (
    <>
      <div className="topbar">
        <div className="container topbar-inner">
          <span><strong>Toronto • GTA • Hamilton • Niagara</strong> moving, delivery and commercial transport</span>
          <a href="tel:+16475265132">647-526-5132</a>
        </div>
      </div>
      <header className="site-header">
        <div className="container nav">
          <Link className="brand" href="/">
            <span className="brand-mark">SW</span>
            <span className="brand-copy">
              Sunwings Transport
              <small>Moving • Delivery • Commercial</small>
            </span>
          </Link>
          <nav className="nav-links" aria-label="Main navigation">
            <Link href="/services">Services</Link>
            <Link href="/locations">Locations</Link>
            <Link href="/#business">Business</Link>
            <Link href="/#quote">Contact</Link>
          </nav>
          <div className="nav-actions">
            <a className="button button-outline" href="tel:+16475265132">Call Now</a>
            <Link className="button button-primary" href="/#quote">Get a Quote</Link>
          </div>
        </div>
      </header>
    </>
  );
}
