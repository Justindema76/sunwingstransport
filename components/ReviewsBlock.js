const REVIEWS = [
  { initial:'A', text:'Real Google review will appear here once the reviews feed is connected.' },
  { initial:'B', text:'Real Google review will appear here once the reviews feed is connected.' },
  { initial:'C', text:'Real Google review will appear here once the reviews feed is connected.' },
];

export default function ReviewsBlock() {
  return (
    <div className="grid-3">
      {REVIEWS.map(review => (
        <div className="rev" key={review.initial}>
          <div className="stars">★★★★★</div>
          <p>{review.text}</p>
          <div className="who"><div className="avatar">{review.initial}</div>Google customer</div>
        </div>
      ))}
    </div>
  );
}
