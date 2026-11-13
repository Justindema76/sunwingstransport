// Starting content for everything editable under Admin › Promotions & Banners.
// Each key matches a sunwings_site_settings key. The admin saves JSON for a key;
// until it does, the site uses these values. Keep these in sync with the admin's
// copy in src/backend-admin/sites/sunwings/promotionsDefaults.js.

// Banner photos. Sunwings' own photos where we have them (van, truck, family, office van);
// sharp free Pexels photos with no faces for the rest. Files live in public/images/banners.
export const HERO_IMAGE_OPTIONS = {
  van: 'https://nowsajdmbpxvlvrhopjg.supabase.co/storage/v1/object/public/blog-images/sunwings/1792805662384-cargo-van-driveway1.webp',
  couple: '/images/banners/residential-family.jpg',
  delivery: '/images/banners/furniture-delivery-condo.jpg',
  truck: '/images/banners/long-distance-truck.jpg',
  packing: '/images/banners/packing-wrapped-dresser.jpg',
  warehouse: '/images/banners/warehouse-work.jpg',
  pricing: '/images/banners/pricing-clipboard.jpg',
  commercial: '/images/banners/commercial-office-van.jpg',
  street: '/images/banners/residential-street-van.jpg',
};

// Old blurry/AI photos that may still be saved in the admin (e.g. a service's banner photo).
// The site shows the new photo instead, wherever the old one is used.
export const RETIRED_HERO_IMAGES = {
  'https://nowsajdmbpxvlvrhopjg.supabase.co/storage/v1/object/public/site-assets/sunwings/1792805704389-happy-couple-move-.jpg': HERO_IMAGE_OPTIONS.couple,
  'https://nowsajdmbpxvlvrhopjg.supabase.co/storage/v1/object/public/site-assets/sunwings/1791336064197-furniture-delivery.jpeg': HERO_IMAGE_OPTIONS.delivery,
  'https://nowsajdmbpxvlvrhopjg.supabase.co/storage/v1/object/public/site-assets/sunwings/1791340265388-long-distance.jpg': HERO_IMAGE_OPTIONS.commercial,
  'https://nowsajdmbpxvlvrhopjg.supabase.co/storage/v1/object/public/site-assets/sunwings/1791331979339-packing-protecting.webp': HERO_IMAGE_OPTIONS.packing,
  'https://nowsajdmbpxvlvrhopjg.supabase.co/storage/v1/object/public/site-assets/sunwings/1791340345360-warehouse.png': HERO_IMAGE_OPTIONS.warehouse,
};

