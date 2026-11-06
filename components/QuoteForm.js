'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { trackEvent } from './SiteAnalytics';

const initialState = {
  name: '',
  phone: '',
  email: '',
  service: '',
  preferredDate: '',
  preferredTime: '',
  moveSize: '',
  pickupAddress: '',
  pickupCity: '',
  pickupPostalCode: '',
  pickupElevator: '',
  pickupStairs: '',
  dropoffAddress: '',
  dropoffCity: '',
  dropoffPostalCode: '',
  dropoffElevator: '',
  dropoffStairs: '',
  itemList: '',
  message: '',
  referralSource: '',
  website: '',
};

const MAX_PHOTOS = 6;
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

async function uploadPhotos(files) {
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

function PhotoPicker({ photos, onAdd, onRemove, error, disabled }) {
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

function rememberVisit() {
  try {
    if (window.sessionStorage.getItem(VISIT_KEY)) return;
    const params = new URLSearchParams(window.location.search);
    const ad = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term'].map(key => params.get(key)).filter(Boolean).join(' / ');
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

function leadSource() {
  let visit = {};
  try { visit = JSON.parse(window.sessionStorage.getItem(VISIT_KEY) || '{}') || {}; } catch { visit = {}; }
  return [
    `Sent from ${window.location.pathname}`,
    visit.landing && visit.landing !== window.location.pathname ? `landed on ${visit.landing}` : '',
    visit.ad ? `ad: ${visit.ad}` : '',
    visit.googleAds ? 'Google Ads click' : '',
    !visit.ad && !visit.googleAds && visit.referrer ? `from ${visit.referrer}` : '',
  ].filter(Boolean).join(' · ').slice(0, 300);
}

function pickFill(fill) {
  return Object.fromEntries(FILL_KEYS.filter(key => fill?.[key]).map(key => [key, String(fill[key])]));
}

function YesNo({ name, value, onChange }) {
  return <div className="quote-choice-row" role="group" aria-label={name}>
    <label><input type="radio" name={name} value="yes" checked={value === 'yes'} onChange={onChange}/> Yes</label>
    <label><input type="radio" name={name} value="no" checked={value === 'no'} onChange={onChange}/> No</label>
  </div>;
}

// Partner referral links (e.g. ?ref=justin). The code is remembered for 90 days so a
// visitor who books later is still credited to the partner who sent them.
const REFERRERS = { justin: 'Referred by Justin DeMatteis' };
const REFERRAL_KEY = 'sunwings_ref';
const REFERRAL_DAYS = 90;

function readReferral() {
  try {
    const fromUrl = new URLSearchParams(window.location.search).get('ref')?.trim().toLowerCase();
    if (fromUrl && REFERRERS[fromUrl]) {
      window.localStorage.setItem(REFERRAL_KEY, JSON.stringify({ code: fromUrl, at: Date.now() }));
      return REFERRERS[fromUrl];
    }
    const saved = JSON.parse(window.localStorage.getItem(REFERRAL_KEY) || 'null');
    if (saved?.code && REFERRERS[saved.code] && Date.now() - saved.at < REFERRAL_DAYS * 86400000) return REFERRERS[saved.code];
  } catch {
    // Storage can be blocked; the referral then only counts on the page the link opened.
  }
  return '';
}

export default function QuoteForm({
  services = [],
  compact = false,
  preset = '',
  replyHours = '',
  triggerText = 'Request a Quote',
  global = false,
  fill = null,
}) {
  const drawerId = useId();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ ...initialState, service: preset, ...pickFill(fill) });
  const [state, setState] = useState({ sending: false, message: '', fieldErrors: {} });
  const [referral, setReferral] = useState('');
  const [photos, setPhotos] = useState([]);

  const photosRef = useRef(photos);
  photosRef.current = photos;
  useEffect(() => () => photosRef.current.forEach(photo => URL.revokeObjectURL(photo.preview)), []);

  function addPhotos(event) {
    const picked = [...(event.target.files || [])].filter(file => /^image\//.test(file.type) || /\.(jpe?g|png|webp|heic|heif)$/i.test(file.name));
    event.target.value = '';
    setPhotos(current => [
      ...current,
      ...picked.slice(0, MAX_PHOTOS - current.length).map(file => ({ file, preview: URL.createObjectURL(file) })),
    ]);
    setState(current => ({ ...current, fieldErrors: { ...current.fieldErrors, photos: '' } }));
  }

  function removePhoto(index) {
    setPhotos(current => {
      if (current[index]) URL.revokeObjectURL(current[index].preview);
      return current.filter((_, itemIndex) => itemIndex !== index);
    });
  }

  useEffect(() => { rememberVisit(); }, []);

  useEffect(() => {
    const label = readReferral();
    if (!label) return;
    setReferral(label);
    setForm(current => ({ ...current, referralSource: current.referralSource || label }));
  }, []);

  useEffect(() => {
    if (!global) return undefined;

    function openQuoteDrawer(event) {
      const nextPreset = String(event?.detail?.preset || '').trim();
      const nextPlan = String(event?.detail?.plan || '').trim();
      const nextFill = pickFill(event?.detail?.fill);
      if (nextPreset) setForm(current => ({ ...current, service: nextPreset, moveSize: nextPlan || current.moveSize }));
      if (Object.keys(nextFill).length) setForm(current => ({ ...current, ...nextFill }));
      setState(current => ({ ...current, message: '', fieldErrors: {} }));
      setOpen(true);
    }

    window.addEventListener('sunwings:open-quote', openQuoteDrawer);
    return () => window.removeEventListener('sunwings:open-quote', openQuoteDrawer);
  }, [global]);

  useEffect(() => {
    if (!open) return undefined;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function onKeyDown(event) {
      if (event.key === 'Escape') setOpen(false);
    }

    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  function closeDrawer() {
    if (!state.sending) setOpen(false);
  }

  function update(event) {
    const { name, value } = event.target;
    setForm(current => ({ ...current, [name]: value }));
    setState(current => ({
      ...current,
      fieldErrors: current.fieldErrors?.[name]
        ? { ...current.fieldErrors, [name]: '' }
        : current.fieldErrors,
    }));
  }

  async function submit(event) {
    event.preventDefault();
    const needsItems = !/snow/i.test(form.service);
    if (form.service && needsItems && !form.itemList.trim()) {
      setState({ sending: false, message: 'Please correct the highlighted fields.', fieldErrors: { itemList: 'List the items to be moved or delivered.' } });
      return;
    }
    setState({ sending: true, message: photos.length ? 'Uploading photos…' : '', fieldErrors: {} });

    let photoPaths = [];
    try {
      photoPaths = await uploadPhotos(photos.map(photo => photo.file));
    } catch (error) {
      setState({ sending: false, message: error.message || 'A photo did not upload.', fieldErrors: { photos: error.message || 'A photo did not upload.' } });
      return;
    }

    try {
      const response = await fetch('/api/quote', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ...form, message: [
          form.message,
          form.referralSource ? `How did you hear about us? ${form.referralSource}` : '',
          referral && form.referralSource !== referral ? `Partner referral link: ${referral}` : '',
        ].filter(Boolean).join('\n\n'), photos: photoPaths, leadSource: leadSource(), quickRequest: compact, snowRequest: snowJob && !compact }),
      });
      const result = await response.json();

      if (!response.ok) {
        setState({
          sending: false,
          message: result.error || 'Unable to send request.',
          fieldErrors: result.fieldErrors || {},
        });
        return;
      }

      trackEvent('generate_lead', { lead_source: compact ? 'quick_quote' : 'full_quote', service:form.service || preset || '' });
      if (typeof window !== 'undefined' && typeof window.fbq === 'function') window.fbq('track', 'Lead');

      setForm({ ...initialState, service: preset, referralSource: referral, ...pickFill(fill) });
      photos.forEach(photo => URL.revokeObjectURL(photo.preview));
      setPhotos([]);
      const timing = String(replyHours || '').trim();
      setState({
        sending: false,
        fieldErrors: {},
        message: timing
          ? `Thanks. Your quote request has been sent. We’ll reply within ${timing} hours.`
          : 'Thanks. Your quote request has been sent. We’ll reply as soon as possible.',
      });
    } catch (error) {
      setState({ sending: false, message: error.message || 'Unable to send request.', fieldErrors: {} });
    }
  }

  const errorFor = name => state.fieldErrors?.[name] || '';
  // Snow removal is done at one property, so it asks for a service address instead of pickup/drop-off.
  const snowJob = /snow/i.test(form.service);
  const title = compact
    ? (preset ? `Quick Quote — ${preset}` : 'Quick Quote')
    : (preset ? `Quote for ${preset}` : 'Request a Quote');

  const formMarkup = (
    <form className={`quote-intake-form ${global ? 'quote-drawer-form' : 'form-card'} ${compact ? 'compact' : ''}`} onSubmit={submit} noValidate>
      {!global ? <>
        <h3>{title}</h3>
        <p className="sub">{compact ? 'Send the basics and we’ll follow up for anything else.' : 'Tell us about the job so we can prepare an accurate quote.'}</p>
      </> : null}

      <div className="quote-honeypot" aria-hidden="true">
        <label>Website<input tabIndex="-1" autoComplete="off" name="website" value={form.website} onChange={update}/></label>
      </div>

      <div className="quote-section">
        <h4>Contact information</h4>
        <div className="row">
          <label className={errorFor('name') ? 'field-has-error' : ''}>
            Name *
            <input required name="name" autoComplete="name" value={form.name} onChange={update} placeholder="Your name" aria-invalid={Boolean(errorFor('name'))}/>
            {errorFor('name') ? <small className="field-error">{errorFor('name')}</small> : null}
          </label>
          <label className={errorFor('phone') ? 'field-has-error' : ''}>
            Phone Number *
            <input required type="tel" name="phone" autoComplete="tel" value={form.phone} onChange={update} placeholder="(___) ___-____" aria-invalid={Boolean(errorFor('phone'))}/>
            {errorFor('phone') ? <small className="field-error">{errorFor('phone')}</small> : null}
          </label>
        </div>
        <label className={errorFor('email') ? 'field-has-error' : ''}>
          Email *
          <input required type="email" name="email" autoComplete="email" value={form.email} onChange={update} placeholder="you@email.com" aria-invalid={Boolean(errorFor('email'))}/>
          {errorFor('email') ? <small className="field-error">{errorFor('email')}</small> : null}
        </label>
      </div>

      <div className="quote-section">
        <h4>Job details</h4>
        <div className="quote-grid-3">
          <label className={errorFor('preferredDate') ? 'field-has-error' : ''}>
            {snowJob ? 'Start Date *' : 'Move / Service Date *'}
            <input required type="date" name="preferredDate" value={form.preferredDate} onChange={update} aria-invalid={Boolean(errorFor('preferredDate'))}/>
            {errorFor('preferredDate') ? <small className="field-error">{errorFor('preferredDate')}</small> : null}
          </label>
          <label>Preferred Time
            <select name="preferredTime" value={form.preferredTime} onChange={update}>
              <option value="">Flexible</option>
              <option value="Morning">Morning</option>
              <option value="Afternoon">Afternoon</option>
              <option value="Evening">Evening</option>
            </select>
          </label>
          <label className={errorFor('service') ? 'field-has-error' : ''}>Type of Service *
            <select required name="service" value={form.service} onChange={update} aria-invalid={Boolean(errorFor('service'))}>
              <option value="">Select a service</option>
              {services.map(service => <option value={service.title} key={service.slug}>{service.title}</option>)}
            </select>
            {errorFor('service') ? <small className="field-error">{errorFor('service')}</small> : null}
          </label>
        </div>

        {compact && fill ? <div className="row">
          <label>Moving from
            <input name="pickupCity" value={form.pickupCity} onChange={update} placeholder="City"/>
          </label>
          <label>Moving to
            <input name="dropoffCity" value={form.dropoffCity} onChange={update} placeholder="City"/>
          </label>
        </div> : null}

        {compact && !snowJob ? <label className={errorFor('itemList') ? 'field-has-error' : ''}>What are we moving? *
          <textarea required rows="3" name="itemList" value={form.itemList} onChange={update} placeholder="E.g. queen bed, sofa, 10 boxes" aria-invalid={Boolean(errorFor('itemList'))}/>
          {errorFor('itemList') ? <small className="field-error">{errorFor('itemList')}</small> : null}
        </label> : null}

        {!compact && snowJob ? <label>Plan
          <select name="moveSize" value={form.moveSize} onChange={update}>
            <option value="">Select a plan</option>
            <option>Seasonal plan</option>
            <option>One-time clear</option>
            <option>Large &amp; corner lots</option>
            <option>Not sure yet</option>
          </select>
        </label> : null}

        {!compact && !snowJob ? <label>Move / Job Size
          <select name="moveSize" value={form.moveSize} onChange={update}>
            <option value="">Select size</option>
            <option>Single item</option>
            <option>Studio / 1 bed</option>
            <option>2 bed</option>
            <option>3+ bed / house</option>
            <option>Commercial</option>
            <option>Other</option>
          </select>
        </label> : null}
      </div>

      {!compact && snowJob ? <div className="quote-section">
        <h4>Property</h4>
        <label className={errorFor('pickupAddress') ? 'field-has-error' : ''}>
          Service Address *
          <input required name="pickupAddress" autoComplete="street-address" value={form.pickupAddress} onChange={update} placeholder="Address to be cleared" aria-invalid={Boolean(errorFor('pickupAddress'))}/>
          {errorFor('pickupAddress') ? <small className="field-error">{errorFor('pickupAddress')}</small> : null}
        </label>
        <div className="row">
          <label>City
            <input name="pickupCity" value={form.pickupCity} onChange={update} placeholder="City"/>
          </label>
          <label className={errorFor('pickupPostalCode') ? 'field-has-error' : ''}>
            Postal Code *
            <input required name="pickupPostalCode" autoComplete="postal-code" value={form.pickupPostalCode} onChange={update} placeholder="Postal code" aria-invalid={Boolean(errorFor('pickupPostalCode'))}/>
            {errorFor('pickupPostalCode') ? <small className="field-error">{errorFor('pickupPostalCode')}</small> : null}
          </label>
        </div>
        <label>Property Details
          <textarea rows="3" name="itemList" value={form.itemList} onChange={update} placeholder="Driveway size (single, double, long), corner lot, walkways, front steps…"/>
        </label>
        <label>Additional Details
          <textarea rows="3" name="message" value={form.message} onChange={update} placeholder="Parking, gates, access notes, anything we should know…"/>
        </label>
      </div> : null}

      {!compact && !snowJob ? <>
        <div className="quote-section">
          <h4>Pickup</h4>
          <label className={errorFor('pickupAddress') ? 'field-has-error' : ''}>
            Pickup Address *
            <input required name="pickupAddress" autoComplete="street-address" value={form.pickupAddress} onChange={update} placeholder="Address" aria-invalid={Boolean(errorFor('pickupAddress'))}/>
            {errorFor('pickupAddress') ? <small className="field-error">{errorFor('pickupAddress')}</small> : null}
          </label>
          <div className="row">
            <label>Pickup City
              <input name="pickupCity" value={form.pickupCity} onChange={update} placeholder="City"/>
            </label>
            <label className={errorFor('pickupPostalCode') ? 'field-has-error' : ''}>
              Pickup Postal Code *
              <input required name="pickupPostalCode" autoComplete="postal-code" value={form.pickupPostalCode} onChange={update} placeholder="Postal code" aria-invalid={Boolean(errorFor('pickupPostalCode'))}/>
              {errorFor('pickupPostalCode') ? <small className="field-error">{errorFor('pickupPostalCode')}</small> : null}
            </label>
          </div>
          <div className="quote-access-grid">
            <div><span className="quote-choice-label">Elevator</span><YesNo name="pickupElevator" value={form.pickupElevator} onChange={update}/></div>
            <div><span className="quote-choice-label">Stairs</span><YesNo name="pickupStairs" value={form.pickupStairs} onChange={update}/></div>
          </div>
        </div>

        <div className="quote-section">
          <h4>Drop-off</h4>
          <label className={errorFor('dropoffAddress') ? 'field-has-error' : ''}>
            Drop-Off Address *
            <input required name="dropoffAddress" value={form.dropoffAddress} onChange={update} placeholder="Address" aria-invalid={Boolean(errorFor('dropoffAddress'))}/>
            {errorFor('dropoffAddress') ? <small className="field-error">{errorFor('dropoffAddress')}</small> : null}
          </label>
          <div className="row">
            <label>Drop-Off City
              <input name="dropoffCity" value={form.dropoffCity} onChange={update} placeholder="City"/>
            </label>
            <label className={errorFor('dropoffPostalCode') ? 'field-has-error' : ''}>
              Drop-Off Postal Code *
              <input required name="dropoffPostalCode" value={form.dropoffPostalCode} onChange={update} placeholder="Postal code" aria-invalid={Boolean(errorFor('dropoffPostalCode'))}/>
              {errorFor('dropoffPostalCode') ? <small className="field-error">{errorFor('dropoffPostalCode')}</small> : null}
            </label>
          </div>
          <div className="quote-access-grid">
            <div><span className="quote-choice-label">Elevator</span><YesNo name="dropoffElevator" value={form.dropoffElevator} onChange={update}/></div>
            <div><span className="quote-choice-label">Stairs</span><YesNo name="dropoffStairs" value={form.dropoffStairs} onChange={update}/></div>
          </div>
        </div>

        <div className="quote-section">
          <h4>Items & notes</h4>
          <label className={errorFor('itemList') ? 'field-has-error' : ''}>Item List *
            <textarea required rows="5" name="itemList" value={form.itemList} onChange={update} placeholder="List the furniture, boxes, equipment or other items to be transported" aria-invalid={Boolean(errorFor('itemList'))}/>
            {errorFor('itemList') ? <small className="field-error">{errorFor('itemList')}</small> : null}
          </label>
          <label>Additional Details
            <textarea rows="3" name="message" value={form.message} onChange={update} placeholder="Heavy items, access details, packing, disassembly, special instructions…"/>
          </label>
        </div>
      </> : null}

      <div className="quote-section">
        <PhotoPicker photos={photos} onAdd={addPhotos} onRemove={removePhoto} error={errorFor('photos')} disabled={state.sending}/>
      </div>

      <div className="quote-section">
        <label>How did you hear about us?
          <select name="referralSource" value={form.referralSource} onChange={update}>
            <option value="">Select an option (optional)</option>
            {referral ? <option value={referral}>{referral}</option> : null}
            <option value="Google Search">Google Search</option>
            <option value="Google Maps">Google Maps</option>
            <option value="Facebook">Facebook</option>
            <option value="Instagram">Instagram</option>
            <option value="Friend or family">Friend or family</option>
            <option value="Returning customer">Returning customer</option>
            <option value="Other">Other</option>
          </select>
        </label>
      </div>

      <button className="btn btn-accent quote-drawer-submit" disabled={state.sending} type="submit">
        {state.sending ? 'Sending…' : 'Request a Quote →'}
      </button>
      {state.message ? <p className="fine quote-status" role="status" aria-live="polite">{state.message}</p> : null}
    </form>
  );

  if (!global) return formMarkup;

  return (
    <>
      <button
        className="quote-side-tab"
        type="button"
        aria-haspopup="dialog"
        aria-controls={drawerId}
        aria-expanded={open}
        onClick={() => setOpen(true)}
      >
        <span className="quote-side-tab-dot" aria-hidden="true"/>
        <span>{triggerText}</span>
      </button>

      {open ? <>
        <button className="quote-drawer-overlay" type="button" aria-label="Close quote form" onClick={closeDrawer}/>
        <aside
          className="quote-drawer"
          id={drawerId}
          role="dialog"
          aria-modal="true"
          aria-labelledby={`${drawerId}-title`}
        >
          <header className="quote-drawer-head">
            <div>
              <span className="kicker">Free Quote</span>
              <h2 id={`${drawerId}-title`}>{title}</h2>
              <p>{snowJob ? 'Tell us about the property and the plan you want.' : 'Tell us what you need moved and where it is going.'}</p>
            </div>
            <button className="quote-drawer-close" type="button" onClick={closeDrawer} aria-label="Close quote form">
              <X size={21}/>
            </button>
          </header>
          <div className="quote-drawer-body">{formMarkup}</div>
        </aside>
      </> : null}
    </>
  );
}
