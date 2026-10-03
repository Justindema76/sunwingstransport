import Link from 'next/link';
import { Phone } from 'lucide-react';

function telHref(phone = '') {
  const digits = String(phone).replace(/\D/g, '');
  return digits ? `tel:+${digits.startsWith('1') ? digits : `1${digits}`}` : '#';
}

export default function PageHero({ crumbs = [], title, description, image, phone = '647-526-5132', ctas = true }) {
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
            <Link className="btn btn-accent" href="/contact">Get a Free Quote →</Link>
            <a className="btn btn-ghost" href={telHref(phone)}><Phone size={18}/> {phone}</a>
          </div>
        ) : null}
      </div>
    </section>
  );
}
