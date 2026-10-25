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
      { label: 'Season', value: 'Oct 15 – Mar 15', note: 'most areas' },    ],
    areas: ['Markham', 'Richmond Hill', 'Stouffville', 'Hamilton region', 'Niagara region'],
    footnote: 'Prices in CAD. Final price is confirmed once we see the property. Cleaning times are a service target and can be affected by severe weather, road access and municipal plowing.',
  },
};

export function getServicePricing(slug) {
  return servicePricing[slug] || null;
}

export function pricedServiceSlugs() {
  return Object.keys(servicePricing);
}
