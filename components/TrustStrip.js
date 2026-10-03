import { BadgeDollarSign, CalendarDays, MapPin, Star } from 'lucide-react';

const ITEMS = [
  { icon: Star, title: 'Google reviews', text: 'Trusted by local customers' },
  { icon: BadgeDollarSign, title: 'Price-match guarantee', text: 'Fair, upfront quotes' },
  { icon: CalendarDays, title: 'Flexible scheduling', text: 'Evenings & weekends' },
  { icon: MapPin, title: 'Toronto to Niagara', text: 'GTA, Hamilton & beyond' },
];

export default function TrustStrip() {
  return (
    <div className="container trust">
      <div className="trust-grid">
        {ITEMS.map(({ icon: Icon, title, text }) => (
          <div className="trust-item" key={title}>
            <div className="t-ico"><Icon size={22}/></div>
            <div><b>{title}</b><span>{text}</span></div>
          </div>
        ))}
      </div>
    </div>
  );
}
