import { PricingContent } from '@/app/pricing/page';
import { HN, hnMetadata } from '@/lib/hamiltonNiagara';

export function generateMetadata() {
  return hnMetadata('pricing', `${HN}/pricing`);
}

export default function HnPricingPage() {
  return <PricingContent area="hn" pageId="hn-pricing" home={HN}/>;
}
