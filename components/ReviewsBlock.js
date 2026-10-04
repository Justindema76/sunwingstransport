export default function ReviewsBlock(props = {}) {
  const placeholders = [
    { text:'Preview Google review — The crew arrived on time, handled everything carefully and made the move straightforward from start to finish.', name:'Google Customer', stars:5 },
    { text:'Preview Google review — Great communication, professional service and careful handling. Everything arrived exactly where it needed to go.', name:'Google Customer', stars:5 },
    { text:'Preview Google review — Fast, friendly and reliable. The team made pickup and delivery easy and kept us updated throughout the job.', name:'Google Customer', stars:5 },
  ];

  const configured = [1, 2, 3].map(n => ({
    text: props[`review${n}Text`] || '',
    name: props[`review${n}Name`] || 'Google Customer',
    stars: Math.min(5, Math.max(1, Number(props[`review${n}Stars`] || 5))),
  })).filter(review => review.text);

  const reviews = configured.length ? configured : placeholders;

  return (
    <div className="grid-3">
      {reviews.map((review, i) => (
        <div className="rev" key={i}>
          <div className="stars">{'★'.repeat(review.stars)}</div>
          <p>{review.text}</p>
          <div className="who">
            <div className="avatar">{review.name.charAt(0).toUpperCase()}</div>
            <div><strong>{review.name}</strong>{configured.length ? null : <small className="review-preview-label">Preview placeholder</small>}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
