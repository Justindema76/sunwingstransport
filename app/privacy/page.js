import PageHero from '@/components/PageHero';
import PageBlocks from '@/components/PageBlocks';
import { getPageBuilderData, pageMetadataFromBuilder } from '@/lib/content';

export async function generateMetadata() {
  const pageData = await getPageBuilderData('privacy');
  return pageMetadataFromBuilder(pageData, {
    title:'Privacy Policy',
    description:'Sunwings Transport privacy policy.',
    canonical:'/privacy',
  });
}

export default async function PrivacyPage() {
  const pageData = await getPageBuilderData('privacy');
  if (pageData) return <PageBlocks data={pageData} pageId="privacy"/>;
  return (
    <>
      <PageHero crumbs={[{label:'Home',href:'/'},{label:'Privacy Policy'}]} title="Privacy Policy" ctas={false}/>
      <section className="section">
        <div className="container prose" style={{maxWidth:820}}>
          <p>Sunwings Transport uses information submitted through this website to respond to quote requests and service enquiries.</p>
          <p>Additional privacy terms can be added here before the production launch.</p>
        </div>
      </section>
    </>
  );
}
