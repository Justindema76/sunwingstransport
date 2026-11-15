'use client';

// Step-by-step quote request (furniture / single-item delivery), shown in the quote drawer.
// One question per screen. It posts the same fields as the long form to /api/quote, so the
// request lands in Admin › Quotes like any other. State lives in useStepQuote(), called by
// the drawer, so progress survives Back and closing/reopening the drawer.
import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Check } from 'lucide-react';
import { trackEvent } from './SiteAnalytics';
import { MAX_PHOTOS, PhotoPicker, leadSource, uploadPhotos } from './quoteShared';
import './quoteSteps.css';

export const DELIVERY_SERVICE = 'Furniture Delivery';
export const isDeliveryService = title => /furniture|deliver|single item/i.test(String(title || ''));

const STEPS = [
  { key: 'what', label: 'Items' },
  { key: 'where', label: 'Addresses' },
  { key: 'when', label: 'Date' },
  { key: 'contact', label: 'Contact' },
  { key: 'review', label: 'Review' },
];

// Tap-to-pick items on step 1, so the customer doesn't have to type.
const ITEMS = [
  'Sofa / couch', 'Sectional', 'Loveseat', 'Armchair', 'Bed + mattress', 'Mattress only',
  'Dresser', 'Nightstand', 'Dining table', 'Dining chair', 'Desk', 'Bookshelf',
  'TV', 'TV stand', 'Fridge', 'Washer', 'Dryer', 'Stove', 'Boxes',
];

export function itemsText(data) {
  const picked = Object.entries(data.items || {}).filter(([, n]) => n > 0).map(([name, n]) => `${n} × ${name}`);
  return [picked.join(', '), String(data.itemOther || '').trim()].filter(Boolean).join('\n');
}

function ItemPicker({ items, onChange }) {
  const add = (name, delta) => onChange({ ...items, [name]: Math.max(0, Math.min(99, (items[name] || 0) + delta)) });
  return <ul className="qs-items" aria-label="Pick your items">
    {ITEMS.map(name => {
      const n = items[name] || 0;
      return <li key={name} className={n ? 'is-on' : ''}>
        <button type="button" className="qs-item-name" onClick={() => add(name, 1)} aria-label={`Add ${name}`}>
          <span>{name}</span>{n ? <b>{n}</b> : <i aria-hidden="true">+</i>}
        </button>
        {n ? <button type="button" className="qs-item-minus" onClick={() => add(name, -1)} aria-label={`Remove one ${name}`}>−</button> : null}
      </li>;
    })}
  </ul>;
}

const ACCESS = ['No stairs', 'Stairs', 'Elevator'];
const TIMES = ['Any time', 'Morning', 'Afternoon', 'Evening'];

const blank = {
  items: {}, itemOther: '',
  pickupAddress: '', pickupCity: '', pickupPostalCode: '', pickupAccess: '',
  dropoffAddress: '', dropoffCity: '', dropoffPostalCode: '', dropoffAccess: '',
  preferredDate: '', preferredTime: '', flexible: false,
  name: '', phone: '', email: '',
  message: '', referralSource: '', website: '',
};

// Which step shows a field, so an error from the server takes the customer to the right screen.
const FIELD_STEP = {
  itemList: 0, itemOther: 0,
  pickupAddress: 1, pickupCity: 1, pickupPostalCode: 1, dropoffAddress: 1, dropoffCity: 1, dropoffPostalCode: 1,
  preferredDate: 2,
  name: 3, phone: 3, email: 3,
};

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function todayIso() {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

function newReference() {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  let out = '';
  const values = typeof crypto !== 'undefined' && crypto.getRandomValues ? crypto.getRandomValues(new Uint8Array(6)) : null;
  for (let i = 0; i < 6; i += 1) out += chars[(values ? values[i] : Math.floor(Math.random() * 256)) % chars.length];
  return `SW-${out}`;
}

export function formatDate(iso) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso || '')) return '';
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-CA', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}

function accessFields(value) {
  if (value === 'Stairs') return { stairs: 'yes', elevator: 'no' };
  if (value === 'Elevator') return { stairs: 'no', elevator: 'yes' };
  if (value === 'No stairs') return { stairs: 'no', elevator: 'no' };
  return { stairs: '', elevator: '' };
}

function place(data, side) {
  return [data[`${side}Address`], data[`${side}City`], data[`${side}PostalCode`]].map(v => String(v || '').trim()).filter(Boolean).join(', ');
}