export const CONTENT_DEFAULTS = {
  // Slide-up promo card shown on every page.
  promo_popup: {
    enabled: true,
    serviceSlug: 'snow-removal',
    image: '',
    eyebrow: 'Winter 2026–27 · Limited spots',
    heading: 'Never shovel again.',
    price: '',
    text: 'Driveway, walkways and front steps cleared after every 5 cm snowfall, all season long. Now booking in Markham, Stouffville & Toronto.',
    primary: 'Book your spot',
    plan: 'Seasonal plan',
    secondary: 'See snow removal plans',
    secondaryHref: '/services/snow-removal#plans',
    tabLabel: '',
  },

  // Service slides on the homepage (and after the page's own slide on Services,
  // Service Areas and Pricing). `image` blank = the service's own banner photo.
  hero_slides: [
    {
      enabled: true,
      slug: 'residential-moving',
      image: '',
      eyebrow: 'Upfront quotes · Careful crews',
      heading: 'Moving day,',
      accent: 'without the stress.',
      text: 'Careful crews, a clean truck, blankets and wrapping. Clear, upfront quotes tailored to your job.',
      badgeTop: '',
      badgeMain: '',
      badgeBottom: '',
      badgeFromPrice: false,
      primary: 'Get my moving quote',
      plan: '',
      secondary: 'See moving services',
      secondaryHref: '',
    },
    {
      enabled: true,
      slug: 'furniture-delivery',
      image: '',
      eyebrow: 'Marketplace · Kijiji · Store pickups',
      heading: 'Bought it online?',
      accent: 'We’ll bring it home.',
      text: 'Couches, beds, dressers and appliances picked up and carried in, wrapped and placed in the room you want.',
      badgeTop: '', badgeMain: '', badgeBottom: '',
      badgeFromPrice: false,
      primary: 'Book a pickup',
      plan: '',
      secondary: 'See delivery details',
      secondaryHref: '',
    },
    {
      enabled: true,
      slug: 'junk-removal',
      image: '',
      eyebrow: 'Garages · Basements · Move-outs',
      heading: 'Clear the clutter.',
      accent: 'We haul it away.',
      text: 'Old furniture, appliances and garage junk loaded up and taken away, so you don’t have to lift a thing.',
      badgeTop: '', badgeMain: '', badgeBottom: '',
      badgeFromPrice: false,
      primary: 'Get a junk removal quote',
      plan: '',
      secondary: 'See junk removal',
      secondaryHref: '',
    },
    {
      enabled: true,
      slug: 'snow-removal',
      image: '',
      eyebrow: 'Winter 2026–27 · Limited spots',
      heading: 'Never shovel',
      accent: 'again.',
      text: 'Your driveway, walkways and front steps cleared after every 5 cm snowfall. One price for the whole season. Now booking in Markham, Stouffville & Toronto.',
      badgeTop: '', badgeMain: '', badgeBottom: '',
      badgeFromPrice: true,
      primary: 'Book your spot',
      plan: 'Seasonal plan',
      secondary: 'See snow plans',
      secondaryHref: '/services/snow-removal#plans',
    },
  ],

  // Which part of each service page's banner photo shows on phones (CSS background position).
  // Blank = the lower part of tall photos. Set per service in Admin › Promotions & Banners.
  service_banners: {
    'residential-moving': { mobilePosition: '' },
    'furniture-delivery': { mobilePosition: '' },
    'commercial-transport': { mobilePosition: '50% 50%' },
    'snow-removal': { mobilePosition: '' },
    'packing-protection': { mobilePosition: '' },
    'warehouse-container-unloading': { mobilePosition: '' },
    'junk-removal': { mobilePosition: '' },
    'client-assist-moving-delivery': { mobilePosition: '50% 50%' },
  },

  // Banner text and photo for each main page. `image` here wins over the Pages editor's photo.
  page_banners: {
    services: { eyebrow: 'Our services', heading: 'Moving, delivery', accent: '& everything in between.', text: '', image: HERO_IMAGE_OPTIONS.warehouse, showServiceSlides: true },
    locations: { eyebrow: 'Service areas', heading: 'Toronto to Niagara,', accent: 'and every stop between.', text: '', image: HERO_IMAGE_OPTIONS.street, showServiceSlides: true },
    pricing: { eyebrow: 'Upfront pricing', heading: 'Straight answers', accent: 'on price.', text: '', image: HERO_IMAGE_OPTIONS.pricing, showServiceSlides: true },
    blog: { eyebrow: 'Moving tips', heading: 'Moving tips', accent: '& guides.', text: '', image: HERO_IMAGE_OPTIONS.packing, showServiceSlides: false },
    contact: { eyebrow: 'Contact', heading: 'Talk to', accent: 'the Sunwings crew.', text: 'Questions about a move, a delivery or snow removal? Send us a message and we’ll get back to you.', image: HERO_IMAGE_OPTIONS.delivery, showServiceSlides: false },
    privacy: { eyebrow: 'Legal', heading: 'Privacy', accent: 'policy.', text: '', image: HERO_IMAGE_OPTIONS.packing, showServiceSlides: false },
  },

  // The price box on the right of the Pricing banner. A blank value on the snow row
  // shows the snow plan's price automatically.
  pricing_panel: [
    { label: 'Snow removal', value: '', note: 'Seasonal plan, Oct 15 – Mar 15' },
    { label: 'Moving & delivery', value: 'Free upfront quote', note: 'Based on crew, truck time and distance' },
    { label: 'Upfront quotes', value: 'Tailored to your job', note: 'Clear, upfront quotes tailored to your job.' },
  ],

  // Price-match section on the Pricing page. Off: Sunwings no longer offers a blanket price match.
  price_match: {
    enabled: false,
    eyebrow: 'Price-match guarantee',
    heading: 'We match any lower written quote.',
    text: 'Found a lower price somewhere else? Don’t book with them yet. Show us their written quote for the same job and we’ll match it.',
    steps: [
      { title: 'Get a written quote', text: 'Get a written quote from another moving or delivery company for your job.' },
      { title: 'Send it to us', text: 'Attach it or mention it when you request your Sunwings quote, before you book.' },
      { title: 'We match the price', text: 'If it’s for the same job, we match it. Same crew, same care, lower price.' },
    ],
    rulesTitle: 'What counts',
    rules: [
      'The quote must be in writing (email, PDF or on the company’s letterhead).',
      'It must be for the same job: same date, addresses, crew size, truck size and services.',
      'It must come from a real, licensed and insured local company.',
      'Send it to us before your job is booked.',
    ],
    button: 'Get my quote and price match',
  },

  // The 4 boxes under every banner. A blank link = not clickable.
  trust_links: [
    { title: 'Google reviews', text: 'Trusted by local customers', href: 'https://search.google.com/local/reviews?placeid=ChIJXTBVHE3zTkcRiUEmU5P3CsI' },
    { title: 'Upfront quotes', text: 'Clear, upfront quotes tailored to your job.', href: '/pricing' },
    { title: 'Flexible scheduling', text: 'Evenings & weekends', href: '' },
    { title: 'Toronto to Niagara', text: 'GTA, Hamilton & beyond', href: 'https://www.google.com/maps?cid=13982260205252395401' },
  ],
};
