import Link from 'next/link';
import BreadcrumbSchema from '@/components/BreadcrumbSchema';
import PageHero from '@/components/PageHero';
import PhotoGallery from '@/components/PhotoGallery';
import QuoteDrawerTrigger from '@/components/QuoteDrawerTrigger';
import TrustStrip from '@/components/TrustStrip';
import { HERO_IMAGE_OPTIONS } from '@/lib/contentDefaults';
import { getBaseUrl, getSiteSettings, getServices } from '@/lib/content';
import { ROUTES, ROUTE_GROUPS, ROUTE_SERVICE, routeHref } from '@/lib/routes';

const TITLE = 'Long-Distance Movers Toronto, Hamilton & Niagara | Sunwings';
const DESCRIPTION = 'Long-distance and intercity moves between Toronto, Hamilton, Mississauga, St. Catharines and Niagara Falls. Carefully planned residential moves with tailored quotes, access planning and owner review.';
const PHOTO_ROOT = 'https://nowsajdmbpxvlvrhopjg.supabase.co/storage/v1/object/public/blog-images/sunwings/';
const movingPhotos = [
  { file: '1794157095452-IMG_9724.jpeg', alt: 'Moving vehicles and a loading ramp at a residential moving job', caption: 'Loading access planned around the home' },
  { file: '1794228549975-IMG_4836.jpeg', alt: 'Wrapped furniture loaded for transport', caption: 'Furniture prepared and protected for transport' },
  { file: '1794157095250-IMG_9732.jpeg', alt: 'Stacked moving totes beside a home entrance', caption: 'Household belongings ready for loading' },
];
const heroImage = `${PHOTO_ROOT}1794229390663-IMG_8141.jpeg`;
const imagePreview = (url, width, height) => `${url.replace('/object/public/', '/render/image/public/')}?width=${width}&height=${height}&resize=cover&quality=80`;
const faqs = [
  { question: 'What affects a long-distance moving quote?', answer: 'The route, full inventory, crew and vehicle requirements, loading and unloading time, stairs, elevators and carrying distances all affect the quote. Packing, furniture preparation and any additional stops must be agreed in advance.' },
  { question: 'Do you arrange the crew and vehicle?', answer: 'Sunwings reviews and coordinates the moving plan. Crew and vehicle arrangements, including any moving partner involved, are confirmed before booking and require owner approval.' },
  { question: 'Are packing and furniture assembly included?', answer: 'Only services listed in your written quote are included. Tell us about packing, wrapping, disassembly, reassembly and room placement when requesting your quote. Fragile, heavy and oversized items require advance review.' },
  { question: 'Can you guarantee a same-day delivery?', answer: 'Timing depends on the route, inventory, building access and crew availability. Share any elevator windows or fixed deadlines so we can confirm a realistic schedule before booking.' },
  { question: 'Does requesting a quote reserve my date?', answer: 'No. We first confirm the service scope, price and availability. Every quote and crew assignment requires owner approval. Your booking is secured only after the agreed deposit has been verified.' },
  { question: 'Can I request a destination that is not listed?', answer: 'Yes. Send both addresses, your date, inventory and access details. We will assess the route and confirm whether we can accommodate the move before offering a quote.' },
];

export const metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: '/long-distance' },
  openGraph: { type: 'website', url: '/long-distance', title: TITLE, description: DESCRIPTION, siteName: 'Sunwings Transport', locale: 'en_CA', images: [{ url: heroImage, alt: 'Dining and living furniture from a Sunwings residential job' }] },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION, images: [heroImage] },
};

