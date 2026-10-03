import Link from 'next/link';
import { notFound } from 'next/navigation';
import BlogCards from '@/components/BlogCards';
import PageHero from '@/components/PageHero';
import QuoteForm from '@/components/QuoteForm';
import { getBlogPostBySlug, getBlogPosts, getServices, getSiteSettings } from '@/lib/content';

function articleBody(body = '') {
  const value = String(body || '');
  const hasHtml = /<\/?[a-z][\s\S]*>/i.test(value);
  if (hasHtml) return <div dangerouslySetInnerHTML={{ __html: value }}/>;
  return value.split(/\n\s*\n/).filter(Boolean).map((paragraph, index) => <p key={index}>{paragraph}</p>);
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) return {};
  return {
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt || '',
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: 'article',
      title: post.seoTitle || post.title,
      description: post.seoDescription || post.excerpt || '',
      images: post.image ? [{ url: post.image, alt: post.title }] : [],
    },
  };
}

export default async function BlogPostPage({ params }) {
  const { slug } = await params;
  const [post, posts, services, settings] = await Promise.all([
    getBlogPostBySlug(slug),
    getBlogPosts(),
    getServices(),
    getSiteSettings(),
  ]);
  if (!post) notFound();

  const related = posts.filter(item => item.slug !== post.slug).slice(0, 3);
  const date = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString('en-CA', { month: 'long', day: 'numeric', year: 'numeric' })
    : '';

  return (
    <>
      <PageHero
        crumbs={[{label:'Home',href:'/'},{label:'Moving Tips',href:'/blog'},{label:post.tag || 'Article'}]}
        title={post.title}
        description={[date, post.author_name].filter(Boolean).join(' · ')}
        image={post.image}
        phone={settings.phone}
        ctas={false}
      />

      <section className="section">
        <div className="container with-side">
          <article className="prose">
            {post.excerpt ? <p className="lead-p">{post.excerpt}</p> : null}
            {post.image ? <div className="ph" style={{backgroundImage:`url("${post.image}")`,aspectRatio:'16/8',borderRadius:20,margin:'10px 0 26px'}}/> : null}
            {articleBody(post.body)}
            <div className="cta-inline">
              <div><h3>Need moving or delivery help?</h3><p>Send the details for an upfront quote.</p></div>
              <Link className="btn btn-accent" href="/contact">Get a Quote →</Link>
            </div>
          </article>

          <aside className="side">
            <QuoteForm services={services} compact/>
          </aside>
        </div>
      </section>

      {related.length ? (
        <section className="section section-soft">
          <div className="container">
            <div className="section-head"><h2>More moving tips</h2></div>
            <BlogCards posts={related}/>
          </div>
        </section>
      ) : null}
    </>
  );
}
