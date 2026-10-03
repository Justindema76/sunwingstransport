import Link from 'next/link';
import { Phone } from 'lucide-react';
import BlogArchive from './BlogArchive';
import BlogCards from './BlogCards';
import ContactForm from './ContactForm';
import HowItWorks from './HowItWorks';
import QuoteForm from './QuoteForm';
import ReviewsBlock from './ReviewsBlock';
import ServiceAreaGrid from './ServiceAreaGrid';
import ServiceCards from './ServiceCards';
import TrustStrip from './TrustStrip';

function telHref(phone = '') {
  const digits = String(phone).replace(/\D/g, '');
  return digits ? `tel:+${digits.startsWith('1') ? digits : `1${digits}`}` : '#';
}

function SmartLink({ to, className = 'btn btn-accent', children }) {
  if (!children) return null;
  const url = String(to || '#');
  if (/^(https?:|tel:|mailto:)/i.test(url)) return <a className={className} href={url}>{children}</a>;
  return <Link className={className} href={url}>{children}</Link>;
}

function lines(value) {
  if (Array.isArray(value)) return value.map(String).map(s => s.trim()).filter(Boolean);
  return String(value || '').split('\n').map(s => s.trim()).filter(Boolean);
}

function SectionHead({ p, center = false }) {
  if (!p.eyebrow && !p.heading && !p.text) return null;
  return (
    <div className={`section-head ${center ? 'center' : ''}`}>
      {p.eyebrow ? <span className="kicker">{p.eyebrow}</span> : null}
      {p.heading ? <h2>{p.heading}</h2> : null}
      {p.text ? <p>{p.text}</p> : null}
    </div>
  );
}

function sectionClass(p, fallback = '') {
  const bg = p.background || fallback;
  return `section ${bg === 'soft' || bg === 'light' ? 'section-soft' : ''}`;
}

function Hero({ p, home, settings }) {
  const phone = settings?.phone || '647-526-5132';
  const secondaryText = p.secondaryButtonText || (p.showCallButton !== false ? `Call ${phone}` : '');
  const secondaryUrl = p.secondaryButtonUrl || telHref(phone);
  const actions = (
    <div className="hero-ctas">
      <SmartLink to={p.primaryButtonUrl || '/contact'}>{p.primaryButtonText}</SmartLink>
      {secondaryText ? (
        <SmartLink to={secondaryUrl} className="btn btn-ghost">
          {!p.secondaryButtonText ? <Phone size={18}/> : null} {secondaryText}
        </SmartLink>
      ) : null}
    </div>
  );

  if (home) {
    const style = p.image
      ? { backgroundImage: `linear-gradient(100deg,rgba(11,37,69,.94),rgba(19,49,92,.78)),url("${p.image}")`, backgroundSize: 'cover', backgroundPosition: 'center' }
      : undefined;
    return (
      <section className="hero" style={style}>
        <div className="container">
          <div className="hero-inner">
            {p.eyebrow ? <div className="hero-tag"><i/> {p.eyebrow}</div> : null}
            <h1>{p.heading}{p.accent ? <> <em>{p.accent}</em></> : null}</h1>
            {p.text ? <p className="lead">{p.text}</p> : null}
            {actions}
          </div>
        </div>
        <svg className="wave" viewBox="0 0 1440 70" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0 40c240-40 480-40 720 0s480 40 720 0v30H0z" fill="#fff"/>
        </svg>
      </section>
    );
  }

  const style = p.image ? { '--page-hero-img': `url("${p.image}")` } : undefined;
  const crumb = p.breadcrumbLabel || p.heading;
  return (
    <section className="page-hero" style={style}>
      <div className="container">
        {p.showBreadcrumbs !== false && crumb ? (
          <div className="crumbs">
            <span className="crumb-part"><Link href="/">Home</Link><span className="crumb-sep">›</span></span>
            <span className="crumb-part"><b>{crumb}</b></span>
          </div>
        ) : null}
        {p.eyebrow ? <span className="kicker" style={{ color: 'var(--accent-2)' }}>{p.eyebrow}</span> : null}
        <h1>{p.heading}{p.accent ? <> <span style={{ color: 'var(--accent-2)' }}>{p.accent}</span></> : null}</h1>
        {p.text ? <p>{p.text}</p> : null}
        {p.primaryButtonText || secondaryText ? actions : null}
      </div>
    </section>
  );
}

