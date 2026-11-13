'use client';

import { Children, useEffect, useState } from 'react';

// Flips the top bar between its lines on a timer. Pauses on hover or focus; stays put for reduced motion.
export default function TopbarFlip({ children, interval = 5000 }) {
  const lines = Children.toArray(children);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || lines.length < 2) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = setTimeout(() => setIndex(i => (i + 1) % lines.length), interval);
    return () => clearTimeout(timer);
  }, [index, paused, lines.length, interval]);

  return (
    <div className="topbar-flip" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}>
      {lines.map((line, i) => <div key={i} className={`topbar-line${i === index ? ' is-on' : i === (index + lines.length - 1) % lines.length ? ' is-out' : ''}`} aria-hidden={i !== index} inert={i !== index ? '' : undefined}>{line}</div>)}
    </div>
  );
}
