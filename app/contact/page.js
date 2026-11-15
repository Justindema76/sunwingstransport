import PageBlocks from '@/components/PageBlocks';
import PageHero from '@/components/PageHero';
import { photoSettings } from '@/components/heroSlides';
import { getSiteContent } from '@/lib/siteContent';
import ContactForm from '@/components/ContactForm';
import { getPageBuilderData, getServices, getSiteSettings, pageMetadataFromBuilder } from '@/lib/content';
import { telHref } from '@/lib/phone';

export async function generateMetadata() {
  const pageData = await getPageBuilderData('contact');
  return pageMetadataFromBuilder(pageData, {
    title:'Contact Sunwings Transport',
    description:'Contact Sunwings Transport with questions about moving, delivery and commercial transport services.',
    canonical:'/contact',
  });
}

async function ContactHero({ settings, home = '/' }) {
  const copy = (await getSiteContent()).pageBanners.contact;
  return (
    <PageHero placement="contact"
      crumbs={[{ label: 'Home', href: home }, { label: 'Contact' }]}
      eyebrow={copy.eyebrow}
      title={copy.heading}
      accent={copy.accent}
      description={copy.text}
      image={copy.image}
      imagePosition={photoSettings(copy)}
      phone={settings.phone}
    />
  );
}

export default function ContactPage() {
  return <ContactContent/>;
}

// Also used by the Hamilton & Niagara section (/hamilton-niagara/contact): its own page from the
// admin's visual editor (page id "hn-contact") when one is saved, otherwise the main Contact page.
export async function ContactContent({ pageId = 'contact', home = '/' }) {
  const [services, settings, ownPage] = await Promise.all([getServices(), getSiteSettings(), getPageBuilderData(pageId)]);
  const pageData = ownPage || (pageId !== 'contact' ? await getPageBuilderData('contact') : null);
  if (pageData) {
    return (
      <>
        <ContactHero settings={settings} home={home}/>
        <PageBlocks data={pageData} pageId="contact" services={services} settings={settings}/>
      </>
    );
  }
  return (
    <>
    <ContactHero settings={settings} home={home}/>
    <section className="section contact-page-section">
      <div className="container with-side contact-layout">
        <ContactForm services={services}/>
        <aside className="side">
          <div className="side-card">
            <h3>Call us</h3>
            <a className="btn btn-accent" style={{width:'100%'}} href={telHref(settings.phone)}>Call Now</a>
          </div>
          <div className="side-card"><h3>Service area</h3><p className="muted">Toronto, the GTA, Halton, Hamilton &amp; Niagara</p><a className="more" href="/locations">See all areas →</a></div>
        </aside>
      </div>
    </section>
    </>
  );
}
