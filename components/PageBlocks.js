import Link from 'next/link';
import BlogCards from './BlogCards';
import HowItWorks from './HowItWorks';
import QuoteForm from './QuoteForm';
import ReviewsBlock from './ReviewsBlock';
import ServiceAreaGrid from './ServiceAreaGrid';
import ServiceCards from './ServiceCards';
import TrustStrip from './TrustStrip';

function button(text, url, className = 'btn btn-accent') {
  if (!text) return null;
  if (String(url || '').startsWith('http') || String(url || '').startsWith('tel:') || String(url || '').startsWith('mailto:')) {
    return <a className={className} href={url || '#'}>{text}</a>;
  }
  return <Link className={className} href={url || '#'}>{text}</Link>;
}

function Hero({ props, home = false }) {
  const style = props.image ? { backgroundImage: `linear-gradient(100deg,rgba(11,37,69,.94),rgba(19,49,92,.82)),url("${props.image}")` } : undefined;

  if (home) {
    return <section className="hero" style={style}>
      <div className="container">
        <div className="hero-inner">
          {props.eyebrow ? <div className="hero-tag">{props.eyebrow}</div> : null}
          <h1>{props.heading}{props.accent ? <> <em>{props.accent}</em></> : null}</h1>
          {props.text ? <p className="lead">{props.text}</p> : null}
          <div className="hero-ctas">
            {button(props.primaryButtonText, props.primaryButtonUrl)}
            {button(props.secondaryButtonText, props.secondaryButtonUrl, 'btn btn-ghost')}
          </div>
        </div>
      </div>
      <svg className="wave" viewBox="0 0 1440 70" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0 40c240-40 480-40 720 0s480 40 720 0v30H0z" fill="#fff"/>
      </svg>
    </section>;
  }

  return <section className="page-hero" style={style}>
    <div className="container">
      {props.eyebrow ? <span className="kicker" style={{color:'var(--accent-2)'}}>{props.eyebrow}</span> : null}
      <h1>{props.heading}{props.accent ? <> <span style={{color:'var(--accent-2)'}}> {props.accent}</span></> : null}</h1>
      {props.text ? <p>{props.text}</p> : null}
      {(props.primaryButtonText || props.secondaryButtonText) ? <div className="hero-ctas">
        {button(props.primaryButtonText, props.primaryButtonUrl)}
        {button(props.secondaryButtonText, props.secondaryButtonUrl, 'btn btn-ghost')}
      </div> : null}
    </div>
  </section>;
}

function PricingBlock({ props }) {
  return <section className="section">
    <div className="container">
      <div className="section-head">
        {props.eyebrow ? <span className="kicker">{props.eyebrow}</span> : null}
        <h2>{props.heading}</h2>
        {props.text ? <p>{props.text}</p> : null}
      </div>
      <div className="grid-3">
        <div className="price-card">
          <h3>Small moves & delivery</h3>
          <p className="muted">Single items, Marketplace pickups, studios</p>
          <div className="amt">Quote</div>
          <small className="muted">based on the job</small>
          <ul><li>1–2 movers</li><li>Cargo van</li><li>Blanket wrapping</li><li>Placement in room</li></ul>
          <Link className="btn btn-line" href="/contact">Get a quote</Link>
        </div>
        <div className="price-card pop">
          <h3>Truck + 2 movers</h3>
          <p className="muted">Most 1–2 bedroom moves</p>
          <div className="amt">Quote</div>
          <small className="muted">upfront pricing</small>
          <ul><li>2 movers</li><li>Truck & equipment</li><li>Wrapping & protection</li><li>Disassembly & reassembly</li></ul>
          <Link className="btn btn-accent" href="/contact">Get a quote</Link>
        </div>
        <div className="price-card">
          <h3>Larger moves</h3>
          <p className="muted">Houses, commercial and larger jobs</p>
          <div className="amt">Quote</div>
          <small className="muted">based on crew and time</small>
          <ul><li>Larger crew</li><li>Truck & equipment</li><li>Wrapping & protection</li><li>Built for bigger jobs</li></ul>
          <Link className="btn btn-line" href="/contact">Get a quote</Link>
        </div>
      </div>
    </div>
  </section>;
}

