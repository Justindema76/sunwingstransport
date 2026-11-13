'use client';

import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';

// Round button bottom-right that appears once the visitor has scrolled down a screen.
export default function BackToTop() {
  const [on, setOn] = useState(false);

  useEffect(() => {
    const check = () => setOn(window.scrollY > window.innerHeight * 0.8);
    check();
    window.addEventListener('scroll', check, { passive: true });
    return () => window.removeEventListener('scroll', check);
  }, []);

  function toTop() {
    const smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: smooth ? 'smooth' : 'auto' });
  }

  return <button type="button" className={`back-to-top${on ? ' is-on' : ''}`} onClick={toTop} aria-label="Back to top" tabIndex={on ? 0 : -1}>
    <ArrowUp size={20}/>
  </button>;
}
