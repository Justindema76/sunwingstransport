import Link from 'next/link';
import { notFound } from 'next/navigation';
import BlogCards, { MOCK_POSTS } from '@/components/BlogCards';
import PageHero from '@/components/PageHero';
import QuoteForm from '@/components/QuoteForm';
import { getServices, getSiteSettings } from '@/lib/content';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = MOCK_POSTS.find(item => item.slug === slug);
  if (!post) return {};
  return {
    title:post.title,
    description:post.excerpt,
    alternates:{canonical:`/blog/${post.slug}`},
  };
}

export default async function BlogPostPage({ params }) {
  const { slug } = await params;
  const post = MOCK_POSTS.find(item => item.slug === slug);
  if (!post) notFound();

  const [services, settings] = await Promise.all([getServices(), getSiteSettings()]);
  const related = MOCK_POSTS.filter(item => item.slug !== post.slug);

  return (
    <>
      <PageHero
        crumbs={[{label:'Home',href:'/'},{label:'Moving Tips',href:'/blog'},{label:post.tag}]}
        title={post.title}
        description={`${post.date} · ${post.read} read`}
        image={post.image}
        phone={settings.phone}
        ctas={false}
      />

      <section className="section">
        <div className="container with-side">
          <article className="prose">
            <p className="lead-p">{post.excerpt}</p>
            <div className="ph" style={{backgroundImage:`url("${post.image}")`,aspectRatio:'16/8',borderRadius:20,margin:'10px 0 26px'}}/>
            <h2>The short answer</h2>
            <p>This article layout is ready for the real Sunwings content. The final article copy will be managed separately before launch.</p>
            <h2>What changes the price</h2>
            <ul><li>Crew size</li><li>Hours and minimums</li><li>Distance and travel</li><li>Stairs, elevators and long carries</li></ul>
            <div className="cta-inline">
              <div><h3>Want your exact number?</h3><p>Send the details for an upfront quote.</p></div>
              <Link className="btn btn-accent" href="/contact">Get a Quote →</Link>
            </div>
          </article>

          <aside className="side">
            <div className="side-card toc"><h3>On this page</h3><span className="muted">The short answer</span><br/><span className="muted">What changes the price</span></div>
            <QuoteForm services={services} compact/>
          </aside>
        </div>
      </section>

      <section className="section section-soft">
        <div className="container">
          <div className="section-head"><h2>More moving tips</h2></div>
          <BlogCards posts={related}/>
        </div>
      </section>
    </>
  );
}
