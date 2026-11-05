// One place to turn the saved phone number into a tel: link.
// "+1 (437) 320-4797", "437-320-4797" and "14373204797" all become tel:+14373204797.
export function telHref(phone = '') {
  const digits = String(phone).replace(/\D/g, '');
  if (!digits) return '#';
  return `tel:+${digits.length === 10 ? `1${digits}` : digits}`;
}
