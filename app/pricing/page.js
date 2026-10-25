import Link from 'next/link';
import PageHero from '@/components/PageHero';
import PageBlocks from '@/components/PageBlocks';
import ServicePricing from '@/components/ServicePricing';
import { getPageBuilderData, getServices, getSiteSettings, pageMetadataFromBuilder } from '@/lib/content';
import { servicePricing } from '@/lib/servicePricing';

// Jump links so each service's prices can be linked to and promoted on their own.
function PricingNav({ services }) {
  return (
    <nav className="pricing-nav container" id="pricing-moving" aria-label="Pricing by service">
      <span className="kicker">Pricing by service</span>
      <div className="chips">
        <a className="chip" href="#pricing-moving">Moving &amp; Delivery</a>
        {services.map(item => <a className="chip" href={`#${item.slug}`} key={item.slug}>{item.label}</a>)}
      </div>
    </nav>
  );
}

function ServicePricingSections({ services }) {
  return services.map((item, index) => (
    <ServicePricing key={item.slug} slug={item.slug} pricing={item} serviceTitle={item.title} soft={index % 2 === 0}/>
  ));
}

async function pricedServices() {
  const services = await getServices();
  return Object.entries(servicePricing).map(([slug, pricing]) => ({
    ...pricing,
    slug,
    title: services.find(service => service.slug === slug)?.title || pricing.label,
  }));
}

export async function generateMetadata() {
  const pageData = await getPageBuilderData('pricing');
  return pageMetadataFromBuilder(pageData, {
    title:'Pricing',
    description:'Sunwings Transport pricing for moving, delivery, commercial transport and residential snow removal from $175/month.',
    canonical:'/pricing',
  });
}

export default async function PricingPage() {
  const [settings, pageData, priced] = await Promise.all([getSiteSettings(), getPageBuilderData('pricing'), pricedServices()]);
  if (pageData) {
    return <PageBlocks data={pageData} pageId="pricing" settings={settings} insertAfter={{
      SunwingsHeroBlock: <PricingNav services={priced}/>,
      SunwingsPricingCardsBlock: <ServicePricingSections services={priced}/>,
    }}/>;
  }
  return (
    <>
      <PageHero
        crumbs={[{label:'Home',href:'/'},{label:'Pricing'}]}
        title="Straight answers on price"
        description="Upfront quotes based on crew size, truck time and distance, backed by our price-match guarantee."
        image="https://sunwingstransport.ca/wp-content/uploads/2026/02/van-loading-file-cabinet.jpg"
        phone={settings.phone}
      />

      <PricingNav services={priced}/>

      <section className="section">
        <div className="container">
          <div className="grid-3">
            <div className="price-card">
              <h3>Small moves &amp; delivery</h3>
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
              <ul><li>2 movers</li><li>Truck &amp; equipment</li><li>Wrapping &amp; protection</li><li>Disassembly &amp; reassembly</li></ul>
              <Link className="btn btn-accent" href="/contact">Get a quote</Link>
            </div>
            <div className="price-card">
              <h3>Truck + larger crew</h3>
              <p className="muted">Houses &amp; larger moves</p>
              <div className="amt">Quote</div>
              <small className="muted">based on crew and time</small>
              <ul><li>Larger crew</li><li>Truck &amp; equipment</li><li>Wrapping &amp; protection</li><li>Built for bigger jobs</li></ul>
              <Link className="btn btn-line" href="/contact">Get a quote</Link>
            </div>
          </div>
        </div>
      </section>

      <ServicePricingSections services={priced}/>

      <section className="section section-soft">
        <div className="container split">
          <div>
            <span className="kicker">What affects your price</span>
            <h2>No surprises on the bill.</h2>
            <ul className="checks one">
              <li>Crew size and hours on the job</li>
              <li>Distance between pickup and drop-off</li>
              <li>Stairs, long carries and elevator wait times</li>
              <li>Packing, wrapping and specialty items</li>
            </ul>
          </div>
          <div className="price-band" style={{gridTemplateColumns:'1fr'}}>
            <div>
              <span className="kicker" style={{color:'var(--accent-2)'}}>Price-match guarantee</span>
              <h2 style={{fontSize:30}}>Found a lower written quote?</h2>
              <p>Show us a lower written quote for the same job and we’ll match it.</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
