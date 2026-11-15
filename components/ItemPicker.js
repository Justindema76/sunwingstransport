'use client';

// Tap-to-pick item list for the quote form: customers tap items instead of typing a list.
import './itemPicker.css';

export const PICK_ITEMS = [
  'Sofa / couch', 'Sectional', 'Loveseat', 'Armchair', 'Bed + mattress', 'Mattress only',
  'Dresser', 'Nightstand', 'Dining table', 'Dining chair', 'Desk', 'Bookshelf',
  'TV', 'TV stand', 'Fridge', 'Washer', 'Dryer', 'Stove', 'Boxes',
];

// The picks plus anything typed, as one text for the quote's item list.
export function itemsText(items = {}, other = '') {
  const picked = Object.entries(items).filter(([, n]) => n > 0).map(([name, n]) => `${n} × ${name}`);
  return [picked.join(', '), String(other || '').trim()].filter(Boolean).join('\n');
}

export default function ItemPicker({ items = {}, onChange }) {
  const add = (name, delta) => onChange({ ...items, [name]: Math.max(0, Math.min(99, (items[name] || 0) + delta)) });
  return <ul className="qs-items" aria-label="Pick your items">
    {PICK_ITEMS.map(name => {
      const n = items[name] || 0;
      return <li key={name} className={n ? 'is-on' : ''}>
        <button type="button" className="qs-item-name" onClick={() => add(name, 1)} aria-label={`Add ${name}`}>
          <span>{name}</span>{n ? <b>{n}</b> : <i aria-hidden="true">+</i>}
        </button>
        {n ? <button type="button" className="qs-item-minus" onClick={() => add(name, -1)} aria-label={`Remove one ${name}`}>−</button> : null}
      </li>;
    })}
  </ul>;
}
