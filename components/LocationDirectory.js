import Link from 'next/link';

export default function LocationDirectory({ locations = [] }) {
  const groups = locations.reduce((acc, location) => {
    const region = location.region || 'Other Service Areas';
    if (!acc[region]) acc[region] = [];
    acc[region].push(location);
    return acc;
  }, {});

  return (
    <div className="location-directory">
      {Object.entries(groups).map(([region, items]) => (
        <section className="location-directory-group" key={region}>
          <h3>{region}</h3>
          <div className="location-link-grid">
            {items.map(location => (
              <Link key={location.id || location.slug} href={`/locations/${location.slug}`}>
                {location.title}
                <span>→</span>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
