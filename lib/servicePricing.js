// Per-service pricing, keyed by service slug. A service listed here gets its own
// pricing section on its service page and on /pricing, so it can be promoted on its own.
export const servicePricing = {
  'snow-removal': {
    label: 'Snow Removal',
    eyebrow: 'Snow removal pricing',
    heading: 'Residential snow removal from $175/month.',
    text: 'Keep your driveway and walkways clear this winter. Sign up once for the season and we clear your property after every snowfall. Limited spots available.',
    cards: [
      {
        title: 'Seasonal plan',
        subtitle: 'Residential driveways',
        prefix: 'from',
        amount: '$175',
        unit: '/month',
        note: 'season runs Oct 15 – Mar 15',
        features: [
          'Driveway clearing',
          'Walkways and front steps',
          'Snowblower + hand shovelling',
          '5 cm snowfall trigger',
          'Target clearing within 6–8 hours after snowfall ends',
          'Reliable, professional service',
        ],
        buttonText: 'Book now',
        featured: true,
      },
      {
        title: 'One-time clear',
        subtitle: 'One storm, no contract',
        amount: 'Quote',
        note: 'based on the property',
        features: [
          'Driveway, walkways and front steps',
          'Book when you need it',
          'Scheduled after the storm',
        ],
        buttonText: 'Get a quote',
      },
      {
        title: 'Large & corner lots',
        subtitle: 'Bigger properties',
        amount: 'Quote',
        note: 'priced on the property',
        features: [
          'Long or extra-wide driveways',
          'Corner lots and extra walkways',
          'Multiple properties',
        ],
        buttonText: 'Get a quote',
      },
    ],
    details: [
      { label: 'Snow trigger', value: '5 cm', note: 'service starts automatically' },
      { label: 'Cleaning', value: '6–8 hours', note: 'after snowfall ends' },
      { label: 'Season', value: 'Oct 15 – Mar 15', note: 'most areas' },
    ],
    // Read by Google from the service page's structured data.
    schemaOffer: {
      name: 'Seasonal residential snow removal plan',
      price: '175.00',
      priceSpecification: { '@type': 'UnitPriceSpecification', price: '175.00', priceCurrency: 'CAD', unitText: 'MONTH' },
    },
    // Service regions, shown near the top. Each town links to its location page.
    regions: [
      {
        label: 'Markham & Stouffville',
        places: [
          { label: 'Markham', href: '/locations/markham' },
          { label: 'Stouffville' },
          { label: 'Richmond Hill', href: '/locations/richmond-hill' },
        ],
      },
      {
        label: 'Toronto',
        places: [
          { label: 'Scarborough', href: '/locations/scarborough' },
          { label: 'North York', href: '/locations/north-york' },
          { label: 'Toronto', href: '/locations/toronto' },
        ],
      },
    ],
    footnote: 'Prices in CAD. Final price is confirmed once we see the property. Cleaning times are a service target and can be affected by severe weather, road access and municipal plowing.',
  },
};

// Page copy that replaces the admin's service content, keyed by service slug.
export const serviceCopy = {
  'snow-removal': {
    seo_title: 'Snow Removal Markham, Stouffville & Toronto | From $175/Month | Sunwings Transport',
    seo_description: 'Residential snow removal in Markham, Stouffville, Richmond Hill, Scarborough and North York from $175/month. Driveway, walkways and front steps cleared after every 5 cm snowfall. Limited spots.',
    hero_title: 'Residential Snow Removal in Markham, Stouffville & Toronto',
    intro: 'Keep your driveway and walkways clear this winter. Sunwings Transport clears your driveway, walkways and front steps after every 5 cm snowfall, with target clearing within 6–8 hours after the snow stops. Now booking in Markham, Stouffville, Richmond Hill, Scarborough and North York.',
    bullets: [
      'Driveway snow removal',
      'Walkways and front steps',
      'Snowblower + hand shovelling',
      '5 cm snowfall trigger',
      'Target clearing within 6–8 hours after snowfall ends',
      'Reliable, professional service',
    ],
    body_html: '<h2>How the seasonal plan works</h2><p>Sign up once for the season (October 15 to March 15 in most areas). When 5 cm or more of snow falls, your property is added to the route automatically, so there is no need to call after every storm. We clear your driveway, walkways and front steps using a snowblower and hand shovelling, with a target of 6–8 hours after the snowfall ends.</p><p>Spots are limited each season, so book early to secure your place on the route.</p>',
    faq: [
      { question: 'How much does snow removal cost?', answer: 'The seasonal plan starts at $175/month for a residential driveway, walkways and front steps. Larger driveways and corner lots are quoted based on the property.' },
      { question: 'Do you offer snow removal in Stouffville?', answer: 'Yes. We clear residential driveways, walkways and front steps across Stouffville, including Ballantrae, as part of our Markham and Stouffville route.' },
      { question: 'When does the season run?', answer: 'October 15 to March 15 in most areas.' },
      { question: 'When do you come out?', answer: 'Service starts automatically when 5 cm or more of snow falls. We aim to clear your property within 6–8 hours after the snowfall ends.' },
      { question: 'Which areas do you cover?', answer: 'Markham, Stouffville and Richmond Hill in York Region, and Scarborough, North York and Toronto.' },
    ],
  },
};

export function withServiceCopy(service) {
  return service && serviceCopy[service.slug] ? { ...service, ...serviceCopy[service.slug] } : service;
}

// Priced services offered in a location, for promoting them on that location's page.
export function pricedServicesForLocation(locationSlug) {
  const href = `/locations/${locationSlug}`;
  return Object.entries(servicePricing)
    .filter(([, pricing]) => (pricing.regions || []).some(region => region.places.some(place => place.href === href)))
    .map(([slug, pricing]) => ({ slug, ...pricing }));
}

export function getServicePricing(slug) {
  return servicePricing[slug] || null;
}

export function pricedServiceSlugs() {
  return Object.keys(servicePricing);
}