function whenText(data) {
  return [
    formatDate(data.preferredDate),
    data.preferredTime && data.preferredTime !== 'Any time' ? `(${data.preferredTime.toLowerCase()})` : '',
    data.flexible ? '· flexible' : '',
  ].filter(Boolean).join(' ');
}

function validateStep(index, data) {
  const errors = {};
  if (index === 0 && !itemsText(data)) errors.itemOther = 'Tap at least one item, or type what it is.';
  if (index === 1) {
    if (!data.pickupAddress.trim()) errors.pickupAddress = 'Enter the pickup address.';
    if (!data.pickupCity.trim()) errors.pickupCity = 'Enter the pickup city.';
    if (!data.dropoffAddress.trim()) errors.dropoffAddress = 'Enter the drop-off address.';
    if (!data.dropoffCity.trim()) errors.dropoffCity = 'Enter the drop-off city.';
  }
  if (index === 2) {
    if (!data.preferredDate) errors.preferredDate = 'Pick a date. If you’re flexible, pick roughly when.';
    else if (!/^20\d{2}-\d{2}-\d{2}$/.test(data.preferredDate)) errors.preferredDate = 'Pick a valid date.';
    else if (data.preferredDate < todayIso()) errors.preferredDate = 'Pick a date from today on.';
  }
  if (index === 3) {
    if (!data.name.trim()) errors.name = 'Enter your name.';
    if (data.phone.replace(/\D/g, '').length < 10) errors.phone = 'Enter a phone number with at least 10 digits.';
    if (!data.email.trim()) errors.email = 'Enter your email. The written quote is sent there.';
    else if (!EMAIL.test(data.email.trim())) errors.email = 'Enter a valid email address.';
  }
  return errors;
}

export function useStepQuote() {
  const [data, setData] = useState(blank);
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ sending: false, message: '' });
  const [photos, setPhotos] = useState([]);
  const [done, setDone] = useState(null);

  const photosRef = useRef(photos);
  photosRef.current = photos;
  useEffect(() => () => photosRef.current.forEach(photo => URL.revokeObjectURL(photo.preview)), []);

  function reset(fill = {}) {
    photosRef.current.forEach(photo => URL.revokeObjectURL(photo.preview));
    setPhotos([]);
    setData({ ...blank, ...fill });
    setStep(0);
    setErrors({});
    setStatus({ sending: false, message: '' });
    setDone(null);
  }

  return { data, setData, step, setStep, errors, setErrors, status, setStatus, photos, setPhotos, done, setDone, reset };
}

function Field({ label, name, error, optional, children }) {
  return <label className={error ? 'field-has-error' : ''} htmlFor={`qs-${name}`}>
    {label}{optional ? <small className="quote-optional"> (optional)</small> : null}
    {children}
    {error ? <small className="field-error">{error}</small> : null}
  </label>;
}

function Chips({ name, options, value, onPick, label }) {
  return <div className="quote-choice-list" role="radiogroup" aria-label={label}>
    {options.map(option => <label key={option} className={value === option ? 'is-on' : ''}>
      <input type="radio" name={name} value={option} checked={value === option} onChange={() => onPick(option)} onClick={() => { if (value === option) onPick(''); }}/>
      {option}
    </label>)}
  </div>;
}

