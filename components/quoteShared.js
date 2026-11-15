'use client';

// Shared by the long quote form (QuoteForm.js) and the step-by-step drawer form (StepQuote.js).
import { useId } from 'react';
import { X } from 'lucide-react';

export const MAX_PHOTOS = 6;
const PHOTO_MAX_SIDE = 1600;

function newUploadId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, ch => {
    const r = Math.random() * 16 | 0;
    return (ch === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error(`${file.name || 'A photo'} could not be read. Try a JPG or PNG.`)); };
    img.src = url;
  });
}

// Phone photos are often 3–10 MB. Shrink to a JPEG (longest side 1600px) before sending.
async function shrinkPhoto(file) {
  const img = await loadImage(file);
  const scale = Math.min(1, PHOTO_MAX_SIDE / Math.max(img.naturalWidth, img.naturalHeight));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.82));
  if (!blob) throw new Error(`${file.name || 'A photo'} could not be prepared.`);
  return blob;
}

export async function uploadPhotos(files) {
  if (!files.length) return [];
  const uploadId = newUploadId();
  const paths = [];
  for (const [index, file] of files.entries()) {
    const blob = await shrinkPhoto(file);
    const response = await fetch(`/api/quote/photo?upload=${uploadId}&n=${index}`, {
      method: 'POST',
      headers: { 'content-type': 'image/jpeg' },
      body: blob,
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok || !result.path) throw new Error(result.error || 'A photo did not upload. Please try again.');
    paths.push(result.path);
  }
  return paths;
}

export function PhotoPicker({ photos, onAdd, onRemove, error, disabled }) {
  const inputId = useId();
  return <div className={`quote-photos ${error ? 'field-has-error' : ''}`}>
    <span className="quote-choice-label">Photos <small>(optional, up to {MAX_PHOTOS})</small></span>
    <p className="quote-photos-hint">Photos of the items, stairs or driveway help us quote accurately.</p>
    {photos.length ? <ul className="quote-photo-list">
      {photos.map((photo, index) => <li key={photo.preview}>
        <img src={photo.preview} alt={`Photo ${index + 1}`}/>
        <button type="button" onClick={() => onRemove(index)} disabled={disabled} aria-label={`Remove photo ${index + 1}`}><X size={14}/></button>
      </li>)}
    </ul> : null}
    {photos.length < MAX_PHOTOS ? <label className="btn btn-line quote-photo-add" htmlFor={inputId}>
      {photos.length ? 'Add more photos' : 'Add photos'}
      <input id={inputId} type="file" accept="image/*" multiple onChange={onAdd} disabled={disabled}/>
    </label> : null}
    {error ? <small className="field-error">{error}</small> : null}
  </div>;
}

// Where a quote came from: the page it was sent from, the first page of the visit and any
// ad tags (utm_*, Google Ads click). Saved with the quote so ads can be measured.
const VISIT_KEY = 'sunwings_visit';
const FILL_KEYS = ['pickupCity', 'dropoffCity'];

// Hamilton & Niagara is Justin's branch: a visit to that section is remembered for 90 days,
// so a quote sent later from anywhere on the site is still credited to the branch.
const HN_KEY = 'sunwings_hn';
const HN_DAYS = 90;

export function rememberVisit() {
  try {
    if (window.location.pathname.startsWith('/hamilton-niagara')) window.localStorage.setItem(HN_KEY, String(Date.now()));
  } catch {
    // Storage can be blocked; the quote then only records the pages of this visit.
  }
  try {
    const params = new URLSearchParams(window.location.search);
    const ad = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term'].map(key => params.get(key)).filter(Boolean).join(' / ');
    const fromAd = Boolean(ad) || params.has('gclid') || params.has('gbraid') || params.has('wbraid');
    // Keep the first page of the visit, unless this page was opened from an ad: an ad click
    // always wins, so a quote is credited to the ad even if they browsed the site earlier.
    if (window.sessionStorage.getItem(VISIT_KEY) && !fromAd) return;
    window.sessionStorage.setItem(VISIT_KEY, JSON.stringify({
      landing: window.location.pathname,
      ad,
      googleAds: params.has('gclid') || params.has('gbraid') || params.has('wbraid'),
      referrer: document.referrer && !document.referrer.includes(window.location.host) ? new URL(document.referrer).host : '',
    }));
  } catch {
    // Storage can be blocked; the quote then only records the page it was sent from.
  }
}

export function leadSource() {
  let visit = {};
  try { visit = JSON.parse(window.sessionStorage.getItem(VISIT_KEY) || '{}') || {}; } catch { visit = {}; }
  let hnVisit = false;
  try { hnVisit = Date.now() - Number(window.localStorage.getItem(HN_KEY) || 0) < HN_DAYS * 86400000; } catch { hnVisit = false; }
  const inHn = [window.location.pathname, visit.landing].some(path => String(path || '').startsWith('/hamilton-niagara'));
  return [
    hnVisit && !inHn ? 'visited Hamilton & Niagara section' : '',
    `Sent from ${window.location.pathname}`,
    visit.landing && visit.landing !== window.location.pathname ? `landed on ${visit.landing}` : '',
    visit.ad ? `ad: ${visit.ad}` : '',
    visit.googleAds ? 'Google Ads click' : '',
    !visit.ad && !visit.googleAds && visit.referrer ? `from ${visit.referrer}` : '',
  ].filter(Boolean).join(' · ').slice(0, 300);
}

export function pickFill(fill) {
  return Object.fromEntries(FILL_KEYS.filter(key => fill?.[key]).map(key => [key, String(fill[key])]));
}

// Partner referral links (e.g. ?ref=justin, or a store's QR link /r/<code> which adds ?ref=<code>).
// The code is remembered for 90 days so a visitor who books later is still credited to the partner.
const REFERRERS = { justin: 'Referred by Justin DeMatteis' };
const REFERRAL_KEY = 'sunwings_ref';
const REFERRAL_DAYS = 90;
const REFERRAL_CODE = /^[a-z0-9][a-z0-9-]{1,39}$/;
const referralLabel = code => REFERRERS[code] || `Store partner: ${code}`;

export function readReferral() {
  try {
    const fromUrl = new URLSearchParams(window.location.search).get('ref')?.trim().toLowerCase();
    if (fromUrl && REFERRAL_CODE.test(fromUrl)) {
      window.localStorage.setItem(REFERRAL_KEY, JSON.stringify({ code: fromUrl, at: Date.now() }));
      return referralLabel(fromUrl);
    }
    const saved = JSON.parse(window.localStorage.getItem(REFERRAL_KEY) || 'null');
    if (saved?.code && REFERRAL_CODE.test(saved.code) && Date.now() - saved.at < REFERRAL_DAYS * 86400000) return referralLabel(saved.code);
  } catch {
    // Storage can be blocked; the referral then only counts on the page the link opened.
  }
  return '';
}
