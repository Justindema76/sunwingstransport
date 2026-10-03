import Link from 'next/link';
import { notFound } from 'next/navigation';
import BlogCards from '@/components/BlogCards';
import PageHero from '@/components/PageHero';
import QuoteForm from '@/components/QuoteForm';
import { getBaseUrl, getBlogPostBySlug, getBlogPosts, getServices, getSiteSettings } from '@/lib/content';

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function headingSlug(value = '') {
  return String(value)
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z0-9#]+;/gi, ' ')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'section';
}

function prepareArticle(body = '') {
  const raw = String(body || '').trim();
  if (!raw) return { html: '', toc: [] };

  let html = raw;
  if (!/<\/?[a-z][\s\S]*>/i.test(raw)) {
    const blocks = [];
    const lines = raw.split(/\r?\n/);
    let paragraph = [];
    let list = [];

    const flushParagraph = () => {
      if (!paragraph.length) return;
      blocks.push(`<p>${paragraph.map(escapeHtml).join(' ')}</p>`);
      paragraph = [];
    };
    const flushList = () => {
      if (!list.length) return;
      blocks.push(`<ul>${list.map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`);
      list = [];
    };

    for (const line of lines) {
      const value = line.trim();
      if (!value) {
        flushParagraph();
        flushList();
        continue;
      }
      if (value.startsWith('### ')) {
        flushParagraph(); flushList();
        blocks.push(`<h3>${escapeHtml(value.slice(4))}</h3>`);
      } else if (value.startsWith('## ')) {
        flushParagraph(); flushList();
        blocks.push(`<h2>${escapeHtml(value.slice(3))}</h2>`);
      } else if (/^[-*]\s+/.test(value)) {
        flushParagraph();
        list.push(value.replace(/^[-*]\s+/, ''));
      } else {
        flushList();
        paragraph.push(value);
      }
    }
    flushParagraph();
    flushList();
    html = blocks.join('\n');
  }

  const toc = [];
  const seen = new Map();
  html = html.replace(/<h([23])([^>]*)>([\s\S]*?)<\/h\1>/gi, (match, level, attrs, inner) => {
    const text = inner.replace(/<[^>]+>/g, '').trim();
    if (!text) return match;
    const base = headingSlug(text);
    const count = (seen.get(base) || 0) + 1;
    seen.set(base, count);
    const id = count > 1 ? `${base}-${count}` : base;
    toc.push({ id, text, level: Number(level) });
    const cleanAttrs = String(attrs || '').replace(/\sid=(["']).*?\1/i, '');
    return `<h${level}${cleanAttrs} id="${id}">${inner}</h${level}>`;
  });

  return { html, toc };
}

function estimateReadTime(body = '') {
  const words = String(body || '').replace(/<[^>]+>/g, ' ').trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 220));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) return {};
  return {
    title: post.seoTitle ? { absolute: post.seoTitle } : post.title,
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
  const article = prepareArticle(post.body);
  const date = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString('en-CA', { month: 'long', day: 'numeric', year: 'numeric' })
    : '';
  const read = `${estimateReadTime(post.body)} min read`;
  const articleSchema = {
    '@context':'https://schema.org',
    '@type':'Article',
    headline:post.title,
    description:post.seoDescription || post.excerpt || '',
    image:post.image || undefined,
    datePublished:post.publishedAt || undefined,
    dateModified:post.updated_at || post.publishedAt || undefined,
    author:{ '@type':'Organization', name:post.author_name || 'Sunwings Transport' },
    publisher:{ '@type':'Organization', name:settings.site_name || 'Sunwings Transport', url:getBaseUrl() },
    mainEntityOfPage:`${getBaseUrl()}/blog/${post.slug}`,
  };
  const bodySections = article.html ? article.html.split(/(?=<h2\b)/i) : [];
  const firstPart = bodySections.slice(0, Math.min(2, bodySections.length)).join('');
  const remainingPart = bodySections.slice(Math.min(2, bodySections.length)).join('');

  return (
    <>
      <PageHero
        crumbs={[{label:'Home',href:'/'},{label:'Moving Tips',href:'/blog'},{label:post.tag || 'Article'}]}
        title={post.title}
        description={[post.author_name || 'Sunwings Transport', date, read].filter(Boolean).join(' · ')}
        image={post.image}
        phone={settings.phone}
        ctas={false}
      />

      <section className="section">
        <div className="container with-side">
          <article className="prose article-prose">
            {post.excerpt ? <p className="lead-p">{post.excerpt}</p> : null}
            {post.image ? <div className="ph article-featured" style={{backgroundImage:`url("${post.image}")`}}/> : null}

            {firstPart ? <div dangerouslySetInnerHTML={{ __html:firstPart }}/> : null}

            <div className="cta-inline">
              <div><h3>Want your exact number?</h3><p>Send the details for an upfront quote.</p></div>
              <Link className="btn btn-accent" href="/contact">Get a Quote →</Link>
            </div>

            {remainingPart ? <div dangerouslySetInnerHTML={{ __html:remainingPart }}/> : null}

            <div className="note-box">
              Related: <Link href="/pricing">Sunwings pricing</Link> · <Link href="/services/residential-moving">Residential moving</Link>
            </div>
          </article>

          <aside className="side">
            {article.toc.length ? (
              <div className="side-card toc">
                <h3>On this page</h3>
                {article.toc.map(item => (
                  <a className={item.level === 3 ? 'toc-sub' : ''} href={`#${item.id}`} key={item.id}>{item.text}</a>
                ))}
              </div>
            ) : null}
            <QuoteForm services={services} compact replyHours={settings.quote_reply_hours}/>
          </aside>
        </div>
      </section>

      <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(articleSchema)}}/>

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
