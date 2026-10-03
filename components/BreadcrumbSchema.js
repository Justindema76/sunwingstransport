export default function BreadcrumbSchema({ items = [], baseUrl = '' }) {
  const normalized = items
    .filter(item => item?.label)
    .map((item, index) => ({
      '@type':'ListItem',
      position:index + 1,
      name:item.label,
      item:item.href ? `${String(baseUrl || '').replace(/\/$/, '')}${item.href}` : undefined,
    }));

  if (!normalized.length) return null;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{__html:JSON.stringify({
        '@context':'https://schema.org',
        '@type':'BreadcrumbList',
        itemListElement:normalized,
      })}}
    />
  );
}
