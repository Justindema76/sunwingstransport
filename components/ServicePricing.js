import Link from 'next/link';
import QuoteDrawerTrigger from './QuoteDrawerTrigger';

export default function ServicePricing({ slug, pricing, serviceTitle, soft = false, showAllLink = false }) {
  if (!pricing) return null;
  const preset = serviceTitle || pricing.label;

  return (
    <section className={`section service-pricing ${soft ? 'section-soft' : ''}`} id={slug}>
      <div className="container">
        <div className="section-head">
          {pricing.eyebrow ? <span className="kicker">{pricing.eyebrow}</span> : null}
          {pricing.heading ? <h2>{pricing.heading}</h2> : null}
          {pricing.text ? <p>{pricing.text}</p> : null}
        </div>

        <div className={`${pricing.cards.length === 4 ? 'grid-4' : 'grid-3'} service-price-grid`}>
          {pricing.cards.map(card => (
            <div className={`price-card ${card.featured ? 'pop' : ''}`} key={card.title}>
              <h3>{card.title}</h3>
              {card.subtitle ? <p className="muted">{card.subtitle}</p> : null}
              <div className="amt">
                {card.prefix ? <span className="amt-prefix">{card.prefix} </span> : null}
                {card.amount}
                {card.unit ? <span className="amt-unit">{card.unit}</span> : null}
              </div>
              {card.note ? <small className="muted">{card.note}</small> : null}
              <ul>{card.features.map(item => <li key={item}>{item}</li>)}</ul>
              <QuoteDrawerTrigger
                className={card.featured ? 'btn btn-accent' : 'btn btn-line'}
                preset={preset}
                plan={card.title}
              >
                {card.buttonText || 'Get a quote'}
              </QuoteDrawerTrigger>
            </div>
          ))}
        </div>

        {pricing.details?.length ? (
          <div className="service-price-details">
            {pricing.details.map(item => (
              <div key={item.label}>
                <span>{item.label}</span>
                <b>{item.value}</b>
                {item.note ? <small>{item.note}</small> : null}
              </div>
            ))}
          </div>
        ) : null}

        {pricing.areas?.length ? (
          <div className="service-price-areas">
            <span className="kicker">Now booking in</span>
            <div className="chips">{pricing.areas.map(area => <span className="chip" key={area}>{area}</span>)}</div>
          </div>
        ) : null}

        {pricing.footnote ? <p className="fine">{pricing.footnote}</p> : null}
        {showAllLink ? <p className="fine"><Link href={`/pricing#${slug}`}>See all Sunwings pricing →</Link></p> : null}
      </div>
    </section>
  );
}
