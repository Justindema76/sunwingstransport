// Long-distance / intercity moving routes, one landing page each (/long-distance/<slug>).
// Built for ads: no prices, just a free quote. The quote form opens with both cities
// filled in, and every quote records which page (and ad) it came from.

const HAMILTON = { label: 'Hamilton & Halton', note: 'Hamilton, Stoney Creek, Burlington and nearby' };
const NIAGARA = { label: 'Niagara', note: 'St. Catharines, Niagara Falls and the Niagara Region' };

export const ROUTE_GROUPS = [
  { key: 'hamilton', ...HAMILTON },
  { key: 'niagara', ...NIAGARA },
];

export const ROUTES = [
  {
    slug: 'hamilton-to-toronto', group: 'hamilton', from: 'Hamilton', to: 'Toronto', fromSlug: 'hamilton', toSlug: 'toronto',
    distance: 'about 70 km', drive: 'roughly an hour on the QEW, depending on traffic',
    intro: 'Moving from Hamilton to Toronto? One Sunwings crew loads your home in Hamilton, drives it straight up the QEW and unloads it at your new place in Toronto, the same day for most apartments and smaller homes.',
  },
  {
    slug: 'toronto-to-hamilton', group: 'hamilton', from: 'Toronto', to: 'Hamilton', fromSlug: 'toronto', toSlug: 'hamilton',
    distance: 'about 70 km', drive: 'roughly an hour on the QEW, depending on traffic',
    intro: 'Leaving Toronto for Hamilton? We load your condo, apartment or house in Toronto and bring everything down the QEW to Hamilton with the same crew, so nothing changes hands along the way.',
  },
  {
    slug: 'stoney-creek-to-toronto', group: 'hamilton', from: 'Stoney Creek', to: 'Toronto', fromSlug: 'stoney-creek', toSlug: 'toronto',
    distance: 'about 75 km', drive: 'roughly an hour on the QEW, depending on traffic',
    intro: 'Moving from Stoney Creek to Toronto? Sunwings loads your Stoney Creek home and delivers it straight to Toronto in one trip, with blankets, wrapping and placement in each room included.',
  },
  {
    slug: 'hamilton-to-mississauga', group: 'hamilton', from: 'Hamilton', to: 'Mississauga', fromSlug: 'hamilton', toSlug: 'mississauga',
    distance: 'about 45 km', drive: 'roughly 40 minutes on the QEW or 403, depending on traffic',
    intro: 'Moving from Hamilton to Mississauga? One crew and one truck take your home from Hamilton to Mississauga door to door, usually in a single day.',
  },
  {
    slug: 'st-catharines-to-toronto', group: 'niagara', from: 'St. Catharines', to: 'Toronto', fromSlug: 'st-catharines', toSlug: 'toronto',
    distance: 'about 110 km', drive: 'roughly an hour and a half on the QEW, depending on traffic',
    intro: 'Moving from St. Catharines to Toronto? Sunwings loads your home in St. Catharines and drives it straight to Toronto with the same crew, so you are not paying for a second team or a storage stop.',
  },
  {
    slug: 'toronto-to-st-catharines', group: 'niagara', from: 'Toronto', to: 'St. Catharines', fromSlug: 'toronto', toSlug: 'st-catharines',
    distance: 'about 110 km', drive: 'roughly an hour and a half on the QEW, depending on traffic',
    intro: 'Leaving Toronto for St. Catharines? We pack up your Toronto home and bring it down to Niagara in one trip, with your furniture wrapped and placed where you want it.',
  },
  {
    slug: 'niagara-falls-to-toronto', group: 'niagara', from: 'Niagara Falls', to: 'Toronto', fromSlug: 'niagara-falls', toSlug: 'toronto',
    distance: 'about 130 km', drive: 'roughly an hour and three quarters on the QEW, depending on traffic',
    intro: 'Moving from Niagara Falls to Toronto? One Sunwings crew loads your home in Niagara Falls and delivers it straight to Toronto, door to door.',
  },
  {
    slug: 'toronto-to-niagara-falls', group: 'niagara', from: 'Toronto', to: 'Niagara Falls', fromSlug: 'toronto', toSlug: 'niagara-falls',
    distance: 'about 130 km', drive: 'roughly an hour and three quarters on the QEW, depending on traffic',
    intro: 'Leaving Toronto for Niagara Falls? We load your Toronto home and bring it all the way to Niagara Falls with the same crew and truck.',
  },
];

export const routeBySlug = slug => ROUTES.find(route => route.slug === slug) || null;
export const routeHref = route => `/long-distance/${route.slug}`;
export const reverseRoute = route => ROUTES.find(item => item.from === route.to && item.to === route.from) || null;
export const routesForTown = townSlug => ROUTES.filter(route => route.fromSlug === townSlug || route.toSlug === townSlug);
export const ROUTE_SERVICE = 'Residential Moving';
