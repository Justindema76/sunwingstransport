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
  if (rows === null) return seedServices;
  if (!rows.length && !getBaseUrl().includes('sunwingstransport.ca')) return seedServices;
  return rows;
}

export async function getServiceBySlug(slug) {
  const rows = await supabaseGet(`sunwings_services?site_key=eq.sunwings&status=eq.published&slug=eq.${encodeURIComponent(slug)}&select=*&limit=1`);
  if (rows === null) return seedServices.find(item => item.slug === slug) || null;
  if (!rows.length && !getBaseUrl().includes('sunwingstransport.ca')) return seedServices.find(item => item.slug === slug) || null;
  return rows[0] || null;
}

export async function getLocations() {
  const rows = await supabaseGet('sunwings_locations?site_key=eq.sunwings&status=eq.published&select=*&order=sort_order.asc,title.asc');
  if (rows === null) return seedLocations;
  if (!rows.length && !getBaseUrl().includes('sunwingstransport.ca')) return seedLocations;
  return rows;
}

export async function getLocationBySlug(slug) {
  const rows = await supabaseGet(`sunwings_locations?site_key=eq.sunwings&status=eq.published&slug=eq.${encodeURIComponent(slug)}&select=*&limit=1`);
  if (rows === null) return seedLocations.find(item => item.slug === slug) || null;
  if (!rows.length && !getBaseUrl().includes('sunwingstransport.ca')) return seedLocations.find(item => item.slug === slug) || null;
  return rows[0] || null;
}

export function getBaseUrl() {
  if (process.env.SITE_URL) return process.env.SITE_URL.replace(/\/$/, '');
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return 'http://localhost:3000';
}


export async function getPageBuilderData(pageId) {
  const rows = await supabaseGet(`site_pages?site_key=eq.sunwings&page_id=eq.${encodeURIComponent(pageId)}&select=content&limit=1`);
  if (!Array.isArray(rows) || !rows.length) return null;
  const content = rows[0]?.content;
  return content && typeof content === 'object' && Array.isArray(content.content) ? content : null;
}


function normalizeBlogPost(row) {
  if (!row) return null;
  return {
    ...row,
    tag: row.category || '',
    image: row.featured_image || '',
    publishedAt: row.published_at || '',
    seoTitle: row.seo_title || '',
    seoDescription: row.seo_description || '',
  };
}

export async function getBlogPosts() {
  const rows = await supabaseGet('blog_posts?site_key=eq.sunwings&status=eq.published&select=*&order=published_at.desc.nullslast,updated_at.desc');
  if (!Array.isArray(rows)) return [];
  return rows.map(normalizeBlogPost).filter(Boolean);
}

export async function getBlogPostBySlug(slug) {
  const rows = await supabaseGet(`blog_posts?site_key=eq.sunwings&status=eq.published&slug=eq.${encodeURIComponent(slug)}&select=*&limit=1`);
  if (!Array.isArray(rows) || !rows.length) return null;
  return normalizeBlogPost(rows[0]);
}


export async function getGlobalStyles() {
  const rows = await supabaseGet('site_settings?site_key=eq.sunwings&key=eq.global_styles&select=value&limit=1');
  return Array.isArray(rows) && rows.length && rows[0]?.value && typeof rows[0].value === 'object'
    ? rows[0].value
    : null;
}

export async function getGlobalSection(key) {
  const clean = String(key || '').trim().toLowerCase();
  if (!['header','footer'].includes(clean)) return null;
  const rows = await supabaseGet(`site_settings?site_key=eq.sunwings&key=eq.global_${clean}&select=value&limit=1`);
  if (!Array.isArray(rows) || !rows.length) return null;
  const value = rows[0]?.value;
  return value && typeof value === 'object' ? value : null;
}

export function getGlobalBlockProps(value, type) {
  const content = Array.isArray(value?.content) ? value.content : [];
  const block = content.find(item => item?.type === type) || content[0] || null;
  return block?.props && typeof block.props === 'object' ? block.props : {};
}

export function globalStyleVars(styles = {}) {
  if (!styles || typeof styles !== 'object') return {};
  const vars = {};

  if (styles.primary) vars['--accent'] = styles.primary;
  if (styles.primaryDark) vars['--accent-2'] = styles.primaryDark;
  if (styles.text) vars['--ink'] = styles.text;
  if (styles.muted) vars['--muted'] = styles.muted;
  if (styles.pageBackground) vars['--bg'] = styles.pageBackground;
  if (styles.surface) vars['--header'] = styles.surface;
  if (styles.lightSurface) vars['--sky'] = styles.lightSurface;
  if (styles.border) vars['--line'] = styles.border;
  if (styles.darkSurface) {
    vars['--navy'] = styles.darkSurface;
    vars['--topbar'] = styles.darkSurface;
  }
  if (styles.headingFont) vars['--font-head'] = styles.headingFont;
  if (styles.bodyFont) vars['--font-body'] = styles.bodyFont;
  if (styles.contentWidth) vars['--content-width'] = `${Number(styles.contentWidth)}px`;
  if (styles.sectionSpacing) vars['--section-space'] = `${Number(styles.sectionSpacing)}px`;
  if (styles.cardRadius != null) vars['--radius'] = `${Number(styles.cardRadius)}px`;
  if (styles.buttonRadius != null) vars['--button-radius'] = `${Number(styles.buttonRadius)}px`;
  if (styles.buttonHeight != null) vars['--button-height'] = `${Number(styles.buttonHeight)}px`;
  if (styles.h1Size) vars['--global-h1-size'] = `${Number(styles.h1Size)}px`;
  if (styles.h2Size) vars['--global-h2-size'] = `${Number(styles.h2Size)}px`;
  if (styles.h3Size) vars['--global-h3-size'] = `${Number(styles.h3Size)}px`;
  if (styles.h4Size) vars['--global-h4-size'] = `${Number(styles.h4Size)}px`;

  return vars;
}


export async function getSocialLinks() {
  const rows = await supabaseGet('site_settings?site_key=eq.sunwings&key=eq.social_links&select=value&limit=1');
  const value = Array.isArray(rows) && rows.length ? rows[0]?.value : null;
  return value && typeof value === 'object' ? value : {};
}


export function pageMetadataFromBuilder(pageData, fallback = {}) {
  const props = pageData?.root?.props && typeof pageData.root.props === 'object'
    ? pageData.root.props
    : {};
  const title = String(props.seoTitle || fallback.title || '').trim();
  const description = String(props.seoDescription || fallback.description || '').trim();
  const image = String(props.ogImage || fallback.ogImage || '').trim();
  const canonical = fallback.canonical || '/';

  return {
    title: props.seoTitle ? { absolute: title } : title,
    description,
    alternates: { canonical },
    openGraph: {
      type:'website',
      url:canonical,
      title,
      description,
      images:image ? [{ url:image, alt:title || 'Sunwings Transport' }] : [],
    },
  };
}
