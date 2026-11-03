import OfferPopup from './OfferPopup';
import { getServicePricing } from '@/lib/servicePricing';

// The seasonal snow removal deal, shown on every page as a slide-up card.
export default function SnowOffer({ services = [] }) {
  const pricing = getServicePricing('snow-removal');
  const service = services.find(item => item.slug === 'snow-removal');
  const plan = pricing?.cards.find(card => card.featured);
  if (!service || !plan) return null;
  return (
    <OfferPopup
      image={service.banner_image}
      eyebrow="Winter 2026–27 · Limited spots"
      heading="Never shovel again."
      price={`${plan.prefix ? `${plan.prefix} ` : ''}${plan.amount}${plan.unit || ''}`}
      text="Driveway, walkways and front steps cleared after every 5 cm snowfall, all season long. Now booking in Markham, Stouffville & Toronto."
      primary="Book your spot"
      preset={service.title}
      plan={plan.title}
      secondary="See snow removal plans"
      secondaryHref={`/services/${service.slug}`}
      tabLabel={`Snow removal from ${plan.amount}${plan.unit || ''}`}
    />
  );
}
