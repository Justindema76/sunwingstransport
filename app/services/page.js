import HowItWorks from '@/components/HowItWorks';
import PageHero from '@/components/PageHero';
import PageBlocks from '@/components/PageBlocks';
import ServiceCards from '@/components/ServiceCards';
import { getPageBuilderData, getServices, getSiteSettings } from '@/lib/content';

export const metadata = {
  title: 'Moving, Delivery & Commercial Services',
  description: 'Explore Sunwings Transport residential moving, commercial transport, furniture delivery, warehouse support and labour services.',
  alternates: { canonical: '/services' },
};

export default async function ServicesPage() {
  const [services, settings, pageData] = await Promise.all([getServices(), getSiteSettings(), getPageBuilderData('services')]);
  if (pageData) {
    return <PageBlocks data={pageData} pageId="services" services={services} settings={settings}/>;
  }
  return (
    <>
      <PageHero
        crumbs={[{label:'Home',href:'/'},{label:'Services'}]}
        title="Moving, delivery & transport services"
        description="Residential, commercial and warehouse services across Toronto, the GTA, Hamilton and Niagara."
        image="https://sunwingstransport.ca/wp-content/uploads/2026/02/cargo-van-driveway1.png"
        phone={settings.phone}
      />
      <section className="section">
        <div className="container">
          {services.length ? <ServiceCards services={services}/> : <div className="empty-state">No published Service Posts yet.</div>}
        </div>
      </section>
      <section className="section section-soft">
        <div className="container">
          <div className="section-head center"><span className="kicker">How it works</span><h2>Booked in three steps.</h2></div>
          <HowItWorks/>
        </div>
      </section>
    </>
  );
}
