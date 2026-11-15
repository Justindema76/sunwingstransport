// Service Posts can carry photos typed into their page text: a single photo
// (<figure id="sunwings-service-photo">) and a photo grid (<section id="…-photo-gallery">).
// Typed in like that they show at odd sizes and open by leaving the page. This pulls them out
// so the page can show them in the proper gallery (same-size photos, opens over the page).

const attr = (tag, name) => (tag.match(new RegExp(`\\b${name}="([^"]*)"`, 'i')) || [])[1] || '';
const decode = text => String(text || '').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/<[^>]+>/g, '').trim();

// Supabase storage photos get resized copies: square thumbnails, large full view.
const sized = (url, width, height, resize) => (
  /\/storage\/v1\/object\/public\//.test(url)
    ? `${url.replace('/object/public/', '/render/image/public/').split('?')[0]}?width=${width}&height=${height}&resize=${resize}&quality=80`
    : url
);
const original = url => String(url || '').replace('/render/image/public/', '/object/public/').split('?')[0];

function photoFrom(imgTag, href = '') {
  const src = original(href || attr(imgTag, 'src'));
  if (!src) return null;
  return { thumb: sized(src, 640, 640, 'cover'), full: sized(src, 1600, 1600, 'contain'), alt: decode(attr(imgTag, 'alt')) || 'Sunwings Transport job photo' };
}

export function extractServicePhotos(html = '') {
  let rest = String(html || '');
  const photos = [];
  let title = '';

  rest = rest.replace(/<figure\b[^>]*id="sunwings-service-photo"[^>]*>([\s\S]*?)<\/figure>/gi, (whole, inner) => {
    const img = inner.match(/<img\b[^>]*>/i);
    const photo = img ? photoFrom(img[0]) : null;
    if (photo) photos.push(photo);
    return '';
  });

  rest = rest.replace(/<section\b[^>]*id="[^"]*photo-gallery"[^>]*>([\s\S]*?)<\/section>/gi, (whole, inner) => {
    title = title || decode((inner.match(/<h[23][^>]*>([\s\S]*?)<\/h[23]>/i) || [])[1]);
    for (const match of inner.matchAll(/(?:<a\b[^>]*href="([^"]+)"[^>]*>\s*)?(<img\b[^>]*>)/gi)) {
      const photo = photoFrom(match[2], match[1]);
      if (photo && !photos.some(item => item.full === photo.full)) photos.push(photo);
    }
    return '';
  });

  return { photos, title, html: rest.trim() };
}