const DEFAULT_PRICE_CARDS = [
  { title: 'Small moves & delivery', subtitle: 'Single items, Marketplace pickups, studios', amount: 'Quote', note: 'based on the job', features: '1–2 movers\nCargo van\nBlanket wrapping\nPlacement in room' },
  { title: 'Truck + 2 movers', subtitle: 'Most 1–2 bedroom moves', amount: 'Quote', note: 'upfront pricing', features: '2 movers\nTruck & equipment\nWrapping & protection\nDisassembly & reassembly' },
  { title: 'Larger moves', subtitle: 'Houses, commercial and larger jobs', amount: 'Quote', note: 'based on crew and time', features: 'Larger crew\nTruck & equipment\nWrapping & protection\nBuilt for bigger jobs' },
];

function PricingCards({ p }) {
  const featured = Number(p.featuredCard || 2);
  const cards = DEFAULT_PRICE_CARDS.map((fallback, i) => {
    const n = i + 1;
    return {
      title: p[`card${n}Title`] ?? fallback.title,
      subtitle: p[`card${n}Subtitle`] ?? fallback.subtitle,
      amount: p[`card${n}Amount`] ?? fallback.amount,
      note: p[`card${n}Note`] ?? fallback.note,
      features: lines(p[`card${n}Features`] ?? fallback.features),
      buttonText: p[`card${n}ButtonText`] || 'Get a quote',
      buttonUrl: p[`card${n}ButtonUrl`] || '/contact',
    };
  }).filter(card => card.title);

  return (
    <section className={sectionClass(p)}>
      <div className="container">
        <SectionHead p={p}/>
        <div className="grid-3">
          {cards.map((card, i) => (
            <div className={`price-card ${featured === i + 1 ? 'pop' : ''}`} key={i}>
              <h3>{card.title}</h3>
              {card.subtitle ? <p className="muted">{card.subtitle}</p> : null}
              <div className="amt">{card.amount}</div>
              {card.note ? <small className="muted">{card.note}</small> : null}
              <ul>{card.features.map(item => <li key={item}>{item}</li>)}</ul>
              <SmartLink to={card.buttonUrl} className={featured === i + 1 ? 'btn btn-accent' : 'btn btn-line'}>{card.buttonText}</SmartLink>
            </div>
          ))}
        </div>
        {p.footnote ? <p className="fine" style={{ marginTop: 18 }}>{p.footnote}</p> : null}
      </div>
    </section>
  );
}

