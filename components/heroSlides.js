import Link from 'next/link';
import { Phone } from 'lucide-react';
import QuoteDrawerTrigger from './QuoteDrawerTrigger';
import { HERO_IMAGE_OPTIONS, RETIRED_HERO_IMAGES } from '@/lib/contentDefaults';
import { featuredPrice } from '@/lib/siteContent';
import { telHref } from '@/lib/phone';

// Shared banner content for every page: the homepage slider style (pill tag, headline
// with an orange second line, white subtitle, swirl at the bottom).

// Photos already uploaded to the site, used when a page has no photo of its own or its
// photo still points at the old WordPress site. A photo set in the admin always wins.
export const HERO_IMAGES = HERO_IMAGE_OPTIONS;
const ROTATION = [HERO_IMAGES.couple, HERO_IMAGES.truck, HERO_IMAGES.delivery, HERO_IMAGES.packing, HERO_IMAGES.warehouse];

// Picks a steady photo for a key (e.g. a location slug) so pages don't all look the same.
export function rotatingHeroImage(key = '') {
  const sum = [...String(key)].reduce((total, char) => total + char.charCodeAt(0), 0);
  return ROTATION[sum % ROTATION.length];
}

export function safeHeroImage(image, fallback = HERO_IMAGES.van) {
  const url = String(image || '').trim();
  if (RETIRED_HERO_IMAGES[url]) return RETIRED_HERO_IMAGES[url];
  return url && !/sunwingstransport\.ca\/wp-content\//.test(url) ? url : fallback;
}

// `position` is either a CSS background position for phones (older settings, e.g. '70% center')
// or the photo settings from the admin's position editor:
// { desktopPosition, desktopSize, mobilePosition, mobileSize } ("X% Y%" / "W% auto"; blank = default).
export function heroBackground(image, fallback, position = '') {
  const photo = typeof position === 'object' && position ? position : { mobilePosition: position };
  const url = safeHeroImage(image, fallback);
  return {
    backgroundImage: `linear-gradient(90deg,rgba(11,37,69,.88) 0%,rgba(11,37,69,.7) 38%,rgba(11,37,69,.2) 75%,rgba(11,37,69,.05) 100%),url("${url}")`,
    backgroundSize: photo.desktopSize ? `auto, ${photo.desktopSize}` : 'cover',
    backgroundPosition: photo.desktopPosition ? `center, ${photo.desktopPosition}` : 'center',
    backgroundRepeat: 'no-repeat',
    // Phones show the photo on its own (no dark wash) above the text; see globals.css.
    '--hero-photo': `url("${url}")`,
    ...(photo.mobilePosition ? { '--hero-mobile-position': photo.mobilePosition } : {}),
    ...(photo.mobileSize ? { '--hero-mobile-size': photo.mobileSize } : {}),
  };
}

// The photo settings saved with a slide or banner.
export const photoSettings = (item = {}) => ({
  desktopPosition: item.desktopPosition || '',
  desktopSize: item.desktopSize || '',
  mobilePosition: item.mobilePosition || '',
  mobileSize: item.mobileSize || '',
});


// A box of price points shown on the right of a banner (used on the Pricing page).
function PricePanel({ items }) {
  if (!items?.length) return null;
  return (
    <div className="hero-price-panel">
      {items.map(item => (
        <div className="hero-price-row" key={item.label}>
          <span>{item.label}</span>
          <b>{item.value}</b>
          {item.note ? <small>{item.note}</small> : null}
        </div>
      ))}
    </div>
  );
}

function Badge({ badge }) {
  if (!badge) return null;
  return (
    <div className="hero-badge" aria-hidden="true">
      <span>{badge.top}</span>
      <b>{badge.main}</b>
      <span>{badge.bottom}</span>
    </div>
  );
}

