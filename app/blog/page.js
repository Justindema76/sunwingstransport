import BlogCards from '@/components/BlogCards';
import PageHero from '@/components/PageHero';
import PageBlocks from '@/components/PageBlocks';
import { getPageBuilderData, getSiteSettings } from '@/lib/content';

export const metadata = {
  title:'Moving Tips & Guides',
  description:'Moving tips, pricing guides and delivery advice from Sunwings Transport.',
  alternates:{canonical:'/blog'},
};

export default async function BlogPage() {
  const [settings, pageData] = await Promise.all([getSiteSettings(), getPageBuilderData('blog')]);
  if (pageData) {
    return <PageBlocks data={pageData} pageId="blog" settings={settings}/>;
  }
  return (
    <>
      <PageHero
        crumbs={[{label:'Home',href:'/'},{label:'Moving Tips'}]}
        title="Moving tips & guides"
        description="Straight advice on pricing, condo moves, deliveries and planning your move."
        image="https://sunwingstransport.ca/wp-content/uploads/2026/02/pexels-photo-7464708-7464708.jpg"
        phone={settings.phone}
        ctas={false}
      />
      <section className="section">
        <div className="container">
          <div className="chips" style={{marginBottom:28}}>
            <span className="chip" style={{background:'var(--navy)',color:'#fff'}}>All</span>
            <span className="chip">Pricing</span>
            <span className="chip">Guides</span>
            <span className="chip">Delivery</span>
            <span className="chip">Business</span>
          </div>
          <BlogCards/>
        </div>
      </section>
    </>
  );
}
