import Link from 'next/link';

const GROUPS = [
  { title:'Toronto', regions:['Toronto & GTA'] },
  { title:'GTA', regions:['Peel Region','York Region'] },
  { title:'Halton & Hamilton', regions:['Halton Region','Hamilton Region'] },
  { title:'Niagara', regions:['Niagara Region'] },
];

export default function ServiceAreaGrid({ locations = [], detailed = false }) {
  return (
    <div className={detailed ? 'grid-2' : 'grid-4'}>
      {GROUPS.map(group => {
        const items = locations.filter(location => group.regions.includes(location.region));
        if (!items.length) return null;
        return (
          <div className="region" key={group.title}>
            <h3>{group.title}</h3>
            {detailed ? <p>{group.title === 'Toronto' ? 'Condos, towers and tight downtown streets.' : group.title === 'GTA' ? 'Mississauga to Markham and everywhere between.' : group.title === 'Halton & Hamilton' ? 'Lakeshore homes to the Mountain.' : 'St. Catharines to Fort Erie.'}</p> : null}
            <div className={detailed ? 'city-list' : 'chips'}>
              {items.map(location => (
                detailed ? (
                  <Link className="city-card" href={`/locations/${location.slug}`} key={location.slug}>
                    <span>{location.title}<small>Movers &amp; delivery</small></span><span>→</span>
                  </Link>
                ) : (
                  <Link className="chip" href={`/locations/${location.slug}`} key={location.slug}>{location.title}</Link>
                )
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
