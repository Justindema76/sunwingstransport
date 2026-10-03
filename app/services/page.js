import HeroBanner from '@/components/HeroBanner';
import ServiceCards from '@/components/ServiceCards';
import { getServices } from '@/lib/content';

export const metadata = {
  title: 'Moving, Delivery & Commercial Services',
  description: 'Explore Sunwings Transport residential moving, commercial transport, furniture delivery, warehouse support and labour services.',
  alternates: { canonical: '/services' },
};

export default async function ServicesPage() {
  const services = await getServices();
  return (
    <>
      <HeroBanner
        eyebrow="Sunwings Transport Services"
        title="Moving, Delivery & Commercial Transport Services"
        description="Residential and business services built around practical transport, careful handling and flexible job support."
        ctaLabel="Get a Quote"
        ctaUrl="/#quote"
      />
      <section className="section section-soft">
        <div className="container">
          <ServiceCards services={services} />
        </div>
      </section>
    </>
  );
}
