'use client';

import { useEffect } from 'react';
import Script from 'next/script';

// Which part of the site an event belongs to: 'hamilton_niagara' (Justin's branch: on those
// pages, or visited them in the last 90 days, same rule as the quote form) or 'main'.
function siteSection() {
  if (window.location.pathname.startsWith('/hamilton-niagara')) return 'hamilton_niagara';
  try {
    if (Date.now() - Number(window.localStorage.getItem('sunwings_hn') || 0) < 90 * 86400000) return 'hamilton_niagara';
  } catch {
    // Storage blocked: only the current page counts.
  }
  return 'main';
}

export function trackEvent(name, params = {}) {
  if (typeof window === 'undefined') return;
  if (typeof window.gtag === 'function') window.gtag('event', name, { site_section: siteSection(), ...params });
}

export default function SiteAnalytics({ ga4 = '', metaPixel = '' }) {
  useEffect(() => {
    function click(event) {
      const link = event.target?.closest?.('a[href]');
      if (!link) return;
      const href = String(link.getAttribute('href') || '');
      if (/^tel:/i.test(href)) {
        const location = link.closest('.mobile-nav-panel') ? 'mobile_menu'
          : link.closest('.mbar') ? 'mobile_bottom_bar'
          : link.closest('header') ? 'header'
          : link.closest('.topbar') ? 'top_bar'
          : link.closest('footer') ? 'footer'
          : link.closest('.cta-band') ? 'footer_cta'
          : 'page_content';
        trackEvent('phone_click', {
          link_url: href,
          page_path: window.location.pathname,
          page_location: window.location.href,
          button_location: location,
        });
      }
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
