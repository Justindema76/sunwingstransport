'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Snowflake, X } from 'lucide-react';

// Short pause so the card visibly slides up after the page appears.
const DELAY_MS = 400;

// Promo card that slides up from the bottom-left corner as soon as the page loads.
// Closing it leaves a small tab that reopens it.
export default function OfferPopup({ image, eyebrow, heading, price, text, primary, preset, plan, secondary, secondaryHref, tabLabel }) {
  const [state, setState] = useState('hidden'); // hidden | open | tab
  // Only on the homepage and the snow removal pages; every other page stays clear.
  const path = usePathname() || '/';
  const hidden = !(path === '/' || path === '/services/snow-removal' || path.startsWith('/snow-removal'));

  useEffect(() => {
    const timer = window.setTimeout(() => setState(current => (current === 'hidden' ? 'open' : current)), DELAY_MS);
    return () => window.clearTimeout(timer);
  }, []);

  function close() {
    setState('tab');
  }

  function book() {
    close();
    window.dispatchEvent(new CustomEvent('sunwings:open-quote', { detail: { preset, plan } }));
  }

  if (hidden) return null;

  return (
    <>
      <aside className={`offer-card ${state === 'open' ? 'is-open' : ''}`} aria-labelledby="offer-card-title" aria-hidden={state !== 'open'} inert={state !== 'open' ? '' : undefined}>
        {image ? <div className="offer-card-image"><img src={image} alt="" loading="lazy"/></div> : null}
        <div className="offer-card-top">
          <button className="offer-card-close" type="button" onClick={close} aria-label="Close offer"><X size={18}/></button>
          {eyebrow ? <span className="offer-card-eyebrow">{eyebrow}</span> : null}
          <h2 id="offer-card-title">{heading}</h2>
          {price ? <div className="offer-card-price">{price}</div> : null}
          {text ? <p>{text}</p> : null}
        </div>
        <div className="offer-card-actions">
          <button className="btn btn-accent" type="button" onClick={book}>{primary} →</button>
          {secondary && secondaryHref ? <Link className="offer-card-link" href={secondaryHref}>{secondary}</Link> : null}
        </div>
      </aside>

      {state === 'tab' ? (
        <button className="offer-tab" type="button" onClick={() => setState('open')}>
          <Snowflake size={17}/> {tabLabel || heading}
        </button>
      ) : null}
    </>
  );
}
