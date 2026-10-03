import Link from 'next/link';
import ServiceIcon from './ServiceIcon';

const FALLBACK_IMAGES = {
  'residential-moving': 'https://sunwingstransport.ca/wp-content/uploads/elementor/thumbs/happy-couple-move-rjw992tbb61z2n9hhbnvscs9srjnmxwvlts7dp1qbi.jpg',
  'furniture-delivery': 'https://sunwingstransport.ca/wp-content/uploads/2026/02/pexels-photo-7464708-7464708.jpg',
  'commercial-transport': 'https://sunwingstransport.ca/wp-content/uploads/2026/02/van-loading-file-cabinet.jpg',
  'packing-protection': 'https://sunwingstransport.ca/wp-content/uploads/2026/02/cargo-van-driveway1.png',
  'warehouse-container-unloading': 'https://sunwingstransport.ca/wp-content/uploads/2026/01/cargo-van-1.png',
  'general-labour': 'https://sunwingstransport.ca/wp-content/uploads/2026/02/cargo-van-driveway1.png',
  'junk-removal': 'https://sunwingstransport.ca/wp-content/uploads/2026/02/cargo-van-driveway1.png',
};

export default function ServiceCards({ services = [], compact = false }) {
  return (
    <div className={compact ? 'grid-2' : 'grid-3'}>
      {services.map(service => {
        const image = service.banner_image || FALLBACK_IMAGES[service.slug] || '';
        return (
          <Link className="card" href={`/services/${service.slug}`} key={service.id || service.slug}>
            <div
              className="card-img ph"
              style={image ? { backgroundImage: `url("${image}")` } : undefined}
            >
              <div className="badge"><ServiceIcon slug={service.slug}/></div>
            </div>
            <div className="card-body">
              <h3>{service.title}</h3>
              <p>{service.intro || service.hero_description}</p>
              <span className="more">Learn more →</span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
