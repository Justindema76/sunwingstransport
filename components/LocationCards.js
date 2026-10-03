import Link from 'next/link';

export default function LocationCards({ locations }) {
  return (
    <div className="location-grid">
      {locations.map((location) => (
        <article className="location-card" key={location.id || location.slug}>
          <span>{location.region || 'Service Area'}</span>
          <h3>{location.title}</h3>
          <p>{location.intro || location.hero_description}</p>
          {Array.isArray(location.neighbourhoods) && location.neighbourhoods.length ? (
            <div className="chips">
              {location.neighbourhoods.slice(0, 6).map(item => <span className="chip" key={item}>{item}</span>)}
            </div>
          ) : null}
          <Link className="button button-light" href={`/locations/${location.slug}`}>View {location.title}</Link>
        </article>
      ))}
    </div>
  );
}
