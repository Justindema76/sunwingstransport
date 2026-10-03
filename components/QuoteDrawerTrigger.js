'use client';

export default function QuoteDrawerTrigger({
  children = 'Request Quote',
  className = '',
  preset = '',
}) {
  function openDrawer() {
    window.dispatchEvent(new CustomEvent('sunwings:open-quote', {
      detail: { preset },
    }));
  }

  return (
    <button type="button" className={className} onClick={openDrawer}>
      {children}
    </button>
  );
}
