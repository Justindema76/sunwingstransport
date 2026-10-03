'use client';

import { useMemo, useState } from 'react';
import BlogCards from './BlogCards';

const DEFAULT_CATEGORIES = ['Pricing', 'Guides', 'Delivery', 'Business'];

export default function BlogArchive({ posts = [] }) {
  const categories = useMemo(() => {
    const actual = posts.map(post => String(post.tag || post.category || '').trim()).filter(Boolean);
    return ['All', ...Array.from(new Set([...DEFAULT_CATEGORIES, ...actual]))];
  }, [posts]);

  const [active, setActive] = useState('All');
  const filtered = active === 'All'
    ? posts
    : posts.filter(post => String(post.tag || post.category || '').toLowerCase() === active.toLowerCase());

  return (
    <>
      <div className="chips blog-filters" aria-label="Moving Tips categories">
        {categories.map(category => (
          <button
            className={`chip blog-filter ${active === category ? 'active' : ''}`}
            type="button"
            key={category}
            onClick={() => setActive(category)}
          >
            {category}
          </button>
        ))}
      </div>
      {filtered.length
        ? <BlogCards posts={filtered}/>
        : <div className="empty-state">No published Moving Tips in {active === 'All' ? 'this section' : active} yet.</div>}
    </>
  );
}
