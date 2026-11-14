'use client';
import { useEffect, useRef } from 'react';

// Trustindex review widget (Google reviews). Their loader script draws the widget
// where its <script> tag sits, so the tag is added inside this box.
export default function TrustindexWidget({ id }) {
  const box = useRef(null);
  useEffect(() => {
    const el = box.current;
    if (!el || !id || el.querySelector('script')) return;
    const script = document.createElement('script');
    script.src = `https://cdn.trustindex.io/loader.js?${encodeURIComponent(id)}`;
    script.defer = true;
    script.async = true;
    el.appendChild(script);
  }, [id]);
  return <div ref={box} className="trustindex-box"/>;
}