export default function PageBlocks({ data, pageId, services = [], locations = [], settings = {} }) {
  const blocks = Array.isArray(data?.content) ? data.content : [];

  return blocks.map((block, index) => {
    const p = block?.props || {};
    const key = p.id || `${block?.type || 'block'}-${index}`;

    switch (block?.type) {
      case 'SunwingsHeroBlock':
        return <Hero key={key} props={p} home={pageId === 'home' && index === 0}/>;

      case 'SunwingsTrustBlock':
        return <TrustStrip key={key}/>;

      case 'SunwingsServicesGridBlock':
        return <section className="section" key={key}><div className="container">
          <div className="section-head center">
            {p.eyebrow ? <span className="kicker">{p.eyebrow}</span> : null}
            <h2>{p.heading}</h2>
            {p.text ? <p>{p.text}</p> : null}
          </div>
          <ServiceCards services={services}/>
        </div></section>;

      case 'SunwingsStepsBlock':
        return <section className="section section-soft" key={key}><div className="container">
          <div className="section-head center">
            {p.eyebrow ? <span className="kicker">{p.eyebrow}</span> : null}
            <h2>{p.heading}</h2>
          </div>
          <HowItWorks/>
        </div></section>;

      case 'SunwingsPricingCardsBlock':
        return <PricingBlock key={key} props={p}/>;

      case 'SunwingsLocationsGridBlock':
        return <section className="section" key={key}><div className="container">
          <div className="section-head">
            {p.eyebrow ? <span className="kicker">{p.eyebrow}</span> : null}
            <h2>{p.heading}</h2>
            {p.text ? <p>{p.text}</p> : null}
          </div>
          <ServiceAreaGrid locations={locations} detailed={Boolean(p.detailed)}/>
        </div></section>;

      case 'SunwingsReviewsBlock':
        return <section className="section section-soft" key={key}><div className="container">
          <div className="section-head center">
            {p.eyebrow ? <span className="kicker">{p.eyebrow}</span> : null}
            <h2>{p.heading}</h2>
          </div>
          <ReviewsBlock/>
        </div></section>;

      case 'SunwingsBlogGridBlock':
        return <section className="section" key={key}><div className="container">
          <div className="section-head">
            {p.eyebrow ? <span className="kicker">{p.eyebrow}</span> : null}
            <h2>{p.heading}</h2>
          </div>
          <BlogCards/>
        </div></section>;

      case 'SunwingsQuoteFormBlock':
        return <section className="section section-soft" key={key}><div className="container split">
          <div>
            {p.eyebrow ? <span className="kicker">{p.eyebrow}</span> : null}
            <h2>{p.heading}</h2>
            {p.text ? <p className="muted" style={{marginTop:14,fontSize:17}}>{p.text}</p> : null}
          </div>
          <QuoteForm services={services}/>
        </div></section>;

      case 'HeroBlock':
        return <Hero key={key} props={{
          eyebrow:p.eyebrow,
          heading:p.heading,
          accent:p.accent,
          text:p.text,
          primaryButtonText:p.primaryButtonText || p.buttonText,
          primaryButtonUrl:p.primaryButtonUrl || p.buttonUrl,
          secondaryButtonText:p.secondaryButtonText,
          secondaryButtonUrl:p.secondaryButtonUrl,
          image:p.image,
        }} home={pageId === 'home' && index === 0}/>;

      case 'HeadingBlock': {
        const Tag = ['h1','h2','h3','h4'].includes(p.level) ? p.level : 'h2';
        return <section className="section" key={key}><div className="container" style={{textAlign:p.align || 'left'}}><Tag>{p.text}</Tag></div></section>;
      }

      case 'TextBlock':
        return <section className="section" key={key}><div className="container prose" style={{textAlign:p.align || 'left'}}><p>{p.text}</p></div></section>;

      case 'ImageBlock':
        return <section className="section" key={key}><div className="container">
          {p.image ? <img src={p.image} alt={p.alt || ''} style={{width:`${p.width || 100}%`,marginInline:'auto',borderRadius:18}}/> : null}
        </div></section>;

      case 'ImageTextBlock':
        return <section className={`section ${p.background === 'light' ? 'section-soft' : ''}`} key={key}><div className={`container split ${p.imagePosition === 'right' ? 'image-right' : ''}`}>
          {p.image ? <div className="photo ph" style={{backgroundImage:`url("${p.image}")`}} role="img" aria-label={p.alt || ''}/> : <div className="photo ph"/>}
          <div><h2>{p.heading}</h2><p className="muted" style={{marginTop:14,fontSize:17}}>{p.text}</p></div>
        </div></section>;

      case 'CtaBlock':
        return <section className="section" key={key}><div className="container inline-cta">
          <div><h2>{p.heading}</h2><p>{p.text}</p></div>
          {button(p.buttonText, p.buttonUrl)}
        </div></section>;

      default:
        return null;
    }
  });
}
