'use client';

import { useEffect, useRef } from 'react';

// A banner made in Admin › Banner Studio (Code Studio). The markup comes from the server;
// its slider script runs here, because scripts in HTML added by React never run.
// A link to #quote opens the quote form.
export default function CodeStudioBanner({ markup = '', scripts = [] }) {
  const box = useRef(null);

  useEffect(() => {
    const node = box.current;
    if (!node) return undefined;
    // The slider script marks its banner as started, so running it twice is harmless.
    const added = scripts.map(code => {
      const script = document.createElement('script');
      script.text = code;
      node.appendChild(script);
      return script;
    });
    const onClick = event => {
      const link = event.target.closest?.('a[href]');
      if (!link || !/^#quote\b/i.test(link.getAttribute('href') || '')) return;
      event.preventDefault();
      window.dispatchEvent(new CustomEvent('sunwings:open-quote', { detail: {} }));
    };
    node.addEventListener('click', onClick);
    return () => {
      node.removeEventListener('click', onClick);
      added.forEach(script => script.remove());
    };
  }, [markup, scripts]);

  return <div className="code-studio-banner" ref={box} dangerouslySetInnerHTML={{ __html: markup }}/>;
}
