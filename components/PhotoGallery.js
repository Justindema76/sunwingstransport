'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

// Photo grid that opens a large view over the page (no leaving the page).
// photos: [{ thumb, full, alt, caption }]
export default function PhotoGallery({ photos = [] }) {
  const [index, setIndex] = useState(-1);
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

  return (
    <>
      <div className="grid-3">
        {photos.map((item, i) => (
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
        ))}
      </div>

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
