// Banner Studio: banners designed with Code Studio in the JustInnovate admin (Admin › Banner Studio).
// The admin saves each banner's finished HTML in code_studio_banners and tags the pages it shows on
// (placements). The website may read only that HTML.
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || '';
const SITE_KEY = 'sunwings';

// Splits the saved HTML into markup and its slider script(s). The project data comment
// (the editor's own copy of the slides) is dropped so it isn't sent to visitors.
export function splitBannerHtml(html = '') {
  const scripts = [];
  const markup = String(html)
    .replace(/<!--\s*JCS-PROJECT-DATA-BEGIN[\s\S]*?JCS-PROJECT-DATA-END\s*-->/g, '')
    .replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gi, (_, code) => { if (code.trim()) scripts.push(code); return ''; })
    .trim();
  return { markup, scripts };
}

// The banner placed on `placement` (e.g. 'home', 'contact'), or null to use the normal banner.
export async function getCodeStudioBanner(placement) {
  if (!placement || !SUPABASE_URL || !SUPABASE_ANON_KEY) return null;
  try {
    const query = `site_key=eq.${SITE_KEY}&placements=cs.%7B${encodeURIComponent(placement)}%7D&select=html_en&order=updated_at.desc&limit=1`;
    const response = await fetch(`${SUPABASE_URL}/rest/v1/code_studio_banners?${query}`, {
      headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
      next: { revalidate: 60 },
    });
    if (!response.ok) return null;
    const html = (await response.json())?.[0]?.html_en;
    return html ? splitBannerHtml(html) : null;
  } catch {
    return null;
  }
}
