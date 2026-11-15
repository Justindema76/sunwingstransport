import BlogArchive from '@/components/BlogArchive';
import PageHero from '@/components/PageHero';
import { getBlogPosts, getSiteSettings } from '@/lib/content';
import { HN, getHnContent, hnMetadata } from '@/lib/hamiltonNiagara';

// Moving Tips in the Hamilton & Niagara section: posts set to "Both" or "Hamilton & Niagara" in the admin.
export function generateMetadata() {
  return hnMetadata('blog', `${HN}/blog`);
}

export default async function HnBlogPage() {
  const [settings, posts, content] = await Promise.all([getSiteSettings(), getBlogPosts({ area: 'hn' }), getHnContent()]);
  return (
    <>
      <PageHero
        placement="hamilton-niagara"
        crumbs={[{ label: 'Home', href: HN }, { label: 'Moving Tips' }]}
        title="Moving tips & guides"
        description="Straight advice on pricing, long-distance moves and deliveries in Hamilton, Burlington and Niagara."
        image={content.home.image}
        phone={settings.phone}
        ctas={false}
      />
      <section className="section">
        <div className="container">
          {posts.length ? <BlogArchive posts={posts} basePath={`${HN}/blog`}/> : <div className="empty-state">No published Moving Tips yet.</div>}
        </div>
      </section>
    </>
  );
}
