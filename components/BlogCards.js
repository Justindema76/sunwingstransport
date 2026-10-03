import Link from 'next/link';

function formatDate(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString('en-CA', { month: 'short', year: 'numeric' });
}

function readTime(body = '') {
  const words = String(body || '').replace(/<[^>]+>/g, ' ').trim().split(/\s+/).filter(Boolean).length;
  return words ? `${Math.max(1, Math.ceil(words / 220))} min` : '';
}

export default function BlogCards({ posts = [] }) {
  if (!posts.length) return null;

  return (
    <div className="grid-3">
      {posts.map(post => (
        <Link className="card post-card" href={`/blog/${post.slug}`} key={post.slug}>
          <div className="card-img ph" style={post.image ? { backgroundImage:`url("${post.image}")` } : undefined}/>
          <div className="card-body tight">
            {post.tag ? <span className="tag">{post.tag}</span> : null}
            <h3>{post.title}</h3>
            {post.excerpt ? <p>{post.excerpt}</p> : null}
            <div className="meta">
              {[post.date || formatDate(post.publishedAt), post.read || readTime(post.body)].filter(Boolean).join(' · ')}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
