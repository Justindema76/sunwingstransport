import HeroBanner from '@/components/HeroBanner';
import LocationCards from '@/components/LocationCards';
import { getLocations } from '@/lib/content';

export const metadata = {
  title: 'Hamilton & Niagara Service Areas',
  description: 'Sunwings Transport service areas across Hamilton and the Niagara Region.',
};

export default async function LocationsPage() {
  const locations = await getLocations();
  return (
    <>
      <HeroBanner
        eyebrow="Service Areas"
        title="Hamilton & Niagara Moving and Transport"
        description="Regional moving, delivery, business transport and labour services with dedicated local content for each service area."
        ctaLabel="View Services"
        ctaUrl="/services"
      />
      <section className="section">
        <div className="container">
          <LocationCards locations={locations} />
        </div>
      </section>
    </>
  );
}
