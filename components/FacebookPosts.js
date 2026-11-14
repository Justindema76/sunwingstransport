// "Latest from Facebook" on the homepage: posts synced in Admin › Integrations.
// Shows nothing until posts exist (or when "Show this on the Sunwings website" is off).
const FEED_URL = 'https://admin.justindematteis.com/api/public/sunwings-facebook-posts';

async function loadPosts() {
  try {
    const response = await fetch(FEED_URL, { next: { revalidate: 300 } });
    if (!response.ok) return [];
    const data = await response.json();
    return data?.enabled && Array.isArray(data.posts) ? data.posts : [];
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

export default async function FacebookPosts() {
  const posts = (await loadPosts()).filter(post => post.message || post.image_url).slice(0, 3);
  if (!posts.length) return null;
  return (
    <section className="section section-soft">
      <div className="container">
        <div className="section-head">
          <span className="kicker">On Facebook</span>
          <h2>Latest from Sunwings</h2>
        </div>
        <div className="grid-3" style={{ alignItems: 'start' }}>
          {posts.map(post => (
            <a className="card post-card" href={post.permalink_url || 'https://www.facebook.com/'} target="_blank" rel="noopener noreferrer" key={post.external_id}>
              {post.image_url ? <div className="card-img ph" style={{ backgroundImage: `url("${post.image_url}")` }}/> : null}
              <div className="card-body tight">
                {post.message ? <p>{clip(post.message)}</p> : null}
                <div className="meta">{[shortDate(post.published_at), 'View on Facebook →'].filter(Boolean).join(' · ')}</div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
