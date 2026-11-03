import Link from 'next/link';
import { Phone } from 'lucide-react';
import QuoteDrawerTrigger from './QuoteDrawerTrigger';
import { getServicePricing } from '@/lib/servicePricing';

// Shared banner content for every page: the homepage slider style (pill tag, headline
// with an orange second line, white subtitle, swirl at the bottom).

// Photos already uploaded to the site, used when a page has no photo of its own or its
// photo still points at the old WordPress site. A photo set in the admin always wins.
const ASSETS = 'https://nowsajdmbpxvlvrhopjg.supabase.co/storage/v1/object/public';
export const HERO_IMAGES = {
  van: `${ASSETS}/blog-images/sunwings/1792805662384-cargo-van-driveway1.webp`,
  couple: `${ASSETS}/site-assets/sunwings/1792805704389-happy-couple-move-.jpg`,
  delivery: `${ASSETS}/site-assets/sunwings/1791336064197-furniture-delivery.jpeg`,
  truck: `${ASSETS}/site-assets/sunwings/1791340265388-long-distance.jpg`,
  packing: `${ASSETS}/site-assets/sunwings/1791331979339-packing-protecting.webp`,
  warehouse: `${ASSETS}/site-assets/sunwings/1791340345360-warehouse.png`,
  junk: `${ASSETS}/site-assets/sunwings/1791336112227-junk-removal.jpeg`,
};
const ROTATION = [HERO_IMAGES.couple, HERO_IMAGES.truck, HERO_IMAGES.delivery, HERO_IMAGES.packing, HERO_IMAGES.warehouse];

// Picks a steady photo for a key (e.g. a location slug) so pages don't all look the same.
export function rotatingHeroImage(key = '') {
  const sum = [...String(key)].reduce((total, char) => total + char.charCodeAt(0), 0);
  return ROTATION[sum % ROTATION.length];
}

export function safeHeroImage(image, fallback = HERO_IMAGES.van) {
  const url = String(image || '').trim();
  return url && !/sunwingstransport\.ca\/wp-content\//.test(url) ? url : fallback;
}

export function heroBackground(image, fallback) {
  return {
    backgroundImage: `linear-gradient(90deg,rgba(11,37,69,.88) 0%,rgba(11,37,69,.7) 38%,rgba(11,37,69,.2) 75%,rgba(11,37,69,.05) 100%),url("${safeHeroImage(image, fallback)}")`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  };
}

function telHref(phone = '') {
  const digits = String(phone).replace(/\D/g, '');
  return digits ? `tel:+${digits.startsWith('1') ? digits : `1${digits}`}` : '#';
}

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
export function priceBadge(slug) {
  const plan = getServicePricing(slug)?.cards.find(card => card.featured);
  return plan ? { top: plan.prefix || 'from', main: plan.amount, bottom: `per ${String(plan.unit || '').replace('/', '')}` } : null;
}

// One slide per service, in this order. `slug` picks the service's photo and quote form.
const SERVICE_SLIDES = [
  {
    slug: 'residential-moving',
    eyebrow: 'Upfront quotes · Price-match guarantee',
    heading: 'Moving day,',
    accent: 'without the stress.',
    text: 'Careful crews, a clean truck, blankets and wrapping. Get an upfront quote, and show us a lower written quote for the same job and we’ll match it.',
    badge: { top: 'We match', main: 'Any', bottom: 'lower written quote' },
    primary: 'Get my moving quote',
    secondary: 'See moving services',
  },
  {
    slug: 'furniture-delivery',
    eyebrow: 'Marketplace · Kijiji · Store pickups',
    heading: 'Bought it online?',
    accent: 'We’ll bring it home.',
    text: 'Couches, beds, dressers and appliances picked up and carried in, wrapped and placed in the room you want.',
    primary: 'Book a pickup',
    secondary: 'See delivery details',
  },
  {
    slug: 'junk-removal',
    eyebrow: 'Garages · Basements · Move-outs',
    heading: 'Clear the clutter.',
    accent: 'We haul it away.',
    text: 'Old furniture, appliances and garage junk loaded up and taken away, so you don’t have to lift a thing.',
    primary: 'Get a junk removal quote',
    secondary: 'See junk removal',
  },
  {
    slug: 'snow-removal',
    eyebrow: 'Winter 2026–27 · Limited spots',
    heading: 'Never shovel',
    accent: 'again.',
    text: 'Your driveway, walkways and front steps cleared after every 5 cm snowfall. One price for the whole season. Now booking in Markham, Stouffville & Toronto.',
    badgeFromPricing: true,
    primary: 'Book your spot',
    plan: 'Seasonal plan',
    secondary: 'See snow plans',
  },
];

