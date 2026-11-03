import Link from 'next/link';
import { ArrowRight, BadgeDollarSign, CalendarDays, MapPin, Star } from 'lucide-react';
import { CONTENT_DEFAULTS } from '@/lib/contentDefaults';
import { getSiteContent } from '@/lib/siteContent';

const ICONS = [Star, BadgeDollarSign, CalendarDays, MapPin];

// The 4 boxes under the banner, edited in Admin › Promotions & Banners. A box with a
// link shows an arrow and opens it (outside links open in a new tab).
export default async function TrustStrip({ items }) {
  const list = (items || (await getSiteContent()).trustLinks || CONTENT_DEFAULTS.trust_links).filter(item => item?.title);

  return (
    <div className="container trust">
      <div className="trust-grid">
        {list.map(({ title, text, href }, i) => {
          const Icon = ICONS[i] || Star;
          const body = <>
            <div className="t-ico"><Icon size={22}/></div>
            <div><b>{title}</b><span>{text}</span></div>
            {href ? <ArrowRight className="trust-arrow" size={20} aria-hidden="true"/> : null}
          </>;
          if (!href) return <div className="trust-item" key={`${title}-${i}`}>{body}</div>;
          return /^https?:/i.test(href)
            ? <a className="trust-item trust-link" href={href} target="_blank" rel="noopener noreferrer" key={`${title}-${i}`}>{body}</a>
            : <Link className="trust-item trust-link" href={href} key={`${title}-${i}`}>{body}</Link>;
        })}
      </div>
    </div>
  );
}
