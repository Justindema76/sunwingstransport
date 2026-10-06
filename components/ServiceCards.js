import Link from 'next/link';
import ServiceIcon from './ServiceIcon';

const FALLBACK_IMAGES = {
  'residential-moving': 'https://sunwingstransport.ca/wp-content/uploads/elementor/thumbs/happy-couple-move-rjw992tbb61z2n9hhbnvscs9srjnmxwvlts7dp1qbi.jpg',
  'furniture-delivery': 'https://sunwingstransport.ca/wp-content/uploads/2026/02/pexels-photo-7464708-7464708.jpg',
  'commercial-transport': 'https://sunwingstransport.ca/wp-content/uploads/2026/02/van-loading-file-cabinet.jpg',
  'packing-protection': 'https://sunwingstransport.ca/wp-content/uploads/2026/02/cargo-van-driveway1.png',
  'warehouse-container-unloading': 'https://sunwingstransport.ca/wp-content/uploads/2026/01/cargo-van-1.png',
  'junk-removal': 'https://sunwingstransport.ca/wp-content/uploads/2026/02/cargo-van-driveway1.png',
};

export default function ServiceCards({ services = [], compact = false, locationName = '', cardOverrides = [] }) {
  if (compact) {
    return (
      <div className="grid-2 location-service-grid">
        {services.map(service => (
          <Link className="card location-service-card" href={`/services/${service.slug}`} key={service.id || service.slug}>
            <div className="card-body tight">
              <h3 className="service-card-heading">
                <span className="service-card-icon"><ServiceIcon slug={service.slug} size={20}/></span>
                {service.title}
              </h3>
              <p>{service.intro || service.hero_description}</p>
              <span className="more">{locationName ? `${service.title} in ${locationName} →` : 'Learn more →'}</span>
            </div>
          </Link>
        ))}
      </div>
    );
  }

  return (
    <div className="grid-3">
      {services.map((service, index) => {
        const override = cardOverrides[index] || {};
        const image = override.image || service.banner_image || FALLBACK_IMAGES[service.slug] || '';
        const title = override.title || service.title;
        const description = override.text || service.intro || service.hero_description;
        const href = override.url || `/services/${service.slug}`;
        const linkText = override.linkText || 'Learn more →';
        return (
          <Link className="card" href={href} key={service.id || service.slug}>
            <div
              className="card-img ph"
              style={image ? { backgroundImage: `url("${image}")` } : undefined}
              role={override.imageAlt ? 'img' : undefined}
              aria-label={override.imageAlt || undefined}
            >
              <div className="badge"><ServiceIcon slug={service.slug}/></div>
            </div>
            <div className="card-body">
              <h3>{title}</h3>
              <p>{description}</p>
              <span className="more">{linkText}</span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