export default async function LongDistancePage() {
  const [settings, services] = await Promise.all([getSiteSettings(), getServices()]);
  const movingService = ROUTE_SERVICE;
  const crumbs = [{ label: 'Home', href: '/' }, { label: 'Long Distance' }];
  return (
    <>
      <PageHero
        crumbs={crumbs}
        eyebrow="Premium residential & intercity moving"
        title="Long-distance"
        accent="moving."
        description="A carefully planned home move between Toronto, Hamilton, Mississauga and Niagara. Share your inventory, access and schedule so we can confirm the right crew, vehicle and tailored quote."
        image={imagePreview(heroImage, 1600, 900)}
        fallbackImage={HERO_IMAGE_OPTIONS.truck}
        imageAlt="Dining and living furniture from a Sunwings residential job"
        phone={settings.phone}
        preset={movingService}
      />

      <TrustStrip/>

      <section className="section" aria-labelledby="moving-work-heading">
        <div className="container">
          <div className="section-head">
            <span className="kicker">Our moving work</span>
            <h2 id="moving-work-heading">Real homes. Carefully prepared moves.</h2>
            <p>Photos from Sunwings residential moving jobs, showing loading access, protected furniture and household belongings. Your route, crew, vehicle and service scope are confirmed for your own move.</p>
          </div>
          <PhotoGallery photos={movingPhotos.map(photo => ({ thumb: imagePreview(`${PHOTO_ROOT}${photo.file}`, 640, 640), full: imagePreview(`${PHOTO_ROOT}${photo.file}`, 1600, 1600).replace('resize=cover', 'resize=contain'), alt: photo.alt, caption: photo.caption }))}/>
        </div>
      </section>

      <section className="section section-soft">
        <div className="container">
          <div className="section-head">
            <span className="kicker">Plan your move</span>
            <h2>More than the drive between two addresses.</h2>
            <p>Your furniture, building access and delivery schedule shape the moving plan. Sunwings reviews the details before confirming the service scope, crew, vehicle and price.</p>
          </div>
          <div className="grid-3">
            <div className="side-card"><h3>A plan for your home</h3><p>Tell us your home size, furniture inventory, box count and any fragile or oversized items. Packing, protection, dismantling, reassembly and room placement are confirmed in your quote.</p></div>
            <div className="side-card"><h3>Access at both ends</h3><p>Share stair flights, elevator windows, parking restrictions and carrying distances. Confirm building reservations before booking so loading and unloading can be coordinated.</p></div>
            <div className="side-card"><h3>Clear written scope</h3><p>We confirm included services, the moving window, price and any agreed extra charges before you book. Route and crew availability are subject to owner approval.</p></div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container prose" style={{maxWidth: 900}}>
          <span className="kicker">Your tailored quote</span>
          <h2>Send the details once. Plan with confidence.</h2>
          <ul>
            <li>Pickup and delivery addresses, moving date and preferred time.</li>
            <li>Home size, itemized furniture list, approximate box count and photos.</li>
            <li>Stairs, elevators, loading access, parking and carrying distances at both properties.</li>
            <li>Packing, furniture protection, disassembly, reassembly or placement you would like included.</li>
            <li>Any heavy or fragile items and fixed collection or delivery deadlines.</li>
          </ul>
          <p>Every quote and crew assignment requires owner approval. A request does not reserve your date. We confirm scope, price and availability first; your booking is secured only after the agreed deposit has been verified.</p>
          <QuoteDrawerTrigger className="btn btn-accent" preset={movingService}>Request my moving plan →</QuoteDrawerTrigger>
          <p>Preparing your inventory? Read our <Link href="/blog/moving-inventory-checklist-quote-gta">moving inventory checklist</Link> and <Link href="/blog/moving-truck-parking-loading-access-gta">parking and loading guide</Link>.</p>
          <p>For smaller jobs with your own loading help, explore <Link href="/services/client-assist-moving-delivery">Client Assist</Link>. For a full moving crew, see our <Link href="/services/residential-moving">premium residential moving service</Link>.</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <span className="kicker">Routes we move</span>
            <h2>Pick your move</h2>
            <p>Explore our intercity routes in both directions. For another destination, send your details so we can assess suitability and availability.</p>
          </div>
          <div className="grid-2 route-groups">
            {ROUTE_GROUPS.map(group => (
              <div className="side-card route-group" key={group.key}>
                <h3>{group.label}</h3>
                <p className="muted">{group.note}</p>
                <div className="side-links">
                  {ROUTES.filter(route => route.group === group.key).map(route => (
                    <Link href={routeHref(route)} key={route.slug}>{route.from} → {route.to} movers</Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="cta-inline" style={{ marginTop: 28 }}>
            <div>
              <h3>Moving somewhere else?</h3>
              <p>Send both addresses, your date, inventory and access details. We will review the route and confirm whether we can accommodate your move.</p>
            </div>
            <QuoteDrawerTrigger className="btn btn-accent" preset={movingService}>Request a tailored quote →</QuoteDrawerTrigger>
          </div>
        </div>
      </section>

      <section className="section section-soft">
        <div className="container prose" style={{ maxWidth: 900 }}>
          <span className="kicker">Before you book</span>
          <h2>Long-distance moving questions</h2>
          <div className="service-faqs">
            {faqs.map(item => <details key={item.question}><summary>{item.question}</summary><p>{item.answer}</p></details>)}
          </div>
          <QuoteDrawerTrigger className="btn btn-accent" preset={movingService}>Plan my move →</QuoteDrawerTrigger>
        </div>
      </section>

      <BreadcrumbSchema baseUrl={getBaseUrl()} items={crumbs}/>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map(item => ({ '@type': 'Question', name: item.question, acceptedAnswer: { '@type': 'Answer', text: item.answer } })),
      }) }}/>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: 'Long-distance moving routes',
        itemListElement: ROUTES.map((route, index) => ({ '@type': 'ListItem', position: index + 1, name: `${route.from} to ${route.to} movers`, url: `${getBaseUrl()}${routeHref(route)}` })),
      }) }}/>
    </>
  );
}
