// Store partners (furniture stores, consignment shops…) that send customers to Sunwings.
// Kept in the `referral_partners` site setting, edited in Admin › Store partners.
// Each store has a short link (/r/<code>) printed as a QR code; quotes from it are credited to the store.
import { getSiteSettings } from './content';

export const PARTNER_CODE_RE = /^[a-z0-9][a-z0-9-]{1,39}$/;

// Where a store's QR code sends people, by area.
export const PARTNER_DESTINATIONS = {
  main: '/services/furniture-delivery',
  hn: '/hamilton-niagara/furniture-delivery',
};

export async function getReferralPartners() {
  const raw = (await getSiteSettings())?.referral_partners;
  try {
    const list = typeof raw === 'string' ? JSON.parse(raw) : raw;
    return Array.isArray(list) ? list.filter(item => item && PARTNER_CODE_RE.test(String(item.code || ''))) : [];
  } catch {
    return [];
  }
}
