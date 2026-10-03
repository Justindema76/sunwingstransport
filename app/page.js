import Link from 'next/link';
import BlogCards from '@/components/BlogCards';
import HomeHero from '@/components/HomeHero';
import PageBlocks from '@/components/PageBlocks';
import HowItWorks from '@/components/HowItWorks';
import ReviewsBlock from '@/components/ReviewsBlock';
import ServiceAreaGrid from '@/components/ServiceAreaGrid';
import ServiceCards from '@/components/ServiceCards';
import TrustStrip from '@/components/TrustStrip';
import { getLocations, getPageBuilderData, getServices, getSiteSettings } from '@/lib/content';

export default async function HomePage() {
  const [settings, services, locations, pageData] = await Promise.all([
    getSiteSettings(),
    getServices(),
    getLocations(),
    getPageBuilderData('home'),
  ]);

  if (pageData) {
    return <PageBlocks data={pageData} pageId="home" services={services} locations={locations} settings={settings}/>;
  }

  return (
    <>
      <HomeHero settings={settings}/>
      <TrustStrip/>

      <section className="section">
        <div className="container">
          <div className="section-head center">
            <span className="kicker">What we do</span>
            <h2>One call for every move.</h2>
            <p>From a single couch to a full warehouse transfer, Sunwings brings the truck, the crew and the care.</p>
          </div>
          {services.length ? <ServiceCards services={services}/> : <div className="empty-state">Service Posts will appear here when published.</div>}
        </div>
      </section>

      <section className="section section-soft">
        <div className="container">
          <div className="section-head center">
            <span className="kicker">How it works</span>
            <h2>Booked in three steps.</h2>
          </div>
          <HowItWorks/>
        </div>
      </section>

      <section className="section">
        <div className="container split">
          <div
            className="photo ph"
            style={{backgroundImage:'url("https://sunwingstransport.ca/wp-content/uploads/2026/02/van-loading-file-cabinet.jpg")'}}
          />
          <div>
            <span className="kicker">For businesses</span>
            <h2>A transport partner you can schedule on.</h2>
            <p className="muted" style={{marginTop:14,fontSize:17}}>Retailers, warehouses, contractors and property managers use Sunwings for one-off projects and recurring routes.</p>
            <ul className="checks">
              <li>Warehouse transfers</li>
              <li>Container unloading</li>
              <li>Retail deliveries</li>
              <li>Office relocations</li>
              <li>Equipment transport</li>
              <li>Recurring routes</li>
            </ul>
            <Link className="btn btn-navy" href="/services/commercial-transport">Commercial transport →</Link>
          </div>
        </div>
      </section>

      <section className="section" style={{paddingTop:0}}>
        <div className="container">
          <div className="price-band">
            <div>
              <span className="kicker" style={{color:'var(--accent-2)'}}>Pricing</span>
              <h2>Straight answers on price.</h2>
              <p>Every quote is based on crew size, truck time and distance. Found a lower written quote? We’ll match it.</p>
              <Link className="btn btn-accent" href="/pricing" style={{marginTop:24}}>See pricing →</Link>
            </div>
            <div className="pcs">
              <div className="pc"><span>Small moves &amp; deliveries</span><b>Get a quote</b><small>single items, studios</small></div>
              <div className="pc"><span>Truck + crew</span><b>Upfront pricing</b><small>based on your job</small></div>
            </div>
          </div>
        </div>
      </section>

      <section className="section" style={{paddingTop:0}}>
        <div className="container">
          <div className="section-head">
            <span className="kicker">Service areas</span>
            <h2>From Toronto to Niagara.</h2>
            <p>Local crews who know the buildings, the highways and the condo elevator rules.</p>
          </div>
          {locations.length ? <ServiceAreaGrid locations={locations}/> : <div className="empty-state">Location Posts will appear here when published.</div>}
          <div style={{marginTop:22}}><Link className="more" href="/locations">View all service areas →</Link></div>
        </div>
      </section>

      <section className="section section-soft">
        <div className="container">
          <div className="section-head center"><span className="kicker">Reviews</span><h2>What customers say.</h2></div>
          <ReviewsBlock/>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head"><span className="kicker">Moving tips</span><h2>From the Sunwings blog.</h2></div>
          <BlogCards/>
        </div>
      </section>
    </>
  );
}
