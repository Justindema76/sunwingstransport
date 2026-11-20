'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight, X } from 'lucide-react';
import './photoGallery.css';

// Photo grid that opens a large view over the page (no leaving the page).
// photos: [{ thumb, full, alt, caption }]
// initial: show this many, with the rest in a dropdown under them (the large view still goes through all).
export default function PhotoGallery({ photos = [], initial = 0 }) {
  const [index, setIndex] = useState(-1);
  const [more, setMore] = useState(false);
  const open = index >= 0;
  const touchX = useRef(null);
  const closeRef = useRef(null);
  const lastFocus = useRef(null);

  const close = useCallback(() => setIndex(-1), []);
  const step = useCallback(dir => setIndex(current => (current + dir + photos.length) % photos.length), [photos.length]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = event => {
      if (event.key === 'Escape') close();
      else if (event.key === 'ArrowRight') step(1);
      else if (event.key === 'ArrowLeft') step(-1);
    };
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener('keydown', onKey);
      lastFocus.current?.focus?.();
    };
  }, [open, close, step]);

  const photo = open ? photos[index] : null;
  const extra = initial ? photos.slice(initial) : [];
  const thumb = (item, i) => (
    <figure key={item.full} style={{ margin: 0 }}>
      <button
        type="button"
        className="photo-gallery-thumb"
        onClick={event => { lastFocus.current = event.currentTarget; setIndex(i); }}
        aria-label={`View larger: ${item.alt}`}
      >
        <img src={item.thumb} alt={item.alt} width="640" height="640" loading="lazy" decoding="async"/>
      </button>
      {item.caption ? <figcaption style={{ marginTop: 12 }}>{item.caption}</figcaption> : null}
    </figure>
  );

  return (
    <>
      <div className="grid-3 photo-gallery-grid">
        {(initial ? photos.slice(0, initial) : photos).map((item, i) => thumb(item, i))}
      </div>
      {extra.length ? (
        <>
          <button type="button" className={`photo-gallery-more-btn ${more ? 'open' : ''}`} onClick={() => setMore(value => !value)} aria-expanded={more}>
            <span className="photo-gallery-more-faces" aria-hidden="true">
              {extra.slice(0, 3).map(item => <img key={item.full} src={item.thumb} alt=""/>)}
            </span>
            <span>{more ? 'Hide' : 'View'} {extra.length} more job photo{extra.length > 1 ? 's' : ''}</span>
            <ChevronDown size={18}/>
          </button>
          <div className={`photo-gallery-more ${more ? 'open' : ''}`} aria-hidden={!more} inert={more ? undefined : true}>
            <div>
              <div className="grid-3 photo-gallery-grid">
                {extra.map((item, i) => thumb(item, i + initial))}
              </div>
            </div>
          </div>
        </>
      ) : null}

      {photo ? (
        <div
          className="photo-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={photo.alt}
          onClick={event => { if (event.target === event.currentTarget) close(); }}
          onTouchStart={event => { touchX.current = event.touches[0].clientX; }}
          onTouchEnd={event => {
            if (touchX.current == null) return;
            const dx = event.changedTouches[0].clientX - touchX.current;
            touchX.current = null;
            if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
          }}
        >
          <button ref={closeRef} type="button" className="photo-lightbox-close" onClick={close} aria-label="Close photo"><X size={24}/></button>
          {photos.length > 1 ? <button type="button" className="photo-lightbox-nav prev" onClick={() => step(-1)} aria-label="Previous photo"><ChevronLeft size={28}/></button> : null}
          <figure className="photo-lightbox-figure">
            <img src={photo.full} alt={photo.alt}/>
            <figcaption>{photo.caption ? `${photo.caption} · ` : ''}{index + 1} / {photos.length}</figcaption>
          </figure>
          {photos.length > 1 ? <button type="button" className="photo-lightbox-nav next" onClick={() => step(1)} aria-label="Next photo"><ChevronRight size={28}/></button> : null}
        </div>
      ) : null}
    </>
  );
}
