'use client';

import { useEffect } from 'react';
import Script from 'next/script';

export function trackEvent(name, params = {}) {
  if (typeof window === 'undefined') return;
  if (typeof window.gtag === 'function') window.gtag('event', name, params);
}

export default function SiteAnalytics({ ga4 = '', metaPixel = '' }) {
  useEffect(() => {
    function click(event) {
      const link = event.target?.closest?.('a[href]');
      if (!link) return;
      const href = String(link.getAttribute('href') || '');
      if (href.startsWith('tel:')) trackEvent('phone_click', { link_url: href });
      if (href.startsWith('mailto:')) trackEvent('email_click', { link_url: href });
    }
    document.addEventListener('click', click);
    return () => document.removeEventListener('click', click);
  }, []);

  return (
    <>
      {ga4 ? <>
        <Script src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(ga4)}`} strategy="afterInteractive"/>
        <Script id="sunwings-ga4" strategy="afterInteractive">{`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('js', new Date());
          gtag('config', '${String(ga4).replace(/'/g, '')}');
        `}</Script>
      </> : null}

      {metaPixel ? <Script id="sunwings-meta-pixel" strategy="afterInteractive">{`
        !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
        n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}
        (window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
        fbq('init','${String(metaPixel).replace(/'/g, '')}');
        fbq('track','PageView');
      `}</Script> : null}
    </>
  );
}
