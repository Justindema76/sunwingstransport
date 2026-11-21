import Link from 'next/link';
import { notFound } from 'next/navigation';
import PageHero from '@/components/PageHero';
import ServicePricing from '@/components/ServicePricing';
import TrustStrip from '@/components/TrustStrip';
import { HnQuoteBand } from '@/components/HnPricing';
import { priceBadge } from '@/components/heroSlides';
import { getBaseUrl, getSiteSettings } from '@/lib/content';
import { HN, HN_TRUST, hnSnowHref, hnTownHref } from '@/lib/hamiltonNiagara';
import { getHnSnow } from '@/lib/hnSnow';

// Snow removal for one Hamilton & Niagara town, e.g. /hamilton-niagara/snow-removal/grimsby.

export async function generateStaticParams() {
  return (await getHnSnow()).towns.map(town => ({ town: town.slug }));
}

async function load(slug) {
  const snow = await getHnSnow();
  const town = snow.towns.find(item => item.slug === slug);
  return town ? { ...snow, town } : null;
}

export async function generateMetadata({ params }) {
  const { town: slug } = await params;
  const data = await load(slug);
  if (!data) return {};
  const { town, service } = data;
  const url = `${getBaseUrl()}${hnSnowHref(town)}`;
  const title = `Snow Removal in ${town.title} | Seasonal Plans | Sunwings`;
  const description = `Seasonal snow removal in ${town.title}: driveways, walkways and front steps cleared after every 5 cm snowfall. Plans from $175/month. Get a quote for your property.`;
  const images = service?.banner_image ? [{ url: service.banner_image, alt: `Snow removal in ${town.title}` }] : [];
  return { title: { absolute: title }, description, alternates: { canonical: url }, openGraph: { type: 'website', url, title, description, siteName: 'Sunwings Transport', locale: 'en_CA', images } };
}

export default async function HnSnowTownPage({ params }) {
  const { town: slug } = await params;
  const [data, settings] = await Promise.all([load(slug), getSiteSettings()]);
  if (!data) notFound();
  const { town, towns, service, pricing, copy } = data;
  const preset = service?.title || 'Snow Removal';
  const bullets = (copy.bullets || []).filter(Boolean);
  const faqs = (copy.faqs || []).filter(item => item?.question && item?.answer);
  const neighbourhoods = Array.isArray(town.neighbourhoods) ? town.neighbourhoods : [];
  const others = towns.filter(item => item.slug !== town.slug);
  return (
    <>
      <PageHero
        placement="hamilton-niagara-snow-removal"
        crumbs={[{ label: 'Hamilton & Niagara', href: HN }, { label: 'Snow Removal', href: `${HN}/snow-removal` }, { label: town.title }]}
        eyebrow={`Snow removal · ${town.title}`}
        title={`Snow Removal in ${town.title}`}
        description={`Driveways, walkways and front steps in ${town.title} cleared after every 5 cm snowfall. One price for the season, confirmed before you book.`}
        image={copy.image || service?.banner_image}
        imageAlt={`Snow removal in ${town.title}`}
        phone={settings.phone}
        badge={priceBadge(pricing)}
        preset={preset}
      />
      <TrustStrip items={HN_TRUST}/>

      <ServicePricing slug="snow-removal" anchor="plans" pricing={pricing} serviceTitle={preset}/>

      <section className="section section-soft">
        <div className="container prose hn-prose" style={{ maxWidth: 900 }}>
          {bullets.length ? <>
            <h2>What’s included in {town.title}</h2>
            <ul className="checks">{bullets.map(item => <li key={item}>{item}</li>)}</ul>
          </> : null}
          {neighbourhoods.length ? <>
            <h2>Areas we clear in {town.title}</h2>
            <div className="chips">{neighbourhoods.map(item => <span className="chip" key={item}>{item}</span>)}</div>
          </> : null}
          {faqs.length ? <>
            <h2>Snow removal questions</h2>
            <div className="service-faqs">
              {faqs.map(item => <details key={item.question}><summary>{item.question}</summary><p>{item.answer}</p></details>)}
            </div>
          </> : null}
          {others.length ? <>
            <h2>Snow removal in other towns</h2>
            <div className="chips">{others.map(item => <Link className="chip" key={item.slug} href={hnSnowHref(item)}>{item.title}</Link>)}</div>
          </> : null}
          <p style={{ marginTop: 24 }}><Link href={hnTownHref(town)}>Moving and delivery in {town.title} →</Link></p>
        </div>
      </section>

      <HnQuoteBand phone={settings.phone} preset={preset} heading={`Snow removal in ${town.title}? Get your price.`} text="Send your address and a photo of the driveway. We confirm the price and your spot on the route."/>
    </>
  );
}
