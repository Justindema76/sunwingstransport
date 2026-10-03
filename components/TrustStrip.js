import { BadgeDollarSign, CalendarDays, Clock, MapPin, ShieldCheck, Star, Truck } from 'lucide-react';

const ICONS = { star: Star, dollar: BadgeDollarSign, calendar: CalendarDays, pin: MapPin, shield: ShieldCheck, truck: Truck, clock: Clock };

const DEFAULT_ITEMS = [
  { icon: 'star', title: 'Google reviews', text: 'Trusted by local customers' },
  { icon: 'dollar', title: 'Price-match guarantee', text: 'Fair, upfront quotes' },
  { icon: 'calendar', title: 'Flexible scheduling', text: 'Evenings & weekends' },
  { icon: 'pin', title: 'Toronto to Niagara', text: 'GTA, Hamilton & beyond' },
];

export default function TrustStrip(props = {}) {
  const items = DEFAULT_ITEMS.map((fallback, i) => {
    const n = i + 1;
    return {
      icon: props[`item${n}Icon`] || fallback.icon,
      title: props[`item${n}Title`] ?? fallback.title,
      text: props[`item${n}Text`] ?? fallback.text,
    };
  }).filter(item => item.title);

  return (
    <div className="container trust">
      <div className="trust-grid">
        {items.map(({ icon, title, text }, i) => {
          const Icon = ICONS[icon] || Star;
          return (
            <div className="trust-item" key={`${title}-${i}`}>
              <div className="t-ico"><Icon size={22}/></div>
              <div><b>{title}</b><span>{text}</span></div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
