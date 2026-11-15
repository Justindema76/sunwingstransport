import { CONTENT_DEFAULTS, HERO_IMAGE_OPTIONS, RETIRED_HERO_IMAGES } from '@/lib/contentDefaults';
import { HN_CONTENT_DEFAULTS } from '@/lib/hamiltonNiagara';
import { heroImage, movingPhotos, PHOTO_ROOT } from '@/lib/longDistancePhotos';

// Every stored file the live site uses, so Admin › Media can tag files "In use" / "Not used".
// Reads what the public site can read (published posts, settings, pages) plus photos set in the code.
export const dynamic = 'force-dynamic';

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || '';
const SOURCES = [
  'sunwings_site_settings?site_key=eq.sunwings&select=value',
  'site_settings?site_key=eq.sunwings&select=value',
  'site_pages?site_key=eq.sunwings&select=content',
  'sunwings_services?site_key=eq.sunwings&select=*',
  'sunwings_locations?site_key=eq.sunwings&select=*',
  'blog_posts?site_key=eq.sunwings&select=*',
];
// Photos written into the site's code (defaults and fallbacks).
const IN_CODE = [
  HERO_IMAGE_OPTIONS, RETIRED_HERO_IMAGES, CONTENT_DEFAULTS, HN_CONTENT_DEFAULTS, heroImage,
  movingPhotos.map(photo => `${PHOTO_ROOT}${photo.file}`),
  'https://nowsajdmbpxvlvrhopjg.supabase.co/storage/v1/object/public/site-assets/sunwings/1791334339517-SUNWING-site-logo.png',
  'https://nowsajdmbpxvlvrhopjg.supabase.co/storage/v1/object/public/site-assets/sunwings/1791151104850-Sunwings-Transport-Logo.png',
];
const PATH_RE = /\/storage\/v1\/(?:object|render\/image)\/public\/([a-z0-9-]+)\/([^"'?\s)\\]+)/gi;

async function read(path) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return '';
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, { headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` }, cache: 'no-store' });
    return response.ok ? await response.text() : '';
  } catch {
    return '';
  }
}

export async function GET() {
  const texts = await Promise.all(SOURCES.map(read));
  const all = [...texts, JSON.stringify(IN_CODE)].join('\n');
  const paths = new Set();
  for (const match of all.matchAll(PATH_RE)) {
    try { paths.add(`${match[1]}/${decodeURIComponent(match[2])}`); } catch { paths.add(`${match[1]}/${match[2]}`); }
  }
  return Response.json({ paths: [...paths].sort(), checkedAt: new Date().toISOString(), complete: texts.every(Boolean) }, {
    headers: { 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'no-store' },
  });
}
