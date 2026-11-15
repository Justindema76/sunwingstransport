import PageHero from './PageHero';
import { FacebookGrid, loadFacebookPosts } from './FacebookPosts';
import { getSocialLinks } from '@/lib/content';

// The full list of Sunwings Facebook posts, for the main site and the Hamilton & Niagara section.
export default async function FacebookFeedPage({ settings = {}, home = '/', placement = 'facebook', fallbackImage = '' }) {
  const [posts, social] = await Promise.all([loadFacebookPosts(48), getSocialLinks()]);
  const facebookUrl = social?.facebook || '';
  return (
    <>
      <PageHero
        placement={placement}
        crumbs={[{ label: 'Home', href: home }, { label: 'Facebook posts' }]}
        title="Latest from Sunwings"
        description="Recent jobs, open spots and news, straight from our Facebook page."
        image={fallbackImage}
        phone={settings.phone}
        ctas={false}
      />
      <section className="section">
        <div className="container">
          {posts.length ? <FacebookGrid posts={posts} full/> : <div className="empty-state">No Facebook posts to show yet.</div>}
          {facebookUrl ? (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 28 }}>
              <a className="btn btn-navy" href={facebookUrl} target="_blank" rel="noopener noreferrer">Follow us on Facebook</a>
            </div>
          ) : null}
        </div>
      </section>
    </>
  );
}
