import Link from 'next/link';
import QuoteDrawerTrigger from './QuoteDrawerTrigger';
import { telHref } from '@/lib/phone';
import './hnPricing.css';

// Hamilton & Niagara prices and the "get your price" band. All text and numbers come from
// hn_content.pricing (defaults in lib/hamiltonNiagara.js), so they can be changed without code.

// The big call-to-action band: quote button + phone, used across the Hamilton & Niagara pages.
export function HnQuoteBand({ phone = '', preset = '', heading = 'Get your exact price today.', text = 'Free written quote, usually back the same day. No obligation, no surprise fees.' }) {
  return (
    <section className="hn-quote-band">
      <div className="container hn-quote-band-inner">
        <div>
          <h2>{heading}</h2>
          <p>{text}</p>
        </div>
        <div className="hn-quote-band-actions">
          <QuoteDrawerTrigger className="btn btn-accent" preset={preset}>Get my price →</QuoteDrawerTrigger>
          {phone ? <a className="btn btn-ghost" href={telHref(phone)}>Call {phone}</a> : null}
        </div>
      </div>
    </section>
  );
}

function PriceCard({ item, unit, button, preset }) {
  return (
    <div className={`price-card${item.featured ? ' pop' : ''}`}>
      <h3>{item.title}</h3>
      {item.text ? <p className="muted">{item.text}</p> : null}
      <div className="amt">{item.amount !== 'Quote' ? <small className="hn-from">from </small> : null}{item.amount}{item.unit || unit ? <small className="hn-unit">{item.unit || unit}</small> : null}</div>
      {item.note ? <small className="muted">{item.note}</small> : null}
      {item.features?.length ? <><b className="hn-includes">Includes:</b><ul>{item.features.map(line => <li key={line}>{line}</li>)}</ul></> : <div style={{ flex: 1, minHeight: 16 }}/>}
      <QuoteDrawerTrigger className={`btn ${item.featured ? 'btn-accent' : 'btn-line'}`} preset={preset}>{button}</QuoteDrawerTrigger>
    </div>
  );
}

// Short version for the home and service pages: the long-distance starting prices + a link.
export function HnPriceTeaser({ pricing, pricingHref, title = 'Starting prices', preset = '' }) {
  const items = (pricing.long || []).filter(item => item?.title && item.amount !== 'Quote').slice(0, 4);
  if (!items.length) return null;
  return (
    <div className="hn-teaser">
      <div className="hn-teaser-head">
        <h2>{title}</h2>
        <Link href={pricingHref}>All prices →</Link>
      </div>
      <div className="hn-teaser-grid">
        {items.map(item => (
          <QuoteDrawerTrigger key={item.title} className={`hn-teaser-card${item.featured ? ' is-featured' : ''}`} preset={preset}>
            <span>{item.title}</span>
            <b>from {item.amount}</b>
            <small>{item.note}</small>
          </QuoteDrawerTrigger>
        ))}
      </div>
      {pricing.note ? <p className="hn-price-note">{pricing.note}</p> : null}
    </div>
  );
}

// The full Hamilton & Niagara pricing page body.
export default function HnPricing({ pricing, phone = '' }) {
  const hourly = (pricing.hourly || []).filter(item => item?.title);
  const long = (pricing.long || []).filter(item => item?.title);
  const routes = (pricing.routes || []).filter(item => item?.route);
  const faqs = (pricing.faqs || []).filter(item => item?.question && item?.answer);
  return (
    <>
      <section className="section" id="pricing-long-distance">
        <div className="container">
          <div className="section-head">
            <span className="kicker">Long-distance</span>
            <h2>{pricing.longTitle}</h2>
            {pricing.longText ? <p>{pricing.longText}</p> : null}
          </div>
          {pricing.disclaimer ? (
            <div className="hn-disclaimer">
              {pricing.disclaimerTitle ? <h3>{pricing.disclaimerTitle}</h3> : null}
              <p>{pricing.disclaimer}</p>
            </div>
          ) : null}
          <div className="grid-3 hn-price-grid">
            {long.map(item => <PriceCard key={item.title} item={item} button="Get my price" preset="Long-Distance Moving"/>)}
          </div>
          {pricing.note ? <p className="hn-price-note">{pricing.note}</p> : null}
        </div>
      </section>

      {routes.length ? (
        <section className="section section-soft" id="pricing-routes">
          <div className="container" style={{ maxWidth: 900 }}>
            <div className="section-head">
              <span className="kicker">By route</span>
              <h2>{pricing.routesTitle}</h2>
            </div>
            <div className="hn-route-table" role="table">
              <div className="hn-route-row is-head" role="row"><span role="columnheader">Route</span><span role="columnheader">Single item</span><span role="columnheader">1-bedroom</span></div>
              {routes.map(row => (
                <div className="hn-route-row" role="row" key={row.route}>
                  <span role="cell">{row.route}</span>
                  <span role="cell">from {row.item}</span>
                  <span role="cell"><b>from {row.move}</b></span>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <HnQuoteBand phone={phone}/>

      {hourly.length ? (
        <section className="section" id="pricing-hourly">
          <div className="container">
            <div className="section-head">
              <span className="kicker">Local moves</span>
              <h2>Hourly rates inside Hamilton & Niagara.</h2>
              <p>For moves and deliveries that stay in the region. You only pay for the time on the job.</p>
            </div>
            <div className="grid-3">
              {hourly.map(item => <PriceCard key={item.title} item={item} button="Book this crew"/>)}
            </div>
          </div>
        </section>
      ) : null}

      <section className="section section-soft">
        <div className="container grid-2">
          {pricing.included?.length ? (
            <div className="side-card">
              <h3>Included in every price</h3>
              <ul className="checks one">{pricing.included.map(line => <li key={line}>{line}</li>)}</ul>
            </div>
          ) : null}
          {pricing.extras?.length ? (
            <div className="side-card">
              <h3>Extras, only if you need them</h3>
              <ul className="checks one">{pricing.extras.map(line => <li key={line}>{line}</li>)}</ul>
            </div>
          ) : null}
        </div>
      </section>

      {faqs.length ? (
        <section className="section">
          <div className="container prose" style={{ maxWidth: 900 }}>
            <span className="kicker">Pricing questions</span>
            <h2>Questions about price</h2>
            <div className="service-faqs">
              {faqs.map(item => <details key={item.question}><summary>{item.question}</summary><p>{item.answer}</p></details>)}
            </div>
          </div>
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: faqs.map(item => ({ '@type': 'Question', name: item.question, acceptedAnswer: { '@type': 'Answer', text: item.answer } })),
          }) }}/>
        </section>
      ) : null}

      <HnQuoteBand phone={phone} heading="Ready to book? Get your written price." text="Send your addresses, date and what’s moving. We reply with a price, usually the same day."/>
    </>
  );
}