// `firstImage` replaces the moving slide's photo (the homepage uses its admin hero photo).
// Only one h1 per page: the homepage passes firstHeading 'h1'; inner pages keep h2.
export function serviceSlides(services = [], { firstImage = '', firstHeading = 'h2' } = {}) {
  return SERVICE_SLIDES.map((slide, index) => {
    const Heading = index === 0 ? firstHeading : 'h2';
    const service = services.find(item => item.slug === slide.slug);
    if (!service) return null;
    const badge = slide.badgeFromPricing ? priceBadge(slide.slug) : slide.badge;
    return {
      key: slide.slug,
      style: heroBackground(index === 0 && firstImage ? firstImage : service.banner_image),
      content: (
        <div className="hero-slide-layout">
          <div>
            <div className="hero-tag"><i/> {slide.eyebrow}</div>
            <Heading className="hero-title">{slide.heading} <em>{slide.accent}</em></Heading>
            <p className="lead">{slide.text}</p>
            <div className="hero-ctas">
              <QuoteDrawerTrigger className="btn btn-accent" preset={service.title} plan={slide.plan || ''}>{slide.primary} →</QuoteDrawerTrigger>
              <Link className="btn btn-ghost" href={`/services/${service.slug}`}>{slide.secondary}</Link>
            </div>
          </div>
          <Badge badge={badge}/>
        </div>
      ),
    };
  }).filter(Boolean);
}

// The page's own slide: breadcrumbs, tag, headline, subtitle and quote/call buttons.
export function pageSlide({ crumbs = [], eyebrow, heading, accent, text, image, fallbackImage, phone, ctas = true, badge, panel, preset = '' }) {
  return {
    key: 'page',
    style: heroBackground(image, fallbackImage),
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
              <QuoteDrawerTrigger className="btn btn-accent" preset={preset}>Request a Quote →</QuoteDrawerTrigger>
              <a className="btn btn-ghost" href={telHref(phone)}><Phone size={18}/> Call Now</a>
            </div>
          ) : null}
        </div>
        {panel ? <PricePanel items={panel}/> : <Badge badge={badge}/>}
      </div>
    ),
  };
}

// The Pricing page's price box: real prices where we have them, quotes everywhere else.
export function pricingPanel() {
  const snow = getServicePricing('snow-removal')?.cards.find(card => card.featured);
  return [
    snow ? { label: 'Snow removal', value: `${snow.prefix ? `${snow.prefix} ` : ''}${snow.amount}${snow.unit || ''}`, note: 'Seasonal plan, Oct 15 – Mar 15' } : null,
    { label: 'Moving & delivery', value: 'Free upfront quote', note: 'Based on crew, truck time and distance' },
    { label: 'Price-match guarantee', value: 'We match any lower written quote', note: 'Show us a lower written quote for the same job and we’ll match it.' },
  ].filter(Boolean);
}

// Banner copy for the main pages, keyed by page id. Overrides the admin's hero text so
// every main page has the same two-line headline style.
export const PAGE_HERO = {
  // `replaceImage` uses this photo even though the admin has one set (the admin photo is the van).
  services: { eyebrow: 'Our services', heading: 'Moving, delivery', accent: '& everything in between.', image: HERO_IMAGES.warehouse, replaceImage: true },
  locations: { eyebrow: 'Service areas', heading: 'Toronto to Niagara,', accent: 'and every stop between.', image: HERO_IMAGES.truck },
  pricing: { eyebrow: 'Upfront pricing · Price-match guarantee', heading: 'Straight answers', accent: 'on price.', image: HERO_IMAGES.couple, panel: true },
  blog: { eyebrow: 'Moving tips', heading: 'Moving tips', accent: '& guides.', image: HERO_IMAGES.packing },
  contact: { eyebrow: 'Contact', heading: 'Talk to', accent: 'the Sunwings crew.', text: 'Questions about a move, a delivery or snow removal? Send us a message and we’ll get back to you.', image: HERO_IMAGES.delivery },
  privacy: { eyebrow: 'Legal', heading: 'Privacy', accent: 'policy.', image: HERO_IMAGES.packing },
};

// Main pages that also rotate through every service after their own slide.
export const PAGES_WITH_SERVICE_SLIDES = new Set(['services', 'locations', 'pricing']);
