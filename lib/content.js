import { seedLocations, seedServices, seedSettings } from './seed';

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || '';

async function supabaseGet(path) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null;

  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
      next: { revalidate: 60 },
    });

    if (!response.ok) throw new Error(`Supabase read failed: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.warn('[sunwings] using local seed content:', error.message);
    return null;
  }
}

export async function getSiteSettings() {
  const rows = await supabaseGet('sunwings_site_settings?site_key=eq.sunwings&select=key,value');
  if (!rows?.length) return seedSettings;
  return rows.reduce((settings, row) => {
    settings[row.key] = row.value;
    return settings;
  }, { ...seedSettings });
}

export async function getServices() {
  const rows = await supabaseGet('sunwings_services?site_key=eq.sunwings&status=eq.published&select=*&order=sort_order.asc,title.asc');
  return rows === null ? seedServices : rows;
}

export async function getServiceBySlug(slug) {
  const rows = await supabaseGet(`sunwings_services?site_key=eq.sunwings&status=eq.published&slug=eq.${encodeURIComponent(slug)}&select=*&limit=1`);
  return rows === null ? (seedServices.find(item => item.slug === slug) || null) : (rows[0] || null);
}

export async function getLocations() {
  const rows = await supabaseGet('sunwings_locations?site_key=eq.sunwings&status=eq.published&select=*&order=sort_order.asc,title.asc');
  return rows === null ? seedLocations : rows;
}

export async function getLocationBySlug(slug) {
  const rows = await supabaseGet(`sunwings_locations?site_key=eq.sunwings&status=eq.published&slug=eq.${encodeURIComponent(slug)}&select=*&limit=1`);
  return rows === null ? (seedLocations.find(item => item.slug === slug) || null) : (rows[0] || null);
}

export function getBaseUrl() {
  return process.env.SITE_URL || 'http://localhost:3000';
}
