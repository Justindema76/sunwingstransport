export default function ReviewsBlock(props = {}) {
  const reviews = [1, 2, 3].map(n => ({
    text: props[`review${n}Text`] || '',
    name: props[`review${n}Name`] || 'Google customer',
    stars: Math.min(5, Math.max(1, Number(props[`review${n}Stars`] || 5))),
  })).filter(review => review.text);

  if (!reviews.length) return null;

  return (
    <div className="grid-3">
      {reviews.map((review, i) => (
        <div className="rev" key={i}>
          <div className="stars">{'★'.repeat(review.stars)}</div>
          <p>{review.text}</p>
          <div className="who"><div className="avatar">{review.name.charAt(0).toUpperCase()}</div>{review.name}</div>
        </div>
      ))}
    </div>
  );
}