export default function StepQuote({ quote, service = DELIVERY_SERVICE, referral = '', replyHours = '', onClose }) {
  const { data, setData, step, setStep, errors, setErrors, status, setStatus, photos, setPhotos, done, setDone, reset } = quote;
  const headingRef = useRef(null);
  const refRef = useRef('');
  const firstRender = useRef(true);

  useEffect(() => {
    if (firstRender.current) { firstRender.current = false; return; }
    headingRef.current?.focus({ preventScroll: true });
    headingRef.current?.closest('.quote-drawer-body')?.scrollTo({ top: 0 });
  }, [step, done]);

  useEffect(() => {
    if (!done) trackEvent('quote_step', { step_number: step + 1, step_name: STEPS[step].key, lead_source: 'step_quote' });
  }, [step, done]);

  function set(name, value) {
    setData(current => ({ ...current, [name]: value }));
    if (errors[name]) setErrors(current => ({ ...current, [name]: '' }));
  }
  const onInput = event => set(event.target.name, event.target.type === 'checkbox' ? event.target.checked : event.target.value);

  function addPhotos(event) {
    const picked = [...(event.target.files || [])].filter(file => /^image\//.test(file.type) || /\.(jpe?g|png|webp|heic|heif)$/i.test(file.name));
    event.target.value = '';
    setPhotos(current => [...current, ...picked.slice(0, MAX_PHOTOS - current.length).map(file => ({ file, preview: URL.createObjectURL(file) }))]);
    setErrors(current => ({ ...current, photos: '' }));
  }
  function removePhoto(index) {
    setPhotos(current => {
      if (current[index]) URL.revokeObjectURL(current[index].preview);
      return current.filter((_, i) => i !== index);
    });
  }

  function next(event) {
    event?.preventDefault();
    if (status.sending) return;
    if (STEPS[step].key === 'review') { send(); return; }
    const found = validateStep(step, data);
    if (Object.values(found).some(Boolean)) {
      setErrors(found);
      const first = Object.keys(found)[0];
      setTimeout(() => document.getElementById(`qs-${first}`)?.focus(), 0);
      return;
    }
    setErrors({});
    setStatus({ sending: false, message: '' });
    setStep(step + 1);
  }

  function back() {
    if (status.sending || step === 0) return;
    setErrors({});
    setStatus({ sending: false, message: '' });
    setStep(step - 1);
  }

  async function send() {
    for (let i = 0; i < 4; i += 1) {
      const found = validateStep(i, data);
      if (Object.values(found).some(Boolean)) { setErrors(found); setStep(i); return; }
    }
    if (!refRef.current) refRef.current = newReference();
    const reference = refRef.current;
    setStatus({ sending: true, message: photos.length ? 'Uploading photos…' : 'Sending…' });

    let photoPaths = [];
    try {
      photoPaths = await uploadPhotos(photos.map(photo => photo.file));
    } catch (error) {
      setErrors({ photos: error.message || 'A photo did not upload.' });
      setStatus({ sending: false, message: `${error.message || 'A photo did not upload.'} You can remove it on step 1 and send without it.` });
      return;
    }

    const pickup = accessFields(data.pickupAccess);
    const dropoff = accessFields(data.dropoffAccess);
    const payload = {
      name: data.name, phone: data.phone, email: data.email,
      service,
      moveSize: 'Furniture / item delivery',
      preferredDate: data.preferredDate,
      preferredTime: data.preferredTime && data.preferredTime !== 'Any time' ? data.preferredTime : '',
      pickupAddress: data.pickupAddress, pickupCity: data.pickupCity, pickupPostalCode: data.pickupPostalCode,
      pickupStairs: pickup.stairs, pickupElevator: pickup.elevator,
      dropoffAddress: data.dropoffAddress, dropoffCity: data.dropoffCity, dropoffPostalCode: data.dropoffPostalCode,
      dropoffStairs: dropoff.stairs, dropoffElevator: dropoff.elevator,
      itemList: itemsText(data),
      message: [
        `Reference: ${reference}`,
        data.flexible ? 'Date is flexible.' : '',
        data.message.trim(),
        data.referralSource ? `How did you hear about us? ${data.referralSource}` : '',
        referral && data.referralSource !== referral ? `Partner referral link: ${referral}` : '',
        'Sent with the step-by-step quote form.',
      ].filter(Boolean).join('\n\n'),
      photos: photoPaths,
      leadSource: leadSource(),
      // Postal codes are optional here, so the server's full-request address checks are relaxed.
      quickRequest: true,
      website: data.website,
    };

    try {
      const response = await fetch('/api/quote', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        const fieldErrors = result.fieldErrors || {};
        const steps = Object.keys(fieldErrors).filter(key => fieldErrors[key]).map(key => FIELD_STEP[key]).filter(n => n !== undefined);
        setErrors(fieldErrors);
        setStatus({ sending: false, message: result.error || 'Unable to send your request. Please try again or call us.' });
        if (steps.length) setStep(Math.min(...steps));
        return;
      }

      trackEvent('generate_lead', { lead_source: 'step_quote', service });
      if (typeof window !== 'undefined' && typeof window.fbq === 'function') window.fbq('track', 'Lead');
      setDone({ reference, when: whenText(data), email: data.email.trim() });
      refRef.current = '';
      setStatus({ sending: false, message: '' });
    } catch (error) {
      setStatus({ sending: false, message: error.message || 'Unable to send your request. Please try again or call us.' });
    }
  }

  if (done) {
    const hours = String(replyHours || '').trim();
    return <div className="qs qs-done" role="status" aria-live="polite">
      <div className="qs-done-icon" aria-hidden="true"><Check size={30}/></div>
      <h3 className="qs-title" tabIndex={-1} ref={headingRef}>Request sent. Thank you!</h3>
      <div className="qs-ref">
        <span>Your reference number</span>
        <strong>{done.reference}</strong>
      </div>
      <dl className="qs-review">
        <div><dt>Date you asked for</dt><dd>{done.when}</dd></div>
      </dl>
      <div className="qs-next">
        <h4>What happens next</h4>
        <ol>
          <li>We review your request{photos.length ? ' and photos' : ''}.</li>
          <li>We send you a written quote{done.email ? ` at ${done.email}` : ''}{hours ? ` within ${hours} hours` : ''}.</li>
          <li><b>Your date isn’t reserved yet.</b> It’s booked once you accept the quote and we confirm.</li>
        </ol>
      </div>
      <button type="button" className="btn btn-accent qs-wide" onClick={() => { reset({ referralSource: referral }); onClose?.(); }}>Done</button>
    </div>;
  }

  const current = STEPS[step];
  const err = name => errors[name] || '';

  return <form className="qs" onSubmit={next} noValidate>
    <div className="qs-progress" aria-label={`Step ${step + 1} of ${STEPS.length}`}>
      <div className="qs-progress-text"><span>Step {step + 1} of {STEPS.length}</span><span>{current.label}</span></div>
      <div className="qs-bar" role="progressbar" aria-valuemin={1} aria-valuemax={STEPS.length} aria-valuenow={step + 1}>
        <span style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}/>
      </div>
    </div>

    <div className="quote-honeypot" aria-hidden="true">
      <label>Website<input tabIndex="-1" autoComplete="off" name="website" value={data.website} onChange={onInput}/></label>
    </div>

    {current.key === 'what' ? <section className="qs-step">
      <h3 className="qs-title" tabIndex={-1} ref={headingRef}>What are we moving?</h3>
      <p className="qs-help">Tap each item. Tap again to add more.</p>
      <ItemPicker items={data.items} onChange={items => { set('items', items); if (errors.itemOther) setErrors(current => ({ ...current, itemOther: '' })); }}/>
      <Field label="Something not listed?" name="itemOther" error={err('itemOther')} optional>
        <input id="qs-itemOther" name="itemOther" value={data.itemOther} onChange={onInput} placeholder="E.g. piano, treadmill, patio set" aria-invalid={Boolean(err('itemOther'))}/>
      </Field>
      <PhotoPicker photos={photos} onAdd={addPhotos} onRemove={removePhoto} error={err('photos')} disabled={status.sending}/>
    </section> : null}

    {current.key === 'where' ? <section className="qs-step">
      <h3 className="qs-title" tabIndex={-1} ref={headingRef}>From where to where?</h3>
      {['pickup', 'dropoff'].map(side => <fieldset className="qs-place" key={side}>
        <legend>{side === 'pickup' ? 'Pickup' : 'Drop-off'}</legend>
        <Field label="Street address" name={`${side}Address`} error={err(`${side}Address`)}>
          <input id={`qs-${side}Address`} name={`${side}Address`} autoComplete={side === 'pickup' ? 'street-address' : 'off'} value={data[`${side}Address`]} onChange={onInput} placeholder={side === 'pickup' ? 'Where we pick it up' : 'Where it’s going'} aria-invalid={Boolean(err(`${side}Address`))}/>
        </Field>
        <div className="row">
          <Field label="City" name={`${side}City`} error={err(`${side}City`)}>
            <input id={`qs-${side}City`} name={`${side}City`} value={data[`${side}City`]} onChange={onInput} placeholder="City" aria-invalid={Boolean(err(`${side}City`))}/>
          </Field>
          <Field label="Postal code" name={`${side}PostalCode`} error={err(`${side}PostalCode`)} optional>
            <input id={`qs-${side}PostalCode`} name={`${side}PostalCode`} autoComplete={side === 'pickup' ? 'postal-code' : 'off'} value={data[`${side}PostalCode`]} onChange={onInput} placeholder="A1A 1A1"/>
          </Field>
        </div>
        <span className="quote-choice-label">Stairs or elevator? <small className="quote-optional">(only if it applies)</small></span>
        <Chips name={`${side}Access`} label={`${side === 'pickup' ? 'Pickup' : 'Drop-off'} stairs or elevator`} options={ACCESS} value={data[`${side}Access`]} onPick={value => set(`${side}Access`, value)}/>
      </fieldset>)}
    </section> : null}

    {current.key === 'when' ? <section className="qs-step">
      <h3 className="qs-title" tabIndex={-1} ref={headingRef}>When?</h3>
      <Field label="Date" name="preferredDate" error={err('preferredDate')}>
        <input id="qs-preferredDate" type="date" name="preferredDate" min={todayIso()} value={data.preferredDate} onChange={onInput} aria-invalid={Boolean(err('preferredDate'))}/>
      </Field>
      <span className="quote-choice-label">Time of day <small className="quote-optional">(optional)</small></span>
      <Chips name="preferredTime" label="Time of day" options={TIMES} value={data.preferredTime} onPick={value => set('preferredTime', value)}/>
      <label className="qs-check">
        <input type="checkbox" name="flexible" checked={data.flexible} onChange={onInput}/>
        I’m flexible on the date
      </label>
    </section> : null}

    {current.key === 'contact' ? <section className="qs-step">
      <h3 className="qs-title" tabIndex={-1} ref={headingRef}>How do we reach you?</h3>
      <Field label="Name" name="name" error={err('name')}>
        <input id="qs-name" name="name" autoComplete="name" value={data.name} onChange={onInput} placeholder="Your name" aria-invalid={Boolean(err('name'))}/>
      </Field>
      <Field label="Phone" name="phone" error={err('phone')}>
        <input id="qs-phone" type="tel" name="phone" autoComplete="tel" inputMode="tel" value={data.phone} onChange={onInput} placeholder="(___) ___-____" aria-invalid={Boolean(err('phone'))}/>
      </Field>
      <Field label="Email" name="email" error={err('email')}>
        <input id="qs-email" type="email" name="email" autoComplete="email" inputMode="email" value={data.email} onChange={onInput} placeholder="you@email.com" aria-invalid={Boolean(err('email'))}/>
      </Field>
      <p className="qs-help">Your written quote is emailed to you. We only call if we have a question.</p>
    </section> : null}

    {current.key === 'review' ? <section className="qs-step">
      <h3 className="qs-title" tabIndex={-1} ref={headingRef}>Check and send</h3>
      <dl className="qs-review">
        <div><dt>Items</dt><dd>{itemsText(data)}{photos.length ? <small> · {photos.length} photo{photos.length > 1 ? 's' : ''}</small> : null}</dd><button type="button" onClick={() => setStep(0)}>Edit</button></div>
        <div><dt>Pickup</dt><dd>{place(data, 'pickup')}{data.pickupAccess ? <small> · {data.pickupAccess}</small> : null}</dd><button type="button" onClick={() => setStep(1)}>Edit</button></div>
        <div><dt>Drop-off</dt><dd>{place(data, 'dropoff')}{data.dropoffAccess ? <small> · {data.dropoffAccess}</small> : null}</dd><button type="button" onClick={() => setStep(1)}>Edit</button></div>
        <div><dt>Date</dt><dd>{whenText(data)}</dd><button type="button" onClick={() => setStep(2)}>Edit</button></div>
        <div><dt>Contact</dt><dd>{data.name}<br/>{data.phone}<br/>{data.email}</dd><button type="button" onClick={() => setStep(3)}>Edit</button></div>
      </dl>
      <Field label="Anything else we should know?" name="message" optional>
        <textarea id="qs-message" name="message" rows="2" value={data.message} onChange={onInput} placeholder="Parking, tight hallway, needs assembly…"/>
      </Field>
      <Field label="How did you hear about us?" name="referralSource" optional>
        <select id="qs-referralSource" name="referralSource" value={data.referralSource} onChange={onInput}>
          <option value="">Select an option</option>
          {referral ? <option value={referral}>{referral}</option> : null}
          <option value="Google Search">Google Search</option>
          <option value="Google Maps">Google Maps</option>
          <option value="Facebook">Facebook</option>
          <option value="Instagram">Instagram</option>
          <option value="Friend or family">Friend or family</option>
          <option value="Returning customer">Returning customer</option>
          <option value="Other">Other</option>
        </select>
      </Field>
      <p className="qs-help">This is a request, not a booking. We’ll send a written quote first.</p>
    </section> : null}

    {status.message ? <p className="fine quote-status qs-status" role="status" aria-live="polite">{status.message}</p> : null}

    <div className="qs-nav">
      {step > 0 ? <button type="button" className="btn btn-line qs-back" onClick={back} disabled={status.sending}><ArrowLeft size={18}/> Back</button> : null}
      <button type="submit" className="btn btn-accent qs-next-btn" disabled={status.sending}>
        {current.key === 'review' ? (status.sending ? 'Sending…' : 'Send my request →') : 'Continue →'}
      </button>
    </div>
  </form>;
}
