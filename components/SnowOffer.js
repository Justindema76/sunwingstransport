import OfferPopup from './OfferPopup';
import { featuredPrice, getSiteContent } from '@/lib/siteContent';

// Slide-up promo card on every page, edited in Admin › Promotions & Banners › Pop-up.
// Blank price / tab label / photo fall back to the chosen service's plan and photo.
export default async function SnowOffer({ services = [] }) {
  const { popup, pricing } = await getSiteContent();
  if (popup.enabled === false) return null;
  const service = services.find(item => item.slug === popup.serviceSlug);
  if (!service) return null;
  const price = popup.price || featuredPrice(pricing[popup.serviceSlug]);
  return (
    <OfferPopup
      image={popup.image || service.banner_image}
      eyebrow={popup.eyebrow}
      heading={popup.heading}
      price={price}
      text={popup.text}
      primary={popup.primary}
      preset={service.title}
      plan={popup.plan}
      secondary={popup.secondary}
      secondaryHref={popup.secondaryHref || `/services/${service.slug}`}
      tabLabel={popup.tabLabel || `${service.title}${price ? ` ${price}` : ''}`}
    />
  );
}
