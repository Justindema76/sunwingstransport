import Link from 'next/link';
import PageHero from '@/components/PageHero';
import ServicePricing from '@/components/ServicePricing';
import TrustStrip from '@/components/TrustStrip';
import { HnQuoteBand } from '@/components/HnPricing';
import { priceBadge } from '@/components/heroSlides';
import { photoSettings } from '@/components/heroSlides';
import { getSiteSettings } from '@/lib/content';
import { HN, HN_REGIONS, HN_TRUST, hnMetadata, hnSnowHref } from '@/lib/hamiltonNiagara';
import { getHnSnow } from '@/lib/hnSnow';

// Hamilton & Niagara snow removal: same plans and prices as the main site, the section's own
// text and towns. Text is edited in Admin › Hamilton & Niagara (hn_content["snow-removal"]).

export async function generateMetadata() {
  const { service } = await getHnSnow();
  return hnMetadata('snow-removal', `${HN}/snow-removal`, service?.banner_image || '');
}

export default async function HnSnowPage() {
  const [{ service, towns, pricing, copy }, settings] = await Promise.all([getHnSnow(), getSiteSettings()]);
  const preset = service?.title || 'Snow Removal';
  const bullets = (copy.bullets || []).filter(Boolean);
  const faqs = (copy.faqs || []).filter(item => item?.question && item?.answer);
  return (
    <>
      <PageHero
        placement="hamilton-niagara-snow-removal"
        crumbs={[{ label: 'Hamilton & Niagara', href: HN }, { label: 'Snow Removal' }]}
        eyebrow={copy.eyebrow}
        title={copy.heading}
        accent={copy.accent}
        description={copy.text}
        image={copy.image || service?.banner_image}
        imagePosition={photoSettings(copy)}
        imageAlt={service?.banner_alt || 'Snow removal'}
        phone={settings.phone}
        badge={priceBadge(pricing)}
        preset={preset}
      />
      <TrustStrip items={HN_TRUST}/>

      <ServicePricing slug="snow-removal" anchor="plans" pricing={pricing} serviceTitle={preset}/>

      <section className="section section-soft">
        <div className="container prose hn-prose" style={{ maxWidth: 900 }}>
          {copy.intro ? <p className="lead-p">{copy.intro}</p> : null}
          {bullets.length ? <>
            <h2>What’s included</h2>
            <ul className="checks">{bullets.map(item => <li key={item}>{item}</li>)}</ul>
          </> : null}
          <h2>Towns we clear</h2>
          {HN_REGIONS.map(region => {
            const list = towns.filter(town => town.region === region.key);
            return list.length ? <div key={region.key} style={{ marginBottom: 14 }}>
              <b>{region.title}</b>
              <div className="chips" style={{ marginTop: 8 }}>{list.map(town => <Link className="chip" key={town.slug} href={hnSnowHref(town)}>{town.title}</Link>)}</div>
            </div> : null;
          })}
          {faqs.length ? <>
            <h2>Snow removal questions</h2>
            <div className="service-faqs">
              {faqs.map(item => <details key={item.question}><summary>{item.question}</summary><p>{item.answer}</p></details>)}
            </div>
          </> : null}
        </div>
      </section>

      <HnQuoteBand phone={settings.phone} preset={preset} heading="Book your snow removal for the season." text="Send your address and a photo of the driveway. We confirm the price and your spot on the route."/>

      {faqs.length ? <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map(item => ({ '@type': 'Question', name: item.question, acceptedAnswer: { '@type': 'Answer', text: item.answer } })),
      }) }}/> : null}
    </>
  );
}
