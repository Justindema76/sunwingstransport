import Link from 'next/link';

export default function ServiceCards({ services }) {
  return (
    <div className="card-grid">
      {services.map((service, index) => (
        <article className="content-card" key={service.id || service.slug}>
          <div className="card-number">{String(index + 1).padStart(2, '0')}</div>
          <h3>{service.title}</h3>
          <p>{service.intro || service.hero_description}</p>
          <Link href={`/services/${service.slug}`}>View service →</Link>
        </article>
      ))}
    </div>
  );
}