// A badge showing a service's featured price, e.g. "from $175 per month".
export function priceBadge(pricing) {
  const plan = pricing?.cards?.find(card => card.featured);
  return plan ? { top: plan.prefix || 'from', main: plan.amount, bottom: `per ${String(plan.unit || '').replace('/', '')}` } : null;
}

// One slide per entry in Admin › Promotions & Banners › Slides (`content.heroSlides`).
// `firstImage` replaces the first slide's photo when it has none (the homepage uses its
// Pages photo). Only one h1 per page: the homepage passes firstHeading 'h1'.
export function serviceSlides(services = [], content, { firstImage = '', firstHeading = 'h2' } = {}) {
  return content.heroSlides.map((slide, index) => {
    const Heading = index === 0 ? firstHeading : 'h2';
    const service = services.find(item => item.slug === slide.slug);
    if (!service) return null;
    const badge = slide.badgeFromPrice
      ? priceBadge(content.pricing[slide.slug])
      : (slide.badgeMain ? { top: slide.badgeTop, main: slide.badgeMain, bottom: slide.badgeBottom } : null);
    return {
      key: `${slide.slug}-${index}`,
      style: heroBackground(slide.image || (index === 0 && firstImage ? firstImage : service.banner_image), undefined, photoSettings(slide)),
      content: (
        <div className="hero-slide-layout">
          <div>
            <div className="hero-tag"><i/> {slide.eyebrow}</div>
            <Heading className="hero-title">{slide.heading} <em>{slide.accent}</em></Heading>
            <p className="lead">{slide.text}</p>
            <div className="hero-ctas">
              <QuoteDrawerTrigger className="btn btn-accent" preset={service.title} plan={slide.plan || ''}>{slide.primary} →</QuoteDrawerTrigger>
              {slide.secondary ? <Link className="btn btn-ghost" href={slide.secondaryHref || `/services/${service.slug}`}>{slide.secondary}</Link> : null}
            </div>
          </div>
          <Badge badge={badge}/>
        </div>
      ),
    };
  }).filter(Boolean);
}

// The page's own slide: breadcrumbs, tag, headline, subtitle and quote/call buttons.
export function pageSlide({ crumbs = [], eyebrow, heading, accent, text, image, imageAlt = '', fallbackImage, imagePosition, phone, ctas = true, badge, panel, preset = '', quoteFill = null }) {
  return {
    key: 'page',
    imageAlt,
    style: heroBackground(image, fallbackImage, imagePosition),
    content: (
      <div className="hero-slide-layout">
        <div>
          {crumbs.length ? (
            <div className="crumbs">
              {crumbs.map((crumb, index) => (
                <span className="crumb-part" key={`${crumb.label}-${index}`}>
                  {crumb.href ? <Link href={crumb.href}>{crumb.label}</Link> : <b>{crumb.label}</b>}
                  {index < crumbs.length - 1 ? <span className="crumb-sep">›</span> : null}
                </span>
              ))}
            </div>
          ) : null}
          {eyebrow ? <div className="hero-tag"><i/> {eyebrow}</div> : null}
          <h1 className="hero-title">{heading}{accent ? <> <em>{accent}</em></> : null}</h1>
          {text ? <p className="lead">{text}</p> : null}
          {ctas ? (
            <div className="hero-ctas">
              <QuoteDrawerTrigger className="btn btn-accent" preset={preset} fill={quoteFill}>Request a Quote →</QuoteDrawerTrigger>
              <a className="btn btn-ghost" href={telHref(phone)}><Phone size={18}/> Call Now</a>
            </div>
          ) : null}
        </div>
        {panel ? <PricePanel items={panel}/> : <Badge badge={badge}/>}
      </div>
    ),
  };
}

// The Pricing page's price box. A blank value on a "Snow removal" row shows the snow plan's price.
export function pricingPanel(content) {
  return content.pricingPanel
    .map(row => ({ ...row, value: row.value || (/snow/i.test(row.label) ? featuredPrice(content.pricing['snow-removal']) : '') }))
    .filter(row => row.label && row.value);
}
