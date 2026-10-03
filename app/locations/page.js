import HeroBanner from '@/components/HeroBanner';
import LocationDirectory from '@/components/LocationDirectory';
import { getLocations } from '@/lib/content';

export const metadata = {
  title: 'Sunwings Transport Service Areas',
  description: 'Sunwings Transport service areas across Toronto, the GTA, Hamilton and the Niagara Region.',
};

export default async function LocationsPage() {
  const locations = await getLocations();
  return (
    <>
      <HeroBanner
        eyebrow="Service Areas"
        title="Moving & Transport Service Areas"
        description="Browse every published Sunwings service area across Toronto, the GTA, Hamilton and Niagara."
        ctaLabel="View Services"
        ctaUrl="/services"
      />
      <section className="section">
        <div className="container">
          <LocationDirectory locations={locations} />
        </div>
      </section>
    </>
  );
}
