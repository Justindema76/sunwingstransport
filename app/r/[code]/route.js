import { PARTNER_CODE_RE, PARTNER_DESTINATIONS, getReferralPartners } from '@/lib/referralPartners';

// Short store link printed as a QR code: /r/<store code> → the store's furniture quote page,
// with ?ref so every quote from it is credited to the store (and utm tags for Analytics).
export async function GET(request, { params }) {
  const { code: raw } = await params;
  const code = String(raw || '').trim().toLowerCase();
  const url = new URL('/services/furniture-delivery', request.url);
  // Only stores listed (and active) in Admin › Store partners get the credit.
  const partner = PARTNER_CODE_RE.test(code) ? (await getReferralPartners()).find(item => item.code === code && item.active !== false) : null;
  if (partner) {
    url.pathname = PARTNER_DESTINATIONS[partner.area] || PARTNER_DESTINATIONS.main;
    url.searchParams.set('ref', code);
    url.searchParams.set('utm_source', code);
    url.searchParams.set('utm_medium', 'partner_qr');
    url.searchParams.set('utm_campaign', 'store_partners');
  }
  return Response.redirect(url, 302);
}
