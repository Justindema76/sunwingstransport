import Link from 'next/link';
import { Phone } from 'lucide-react';
import QuoteDrawerTrigger from './QuoteDrawerTrigger';

function telHref(phone = '') {
  const digits = String(phone).replace(/\D/g, '');
  return digits ? `tel:+${digits.startsWith('1') ? digits : `1${digits}`}` : '#';
}

export default function PageHero({ crumbs = [], title, description, image, phone = '1-800-555-5555', ctas = true }) {
  const style = image ? { '--page-hero-img': `url("${image}")` } : undefined;
  return (
    <section className="page-hero" style={style}>
      <div className="container">
        {crumbs.length ? (
          <div className="crumbs">
            {crumbs.map((crumb, index) => (
              <span className="crumb-part" key={`${crumb.label}-${index}`}>
                {crumb.href ? <Link href={crumb.href}>{crumb.label}</Link> : <b>{crumb.label}</b>}
                {index < crumbs.length - 1 ? <span className="crumb-sep">›</span> : null}
              </span>
            ))}
          </div>
        ) : null}
        <h1>{title}</h1>
        {description ? <p>{description}</p> : null}
        {ctas ? (
          <div className="hero-ctas">
            <QuoteDrawerTrigger className="btn btn-accent">Request a Quote →</QuoteDrawerTrigger>
            <a className="btn btn-ghost" href={telHref(phone)}><Phone size={18}/> {phone}</a>
          </div>
        ) : null}
      </div>
    </section>
  );
}
