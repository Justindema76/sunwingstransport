import PageHero from '@/components/PageHero';
import HnPricing from '@/components/HnPricing';
import { PricingContent } from '@/app/pricing/page';
import { getPageBuilderData, getSiteSettings } from '@/lib/content';
import { HN, getHnContent, hnMetadata } from '@/lib/hamiltonNiagara';
import { HERO_IMAGE_OPTIONS } from '@/lib/contentDefaults';

export function generateMetadata() {
  return hnMetadata('pricing', `${HN}/pricing`);
}

// Hamilton & Niagara prices (Admin › Hamilton & Niagara › Pricing, saved in hn_content.pricing).
// A page built for "hn-pricing" in the visual editor still replaces it.
export default async function HnPricingPage() {
  const [ownPage, settings, content] = await Promise.all([getPageBuilderData('hn-pricing'), getSiteSettings(), getHnContent()]);
  if (ownPage) return <PricingContent area="hn" pageId="hn-pricing" home={HN}/>;
  const { pricing } = content;
  return (
    <>
      <PageHero
        placement="hamilton-niagara-pricing"
        crumbs={[{ label: 'Hamilton & Niagara', href: HN }, { label: 'Pricing' }]}
        eyebrow="Upfront pricing"
        title={pricing.heading}
        accent={pricing.accent}
        description={pricing.text}
        image={pricing.image || content.home.image}
        fallbackImage={HERO_IMAGE_OPTIONS.truck}
        imageAlt="Sunwings Transport moving van"
        phone={settings.phone}
      />
      <HnPricing pricing={pricing} phone={settings.phone}/>
    </>
  );
}
