// Facebook posts synced in Admin › Integrations. Used for the "Latest from Sunwings" section
// (a few posts + "See all posts") and the full posts page (all=true). Shows nothing until posts
// exist (or when "Show this on the Sunwings website" is off).
const FEED_URL = 'https://admin.justindematteis.com/api/public/sunwings-facebook-posts';

export async function loadFacebookPosts(limit = 6) {
  try {
    const response = await fetch(`${FEED_URL}?limit=${limit}`, { next: { revalidate: 300 } });
    if (!response.ok) return [];
    const data = await response.json();
    const posts = data?.enabled && Array.isArray(data.posts) ? data.posts : [];
    return posts.filter(post => post.message || post.image_url);
  } catch {
    return [];
  }
}

function shortDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' });
}

function clip(text = '', max = 160) {
  const clean = String(text).replace(/\s+/g, ' ').trim();
  return clean.length > max ? `${clean.slice(0, max).replace(/\s+\S*$/, '')}…` : clean;
}

export function FacebookGrid({ posts = [], full = false }) {
  return (
    <div className="grid-3" style={{ alignItems: 'start' }}>
      {posts.map(post => (
        <a className="card post-card" href={post.permalink_url || 'https://www.facebook.com/'} target="_blank" rel="noopener noreferrer" key={post.external_id}>
          {post.image_url ? <div className="card-img ph" style={{ backgroundImage: `url("${post.image_url}")` }}/> : null}
          <div className="card-body tight">
            {post.message ? <p>{full ? clip(post.message, 420) : clip(post.message)}</p> : null}
            <div className="meta">{[shortDate(post.published_at), 'View on Facebook'].filter(Boolean).join(' · ')}</div>
          </div>
        </a>
      ))}
    </div>
  );
}

// viewAllHref: the full posts page for this part of the site (/facebook or /hamilton-niagara/facebook).
export default async function FacebookPosts({ viewAllHref = '/facebook', count = 3 }) {
  const all = await loadFacebookPosts(12);
  const posts = all.slice(0, count);
  if (!posts.length) return null;
  return (
    <section className="section section-soft">
      <div className="container">
        <div className="section-head">
          <span className="kicker">On Facebook</span>
          <h2>Latest from Sunwings</h2>
        </div>
        <FacebookGrid posts={posts}/>
        {viewAllHref ? (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 28 }}>
            <a className="btn btn-navy" href={viewAllHref}>See all posts</a>
          </div>
        ) : null}
      </div>
    </section>
  );
}
