import { getSiteSettings } from '@/lib/content';

// "What customers say" on the homepage: rating + latest Google reviews, synced in
// Admin › Integrations › Sync Google Reviews (saved as the "google_reviews" setting).
// Shows nothing until reviews have been synced.
const REVIEWS_LINK = 'https://search.google.com/local/reviews?placeid=ChIJXTBVHE3zTkcRiUEmU5P3CsI';

function readSnapshot(value) {
  try {
    const data = typeof value === 'string' ? JSON.parse(value) : value;
    return data && Array.isArray(data.reviews) ? data : null;
  } catch {
    return null;
  }
}

function clip(text = '', max = 260) {
  const clean = String(text).replace(/\s+/g, ' ').trim();
  return clean.length > max ? `${clean.slice(0, max).replace(/\s+\S*$/, '')}…` : clean;
}

export default async function GoogleReviews() {
  const settings = await getSiteSettings();
  const data = readSnapshot(settings.google_reviews);
  const reviews = (data?.reviews || []).filter(review => review.text && review.stars >= 4).slice(0, 3);
  if (!reviews.length) return null;
  const link = data.url || REVIEWS_LINK;
  return (
    <section className="section">
      <div className="container">
        <div className="section-head">
          <span className="kicker">Google reviews</span>
          <h2>What customers say</h2>
          {data.rating ? <p><span className="stars" aria-hidden="true">★★★★★</span> <b>{data.rating.toFixed(1)}</b> out of 5 from {data.count} Google ratings</p> : null}
        </div>
        <div className="grid-3" style={{ alignItems: 'start' }}>
          {reviews.map((review, i) => (
            <div className="rev" key={i}>
              <div className="stars" aria-label={`${review.stars} out of 5 stars`}>{'★'.repeat(review.stars)}</div>
              <p>{clip(review.text)}</p>
              <div className="who">
                <div className="avatar">{review.name.charAt(0).toUpperCase()}</div>
                <div><strong>{review.name}</strong>{review.when ? <small style={{ display: 'block', fontWeight: 500, color: 'var(--muted)' }}>{review.when} on Google</small> : null}</div>
              </div>
            </div>
          ))}
        </div>
        <p style={{ marginTop: 22, fontWeight: 700 }}><a href={link} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--blue)' }}>Read all reviews on Google →</a></p>
      </div>
    </section>
  );
}
