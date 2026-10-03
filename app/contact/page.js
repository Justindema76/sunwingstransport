import PageHero from '@/components/PageHero';
import PageBlocks from '@/components/PageBlocks';
import ContactForm from '@/components/ContactForm';
import { getPageBuilderData, getServices, getSiteSettings, pageMetadataFromBuilder } from '@/lib/content';

export async function generateMetadata() {
  const pageData = await getPageBuilderData('contact');
  return pageMetadataFromBuilder(pageData, {
    title:'Contact & Free Quote',
    description:'Request a moving, delivery or commercial transport quote from Sunwings Transport.',
    canonical:'/contact',
  });
}

export default async function ContactPage() {
  const [services, settings, pageData] = await Promise.all([getServices(), getSiteSettings(), getPageBuilderData('contact')]);
  if (pageData) {
    return <PageBlocks data={pageData} pageId="contact" services={services} settings={settings}/>;
  }
  const phoneDigits = String(settings.phone || '6475265132').replace(/\D/g,'');
  return (
    <>
      <PageHero
        crumbs={[{label:'Home',href:'/'},{label:'Contact'}]}
        title="Contact Sunwings Transport"
        description="Have a question about moving, delivery or commercial transport? Send us a message or call us."
        image="https://sunwingstransport.ca/wp-content/uploads/elementor/thumbs/happy-couple-move-rjw992tbb61z2n9hhbnvscs9srjnmxwvlts7dp1qbi.jpg"
        phone={settings.phone}
        ctas={false}
      />
      <section className="section">
        <div className="container with-side">
          <ContactForm services={services}/>
          <aside className="side">
            <div className="side-card">
              <h3>Call or text</h3>
              <a className="btn btn-accent" style={{width:'100%'}} href={`tel:+1${phoneDigits}`}>{settings.phone || '1-800-555-0123'}</a>
            </div>
            <div className="side-card"><h3>Service area</h3><p className="muted">Toronto, the GTA, Halton, Hamilton &amp; Niagara</p><a className="more" href="/locations">See all areas →</a></div>
          </aside>
        </div>
      </section>
    </>
  );
}
