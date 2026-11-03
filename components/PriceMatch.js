import { CheckCircle2, FileText, Handshake, Send } from 'lucide-react';
import QuoteDrawerTrigger from './QuoteDrawerTrigger';
import { getSiteContent } from '@/lib/siteContent';

const STEP_ICONS = [FileText, Send, Handshake];

// Pricing page section explaining the price-match guarantee in detail.
// Edited in Admin › Promotions & Banners › Price match.
export default async function PriceMatch() {
  const { priceMatch: pm } = await getSiteContent();
  if (pm.enabled === false) return null;
  return (
    <section className="section section-soft price-match" id="price-match">
      <div className="container">
        <div className="section-head">
          {pm.eyebrow ? <span className="kicker">{pm.eyebrow}</span> : null}
          <h2>{pm.heading}</h2>
          {pm.text ? <p>{pm.text}</p> : null}
        </div>

        <div className="grid-3 price-match-steps">
          {(pm.steps || []).map(({ title, text }, index) => {
            const Icon = STEP_ICONS[index] || Handshake;
            return (
            <div className="price-match-step" key={`${title}-${index}`}>
              <div className="price-match-num">{index + 1}</div>
              <Icon size={26}/>
              <h3>{title}</h3>
              <p>{text}</p>
            </div>
            );
          })}
        </div>

        <div className="price-match-rules">
          <div>
            {pm.rulesTitle ? <h3>{pm.rulesTitle}</h3> : null}
            <ul>{(pm.rules || []).filter(Boolean).map(rule => <li key={rule}><CheckCircle2 size={18}/> {rule}</li>)}</ul>
          </div>
          {pm.button ? <QuoteDrawerTrigger className="btn btn-accent">{pm.button} →</QuoteDrawerTrigger> : null}
        </div>
      </div>
    </section>
  );
}
