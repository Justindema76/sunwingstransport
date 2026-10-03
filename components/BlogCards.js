import Link from 'next/link';

export const MOCK_POSTS = [
  {
    slug:'how-much-do-movers-cost',
    tag:'Pricing',
    title:'How much do movers cost in Toronto & Hamilton?',
    image:'https://sunwingstransport.ca/wp-content/uploads/elementor/thumbs/happy-couple-move-rjw992tbb61z2n9hhbnvscs9srjnmxwvlts7dp1qbi.jpg',
    date:'Oct 2026',
    read:'6 min',
    excerpt:'A plain-English breakdown of hourly rates, truck fees and what actually changes your price.',
  },
  {
    slug:'condo-move-checklist',
    tag:'Guides',
    title:'Condo move checklist: elevators, parking & building rules',
    image:'https://sunwingstransport.ca/wp-content/uploads/2026/02/van-loading-file-cabinet.jpg',
    date:'Oct 2026',
    read:'5 min',
    excerpt:'Everything to book and confirm before moving into or out of a GTA condo.',
  },
  {
    slug:'marketplace-furniture-pickup',
    tag:'Delivery',
    title:'Bought furniture on Marketplace? How to get it home',
    image:'https://sunwingstransport.ca/wp-content/uploads/2026/02/pexels-photo-7464708-7464708.jpg',
    date:'Sep 2026',
    read:'4 min',
    excerpt:'What to check before you pay and how same-week pickup works.',
  },
];

export default function BlogCards({ posts = MOCK_POSTS }) {
  return (
    <div className="grid-3">
      {posts.map(post => (
        <Link className="card post-card" href={`/blog/${post.slug}`} key={post.slug}>
          <div className="card-img ph" style={{ backgroundImage:`url("${post.image}")` }}/>
          <div className="card-body tight">
            <span className="tag">{post.tag}</span>
            <h3>{post.title}</h3>
            <p>{post.excerpt}</p>
            <div className="meta">{post.date} · {post.read} read</div>
          </div>
        </Link>
      ))}
    </div>
  );
}
