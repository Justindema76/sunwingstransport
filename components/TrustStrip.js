import Link from 'next/link';
import { ArrowRight, BadgeDollarSign, CalendarDays, Clock, MapPin, ShieldCheck, Star, Truck } from 'lucide-react';

const ICONS = { star: Star, dollar: BadgeDollarSign, calendar: CalendarDays, pin: MapPin, shield: ShieldCheck, truck: Truck, clock: Clock };

// Google's reviews link for Sunwings Transport (opens the business's reviews panel).
// The place ID is from its Google Maps listing.
const GOOGLE_REVIEWS_URL = 'https://search.google.com/local/reviews?placeid=ChIJXTBVHE3zTkcRiUEmU5P3CsI';
// Sunwings Transport's Google Maps listing (pin, hours, directions).
const GOOGLE_MAPS_URL = 'https://www.google.com/maps?cid=13982260205252395401';

const DEFAULT_ITEMS = [
  { icon: 'star', title: 'Google reviews', text: 'Trusted by local customers', href: GOOGLE_REVIEWS_URL },
  { icon: 'dollar', title: 'Price-match guarantee', text: 'We match any lower written quote', href: '/pricing#price-match' },
  { icon: 'calendar', title: 'Flexible scheduling', text: 'Evenings & weekends' },
  { icon: 'pin', title: 'Toronto to Niagara', text: 'GTA, Hamilton & beyond', href: GOOGLE_MAPS_URL },
];

export default function TrustStrip(props = {}) {
  const items = DEFAULT_ITEMS.map((fallback, i) => {
    const n = i + 1;
    return {
      icon: props[`item${n}Icon`] || fallback.icon,
      title: props[`item${n}Title`] ?? fallback.title,
      // The admin's old price-match line is replaced with the actual guarantee.
      text: props[`item${n}Text`] === 'Fair, upfront quotes' ? fallback.text : (props[`item${n}Text`] ?? fallback.text),
      href: props[`item${n}Href`] || fallback.href || '',
    };
  }).filter(item => item.title);

  return (
    <div className="container trust">
      <div className="trust-grid">
        {items.map(({ icon, title, text, href }, i) => {
          const Icon = ICONS[icon] || Star;
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
