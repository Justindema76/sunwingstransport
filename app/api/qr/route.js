import QRCode from 'qrcode';
import { PARTNER_CODE_RE } from '@/lib/referralPartners';

// QR code (SVG) for a store's short link, for the admin's printable partner cards.
// Only makes codes for this site's own /r/ links.
export async function GET(request) {
  const code = String(new URL(request.url).searchParams.get('code') || '').trim().toLowerCase();
  if (!PARTNER_CODE_RE.test(code)) return new Response('Bad code', { status: 400 });
  const svg = await QRCode.toString(`https://www.sunwingstransport.ca/r/${code}`, { type: 'svg', margin: 1, errorCorrectionLevel: 'M', color: { dark: '#111111', light: '#ffffff' } });
  return new Response(svg, { headers: { 'content-type': 'image/svg+xml', 'cache-control': 'public, max-age=86400', 'access-control-allow-origin': '*' } });
}
