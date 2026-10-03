import PageBlocks from '@/components/PageBlocks';
import ContactForm from '@/components/ContactForm';
import { getPageBuilderData, getServices, getSiteSettings, pageMetadataFromBuilder } from '@/lib/content';

export async function generateMetadata() {
  const pageData = await getPageBuilderData('contact');
  return pageMetadataFromBuilder(pageData, {
    title:'Contact Sunwings Transport',
    description:'Contact Sunwings Transport with questions about moving, delivery and commercial transport services.',
    canonical:'/contact',
  });
}

export default async function ContactPage() {
  const [services, settings, pageData] = await Promise.all([getServices(), getSiteSettings(), getPageBuilderData('contact')]);
  if (pageData) {
    return <PageBlocks data={pageData} pageId="contact" services={services} settings={settings}/>;
  }
  const phoneDigits = String(settings.phone || '18005555555').replace(/\D/g,'');
  return (
    <section className="section contact-page-section">
      <div className="container with-side contact-layout">
        <ContactForm services={services}/>
        <aside className="side">
          <div className="side-card">
            <h3>Call or text</h3>
            <a className="btn btn-accent" style={{width:'100%'}} href={`tel:+1${phoneDigits}`}>{settings.phone || '1-800-555-5555'}</a>
          </div>
          <div className="side-card"><h3>Service area</h3><p className="muted">Toronto, the GTA, Halton, Hamilton &amp; Niagara</p><a className="more" href="/locations">See all areas →</a></div>
        </aside>
      </div>
    </section>
  );
}