function PriceBand({ p }) {
  const items = [1, 2].map(n => ({
    label: p[`card${n}Label`], value: p[`card${n}Value`], note: p[`card${n}Note`],
  })).filter(item => item.label || item.value);
  return (
    <section className="section" style={{ paddingTop: p.removeTopSpace ? 0 : undefined }}>
      <div className="container">
        <div className="price-band">
          <div>
            {p.eyebrow ? <span className="kicker" style={{ color: 'var(--accent-2)' }}>{p.eyebrow}</span> : null}
            <h2>{p.heading}</h2>
            {p.text ? <p>{p.text}</p> : null}
            {p.buttonText ? <div style={{ marginTop: 24 }}><SmartLink to={p.buttonUrl || '/pricing'}>{p.buttonText}</SmartLink></div> : null}
          </div>
          {items.length ? (
            <div className="pcs">
              {items.map((item, i) => <div className="pc" key={i}><span>{item.label}</span><b>{item.value}</b><small>{item.note}</small></div>)}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function PricingFactors({ p }) {
  const items = lines(p.checklist);
  return (
    <section className={sectionClass(p, 'soft')}>
      <div className="container split pricing-factors">
        <div>
          {p.eyebrow ? <span className="kicker">{p.eyebrow}</span> : null}
          <h2>{p.heading}</h2>
          {p.text ? <p className="muted" style={{ marginTop: 14, fontSize: 17 }}>{p.text}</p> : null}
          {items.length ? <ul className="checks one">{items.map(item => <li key={item}>{item}</li>)}</ul> : null}
        </div>
        <div className="price-band pricing-guarantee">
          <div>
            {p.guaranteeEyebrow ? <span className="kicker" style={{ color:'var(--accent-2)' }}>{p.guaranteeEyebrow}</span> : null}
            <h2>{p.guaranteeHeading}</h2>
            {p.guaranteeText ? <p>{p.guaranteeText}</p> : null}
          </div>
        </div>
      </div>
    </section>
  );
}

function SplitFeature({ p }) {
  const checks = lines(p.checklist);
  const photo = p.image
    ? <div className="photo ph" style={{ backgroundImage: `url("${p.image}")` }} role="img" aria-label={p.alt || p.imageAlt || ''}/>
    : <div className="photo ph"/>;
  const copy = (
    <div>
      {p.eyebrow ? <span className="kicker">{p.eyebrow}</span> : null}
      <h2>{p.heading}</h2>
      {p.text ? <p className="muted" style={{ marginTop: 14, fontSize: 17 }}>{p.text}</p> : null}
      {checks.length ? <ul className={`checks ${checks.length < 5 ? 'one' : ''}`}>{checks.map(item => <li key={item}>{item}</li>)}</ul> : null}
      {p.buttonText ? <SmartLink to={p.buttonUrl} className="btn btn-navy">{p.buttonText}</SmartLink> : null}
    </div>
  );
  return (
    <section className={sectionClass(p)}>
      <div className="container split">
        {p.imagePosition === 'right' ? <>{copy}{photo}</> : <>{photo}{copy}</>}
      </div>
    </section>
  );
}

function Faq({ p }) {
  const items = [1, 2, 3, 4, 5, 6, 7, 8]
    .map(n => ({ q: p[`question${n}`], a: p[`answer${n}`] }))
    .filter(item => item.q && item.a);
  if (!items.length) return null;
  return (
    <section className={sectionClass(p)}>
      <div className="container" style={{ maxWidth: 820 }}>
        <SectionHead p={p}/>
        {items.map((item, i) => <details key={i} open={i === 0}><summary>{item.q}</summary><p>{item.a}</p></details>)}
      </div>
    </section>
  );
}

function ContactPanel({ p, services, settings }) {
  const phone = settings?.phone || '1-800-555-0123';
  return (
    <section className={sectionClass(p)}>
      <div className="container with-side contact-layout">
        <ContactForm services={services} title={p.formTitle || 'Contact Sunwings'} text={p.formText || 'Send us a message and we’ll get back to you.'}/>
        <aside className="side">
          <div className="side-card"><h3>{p.callTitle || 'Call or text'}</h3><a className="btn btn-accent" style={{ width: '100%' }} href={telHref(phone)}>{phone}</a></div>
          {p.hours ? <div className="side-card"><h3>{p.hoursTitle || 'Hours'}</h3><p className="muted" style={{ whiteSpace: 'pre-line' }}>{p.hours}</p></div> : null}
          <div className="side-card"><h3>{p.areaTitle || 'Service area'}</h3><p className="muted">{p.areaText || 'Toronto, the GTA, Halton, Hamilton & Niagara'}</p><Link className="more" href="/locations">See all areas →</Link></div>
        </aside>
      </div>
    </section>
  );
}

function RichText({ p }) {
  const body = String(p.body || p.text || '');
  const isHtml = /<\/?[a-z][\s\S]*>/i.test(body);
  return (
    <section className={sectionClass(p)}>
      <div className="container prose" style={{ maxWidth: Number(p.maxWidth || 820) }}>
        {p.heading ? <h2>{p.heading}</h2> : null}
        {isHtml
          ? <div dangerouslySetInnerHTML={{ __html: body }}/>
          : body.split(/\n\s*\n/).filter(Boolean).map((para, i) => <p key={i}>{para}</p>)}
      </div>
    </section>
  );
}

export default function PageBlocks({ data, pageId, services = [], locations = [], settings = {}, posts }) {
  const blocks = Array.isArray(data?.content) ? data.content : [];
  const firstHeroIndex = blocks.findIndex(b => b?.type === 'SunwingsHeroBlock' || b?.type === 'HeroBlock');

  return blocks.map((block, index) => {
    const p = block?.props || {};
    const key = p.id || `${block?.type || 'block'}-${index}`;
    const isHomeHero = pageId === 'home' && index === firstHeroIndex;

    switch (block?.type) {
      case 'SunwingsHeroBlock':
        return <Hero key={key} p={p} home={isHomeHero} settings={settings}/>;

      case 'HeroBlock':
        return <Hero key={key} home={isHomeHero} settings={settings} p={{
          ...p,
          primaryButtonText: p.primaryButtonText || p.buttonText,
          primaryButtonUrl: p.primaryButtonUrl || p.buttonUrl,
        }}/>;

      case 'SunwingsTrustBlock':
        return <TrustStrip key={key} {...p}/>;

      case 'SunwingsServicesGridBlock': {
        const limit = Number(p.limit || 0);
        const list = limit > 0 ? services.slice(0, limit) : services;
        return (
          <section className={sectionClass(p)} key={key}>
            <div className="container">
              <SectionHead p={p} center={p.align !== 'left'}/>
              {list.length ? <ServiceCards services={list}/> : <div className="empty-state">Service Posts will appear here when published.</div>}
              {p.buttonText ? <div style={{ marginTop: 22 }}><SmartLink to={p.buttonUrl || '/services'} className="more">{p.buttonText}</SmartLink></div> : null}
            </div>
          </section>
        );
      }

      case 'SunwingsStepsBlock':
        return (
          <section className={sectionClass(p, 'soft')} key={key}>
            <div className="container">
              <SectionHead p={p} center/>
              <HowItWorks {...p}/>
            </div>
          </section>
        );

      case 'SunwingsPricingCardsBlock':
        return <PricingCards key={key} p={p}/>;

      case 'SunwingsPricingFactorsBlock':
        return <PricingFactors key={key} p={p}/>;

      case 'SunwingsPriceBandBlock':
        return <PriceBand key={key} p={p}/>;

      case 'SunwingsSplitFeatureBlock':
        return <SplitFeature key={key} p={p}/>;

      case 'SunwingsLocationsGridBlock':
        return (
          <section className={sectionClass(p)} key={key}>
            <div className="container">
              <SectionHead p={p}/>
              {locations.length ? <ServiceAreaGrid locations={locations} detailed={Boolean(p.detailed)}/> : <div className="empty-state">Location Posts will appear here when published.</div>}
              {p.buttonText ? <div style={{ marginTop: 22 }}><SmartLink to={p.buttonUrl || '/locations'} className="more">{p.buttonText}</SmartLink></div> : null}
            </div>
          </section>
        );

      case 'SunwingsReviewsBlock': {
        const hasReviews = [1,2,3].some(n => String(p[`review${n}Text`] || '').trim());
        if (!hasReviews) return null;
        return (
          <section className={sectionClass(p, 'soft')} key={key}>
            <div className="container">
              <SectionHead p={p} center/>
              <ReviewsBlock {...p}/>
            </div>
          </section>
        );
      }

      case 'SunwingsBlogGridBlock': {
        const limit = Number(p.limit || 3);
        const list = Array.isArray(posts) ? posts.slice(0, limit) : [];
        if (!list.length && pageId === 'home') return null;
        const showCategories = p.showCategories === true || p.showCategories === 'true' || pageId === 'blog';
        return (
          <section className={sectionClass(p)} key={key}>
            <div className="container">
              <SectionHead p={p}/>
              {showCategories
                ? <BlogArchive posts={Array.isArray(posts) ? posts : []}/>
                : list.length
                  ? <BlogCards posts={list}/>
                  : <div className="empty-state">No published Moving Tips yet.</div>}
            </div>
          </section>
        );
      }

      case 'SunwingsFaqBlock':
        return <Faq key={key} p={p}/>;

      case 'SunwingsContactBlock':
        return <ContactPanel key={key} p={p} services={services} settings={settings}/>;

      case 'SunwingsQuoteFormBlock':
        return (
          <section className={sectionClass(p, 'soft')} key={key}>
            <div className="container split">
              <div>
                {p.eyebrow ? <span className="kicker">{p.eyebrow}</span> : null}
                <h2>{p.heading}</h2>
                {p.text ? <p className="muted" style={{ marginTop: 14, fontSize: 17 }}>{p.text}</p> : null}
                {p.buttonText ? <div style={{ marginTop: 24 }}><SmartLink to={p.buttonUrl || '/contact'}>{p.buttonText}</SmartLink></div> : null}
              </div>
              <QuoteForm services={services} compact={p.compact !== false && p.compact !== 'false'} replyHours={settings?.quote_reply_hours}/>
            </div>
          </section>
        );

      case 'SunwingsRichTextBlock':
        return <RichText key={key} p={p}/>;

      case 'HeadingBlock': {
        const Tag = ['h1', 'h2', 'h3', 'h4'].includes(p.level) ? p.level : 'h2';
        return <section className="section" key={key}><div className="container" style={{ textAlign: p.align || 'left' }}><Tag>{p.text}</Tag></div></section>;
      }

      case 'TextBlock':
        return <RichText key={key} p={{ body: p.text, background: p.background }}/>;

      case 'ImageBlock':
        return (
          <section className="section" key={key}>
            <div className="container">
              {p.image ? <img src={p.image} alt={p.alt || ''} style={{ width: `${p.width || 100}%`, marginInline: 'auto', borderRadius: 18 }}/> : null}
            </div>
          </section>
        );

      case 'ImageTextBlock':
        return <SplitFeature key={key} p={p}/>;

      case 'CtaBlock':
        return (
          <section className="section" key={key}>
            <div className="container inline-cta">
              <div><h2>{p.heading}</h2>{p.text ? <p>{p.text}</p> : null}</div>
              <SmartLink to={p.buttonUrl || '/contact'}>{p.buttonText}</SmartLink>
            </div>
          </section>
        );

      default:
        if (process.env.NODE_ENV !== 'production') {
          return <div key={key} className="container empty-state">Unknown block type: {String(block?.type)}</div>;
        }
        return null;
    }
  });
}
