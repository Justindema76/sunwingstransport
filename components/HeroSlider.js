'use client';

import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';

const INTERVAL_MS = 7000;

// Homepage hero carousel. Slides are rendered on the server and passed in;
// this only handles which one is showing.
export default function HeroSlider({ slides = [] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [stopped, setStopped] = useState(false);
  const count = slides.length;

  useEffect(() => {
    if (count < 2 || paused || stopped) return undefined;
    if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return undefined;
    const timer = window.setInterval(() => setIndex(current => (current + 1) % count), INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [count, paused, stopped]);

  if (!count) return null;
  const go = next => setIndex((next + count) % count);

  return (
    <section
      className="hero hero-slider"
      aria-roledescription="carousel"
      aria-label="Sunwings services"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="hero-slides">
        {slides.map((slide, i) => (
          <div
            className={`hero-slide ${i === index ? 'is-active' : ''}`}
            style={slide.style}
            key={slide.key}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${count}`}
            aria-hidden={i !== index}
            inert={i !== index ? '' : undefined}
          >
            {slide.imageAlt ? <span className="sr-only" role="img" aria-label={slide.imageAlt}/> : null}
            <div className="container">
              <div className="hero-inner">{slide.content}</div>
            </div>
          </div>
        ))}
      </div>

      {count > 1 ? (
        <div className="hero-slider-controls">
          <button type="button" className="hero-slider-arrow" onClick={() => go(index - 1)} aria-label="Previous slide"><ChevronLeft size={20}/></button>
          <div className="hero-slider-dots">
            {slides.map((slide, i) => (
              <button
                type="button"
                key={slide.key}
                className={i === index ? 'is-active' : ''}
                onClick={() => go(i)}
                aria-label={`Show slide ${i + 1}`}
                aria-current={i === index}
              />
            ))}
          </div>
          <button type="button" className="hero-slider-arrow" onClick={() => go(index + 1)} aria-label="Next slide"><ChevronRight size={20}/></button>
          <button type="button" className="hero-slider-arrow" onClick={() => setStopped(value => !value)} aria-label={stopped ? 'Play slideshow' : 'Pause slideshow'} aria-pressed={stopped}>
            {stopped ? <Play size={18}/> : <Pause size={18}/>}
          </button>
        </div>
      ) : null}

      <svg className="wave" viewBox="0 0 1440 70" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0 40c240-40 480-40 720 0s480 40 720 0v30H0z" fill="#fff"/>
      </svg>
    </section>
  );
}
