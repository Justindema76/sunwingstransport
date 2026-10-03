import PageHero from '@/components/PageHero';

export const metadata = {
  title:'Privacy Policy',
  alternates:{canonical:'/privacy'},
};

export default function PrivacyPage() {
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
