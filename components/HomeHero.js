import Link from 'next/link';
import { Phone } from 'lucide-react';

function telHref(phone = '') {
  const digits = String(phone).replace(/\D/g, '');
  return digits ? `tel:+${digits.startsWith('1') ? digits : `1${digits}`}` : '#';
}

export default function HomeHero({ settings }) {
  const phone = settings?.phone || '647-526-5132';

  return (
    <section className="hero">
      <div className="container">
        <div className="hero-inner">
          <div className="hero-tag"><i/> Booking moves this week</div>
          <h1>Moving &amp; delivery, <em>done right.</em></h1>
          <p className="lead">
            Residential moves, furniture delivery, junk removal and commercial transport across Toronto, the GTA, Hamilton and Niagara. Careful crews, upfront pricing, no surprises.
          </p>
          <div className="hero-ctas">
            <Link className="btn btn-accent" href="/contact">Get a Free Quote →</Link>
            <a className="btn btn-ghost" href={telHref(phone)}><Phone size={18}/> Call {phone}</a>
          </div>
        </div>
      </div>
      <svg className="wave" viewBox="0 0 1440 70" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0 40c240-40 480-40 720 0s480 40 720 0v30H0z" fill="#fff"/>
      </svg>
    </section>
  );
}
