'use client';

export default function QuoteDrawerTrigger({
  children = 'Request Quote',
  className = '',
  preset = '',
  plan = '',
  fill = null, // e.g. { pickupCity: 'Hamilton', dropoffCity: 'Toronto' }
}) {
  function openDrawer() {
    window.dispatchEvent(new CustomEvent('sunwings:open-quote', {
      detail: { preset, plan, fill },
    }));
  }

  return (
    <button type="button" className={className} onClick={openDrawer}>
      {children}
    </button>
  );
}
