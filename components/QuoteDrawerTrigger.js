'use client';

export default function QuoteDrawerTrigger({
  children = 'Request Quote',
  className = '',
  preset = '',
  plan = '',
}) {
  function openDrawer() {
    window.dispatchEvent(new CustomEvent('sunwings:open-quote', {
      detail: { preset, plan },
    }));
  }

  return (
    <button type="button" className={className} onClick={openDrawer}>
      {children}
    </button>
  );
}
