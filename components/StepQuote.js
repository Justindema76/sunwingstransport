'use client';

// Quote drawer: the customer picks a service first, then gets that service's own short
// step-by-step form. Their answers build a "job pass" as they go; it becomes
// the review screen and, once sent, is stamped with their reference number.
// Every service from the admin shows up automatically; its steps are chosen by service type.
// Posts the same fields as the long form to /api/quote, so requests land in Admin › Quotes.
import { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft, Armchair, Archive, BedDouble, Bed, BookOpen, Box, Boxes, Building2, CalendarDays, Check, ChevronRight,
  Container, CookingPot, Forklift, HandHelping, House, Lamp, MapPin, Monitor, PackageCheck, Refrigerator, Route,
  Snowflake, Sofa, Table, Trash2, Truck, Tv, UsersRound, WashingMachine,
} from 'lucide-react';
import { trackEvent } from './SiteAnalytics';
import { MAX_PHOTOS, PhotoPicker, leadSource, uploadPhotos } from './quoteShared';
import './quoteSteps.css';

const LONG_DISTANCE = { title: 'Long Distance Moving', slug: 'long-distance', eyebrow: 'Ontario & beyond' };

// ---- What each kind of service asks ---------------------------------------------------------
export function kindOf(service) {
  const text = `${service?.title || ''} ${service?.slug || ''}`.toLowerCase();
  if (/snow/.test(text)) return 'snow';
  if (/assist/.test(text)) return 'assist';
  if (/junk|haul|removal/.test(text)) return 'junk';
  if (/warehouse|container|unload/.test(text)) return 'warehouse';
  if (/packing|protection|wrap/.test(text)) return 'packing';
  if (/long.?distance/.test(text)) return 'longdistance';
  if (/residential|moving|move/.test(text)) return 'move';
  if (/furniture|deliver|single item/.test(text)) return 'delivery';
  if (/commercial|business|office/.test(text)) return 'commercial';
  return 'general';
}

const FLOWS = {
  delivery: ['items', 'route', 'when', 'contact', 'review'],
  move: ['size', 'items', 'route', 'when', 'contact', 'review'],
  longdistance: ['size', 'items', 'route', 'when', 'contact', 'review'],
  junk: ['items', 'place', 'when', 'contact', 'review'],
  packing: ['size', 'place', 'when', 'contact', 'review'],
  warehouse: ['job', 'place', 'when', 'contact', 'review'],
  commercial: ['job', 'route', 'when', 'contact', 'review'],
  assist: ['job', 'route', 'when', 'contact', 'review'],
  general: ['job', 'place', 'when', 'contact', 'review'],
  snow: ['place', 'snow', 'when', 'contact', 'review'],
};

const STEP_LABEL = { items: 'Items', size: 'Size', job: 'The job', route: 'Route', place: 'Address', snow: 'Areas', when: 'Date', contact: 'You', review: 'Pass' };

const SERVICE_ICON = { delivery: Armchair, move: House, longdistance: Route, junk: Trash2, packing: PackageCheck, warehouse: Forklift, commercial: Building2, assist: HandHelping, general: UsersRound, snow: Snowflake };

const ITEMS = [
  ['Sofa / couch', Sofa], ['Sectional', Sofa], ['Armchair', Armchair], ['Bed + mattress', BedDouble], ['Mattress only', Bed],
  ['Dresser', Archive], ['Nightstand', Lamp], ['Dining table', Table], ['Dining chair', Armchair], ['Desk', Monitor],
  ['Bookshelf', BookOpen], ['TV', Tv], ['Fridge', Refrigerator], ['Washer', WashingMachine], ['Dryer', WashingMachine],
  ['Stove', CookingPot], ['Boxes', Boxes], ['Bins / bags', Box],
];

const SIZES = [['Studio', 'Bachelor or room'], ['1 bedroom', 'Apartment or condo'], ['2 bedrooms', 'Apartment or small house'], ['3 bedrooms', 'House'], ['4+ bedrooms', 'Large house'], ['Office', 'Business or studio']];

const JOB_CHIPS = {
  warehouse: ['20 ft container', '40 ft container', '53 ft trailer', 'Pallets / skids', 'Loose boxes'],
  commercial: ['Office furniture', 'Store fixtures', 'Equipment', 'Inventory / stock', 'Regular runs'],
  assist: ['Yes, at both ends', 'Pickup only', 'Drop-off only', 'No, the crew does it all'],
  general: ['Loading', 'Unloading', 'Moving things around', 'Assembly', 'Heavy lifting'],
};
const JOB_TITLE = {
  warehouse: 'What are we unloading?',
  commercial: 'What are we moving for your business?',
  assist: 'Will someone be there to help at both ends?',
  general: 'What do you need done?',
};

const SNOW_AREAS = ['Driveway', 'Front walkway', 'Front steps', 'Sidewalk', 'Side or back path', 'Parking pad'];
const SNOW_PLANS = ['Seasonal plan', 'One-time clear', 'Large & corner lots', 'Not sure yet'];
const ACCESS = ['No stairs', 'Stairs', 'Elevator'];
const TIMES = ['Any time', 'Morning', 'Afternoon', 'Evening'];

const blank = {
  items: {}, itemOther: '', moveSize: '', jobChips: [], jobText: '', snowAreas: [], snowPlan: '', plan: '',
  pickupAddress: '', pickupCity: '', pickupPostalCode: '', pickupAccess: '',
  dropoffAddress: '', dropoffCity: '', dropoffPostalCode: '', dropoffAccess: '',
  preferredDate: '', preferredTime: '', flexible: false,
  name: '', phone: '', email: '',
  message: '', referralSource: '', website: '',
};

const FIELD_STEP = {
  itemList: ['items', 'size', 'job'], moveSize: ['size'],
  pickupAddress: ['route', 'place'], pickupCity: ['route', 'place'], pickupPostalCode: ['route', 'place'],
  dropoffAddress: ['route'], dropoffCity: ['route'], dropoffPostalCode: ['route'],
  preferredDate: ['when'], name: ['contact'], phone: ['contact'], email: ['contact'],
};

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ---- Small helpers --------------------------------------------------------------------------
function isoOf(date) {
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}
const todayIso = () => isoOf(new Date());

function quickDates() {
  const now = new Date();
  const add = days => { const d = new Date(now); d.setDate(d.getDate() + days); return d; };
  const sat = add(((6 - now.getDay()) + 7) % 7 || 7);
  const nextSat = new Date(sat); nextSat.setDate(sat.getDate() + 7);
  return [['Tomorrow', isoOf(add(1))], ['This Saturday', isoOf(sat)], ['Next Saturday', isoOf(nextSat)], ['In a month', isoOf(add(30))]];
}

function newReference() {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  const values = typeof crypto !== 'undefined' && crypto.getRandomValues ? crypto.getRandomValues(new Uint8Array(6)) : null;
  let out = '';
  for (let i = 0; i < 6; i += 1) out += chars[(values ? values[i] : Math.floor(Math.random() * 256)) % chars.length];
  return `SW-${out}`;
}

function formatDate(iso, short = false) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso || '')) return '';
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-CA', short ? { weekday: 'short', month: 'short', day: 'numeric' } : { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}

function itemsText(items) {
  return Object.entries(items || {}).filter(([, n]) => n > 0).map(([name, n]) => `${n} × ${name}`).join(', ');
}
const itemCount = items => Object.values(items || {}).reduce((sum, n) => sum + (n > 0 ? n : 0), 0);

function accessFields(value) {
  if (value === 'Stairs') return { stairs: 'yes', elevator: 'no' };
  if (value === 'Elevator') return { stairs: 'no', elevator: 'yes' };
  if (value === 'No stairs') return { stairs: 'no', elevator: 'no' };
  return { stairs: '', elevator: '' };
}

const place = (data, side) => [data[`${side}Address`], data[`${side}City`], data[`${side}PostalCode`]].map(v => String(v || '').trim()).filter(Boolean).join(', ');

function whenText(data) {
  return [formatDate(data.preferredDate), data.preferredTime && data.preferredTime !== 'Any time' ? `(${data.preferredTime.toLowerCase()})` : '', data.flexible ? '· flexible' : ''].filter(Boolean).join(' ');
}

// The quote's item list, written the way it reads in Admin › Quotes.
function itemListFor(kind, data) {
  if (kind === 'snow') return [data.snowAreas.length ? `Areas to clear: ${data.snowAreas.join(', ')}` : '', data.itemOther.trim()].filter(Boolean).join('\n\n');
  const parts = [];
  if (data.moveSize) parts.push(`Size: ${data.moveSize}`);
  if (kind !== 'assist' && data.jobChips.length) parts.push(data.jobChips.join(', '));
  if (data.jobText.trim()) parts.push(data.jobText.trim());
  if (itemsText(data.items)) parts.push(itemsText(data.items));
  if (data.itemOther.trim()) parts.push(data.itemOther.trim());
  return parts.join('\n');
}

function validateStep(key, kind, data) {
  const e = {};
  if (key === 'items' && !itemsText(data.items) && !data.itemOther.trim() && kind !== 'move' && kind !== 'longdistance') e.itemOther = 'Tap at least one item, or type what it is.';
  if (key === 'size' && !data.moveSize) e.moveSize = 'Pick the closest size.';
  if (key === 'job' && kind === 'assist' && !data.jobChips.length) e.jobChips = 'Pick one of the answers above.';
  if (key === 'job' && kind !== 'assist' && !data.jobChips.length && !data.jobText.trim()) e.jobText = 'Tap one or more, or tell us in a few words.';
  if (key === 'route' || key === 'place') {
    if (!data.pickupAddress.trim()) e.pickupAddress = key === 'place' ? 'Enter the address.' : 'Enter the pickup address.';
    if (!data.pickupCity.trim()) e.pickupCity = 'Enter the city.';
    if (kind === 'snow' && !data.pickupPostalCode.trim()) e.pickupPostalCode = 'Enter the postal code.';
  }
  if (key === 'route') {
    if (!data.dropoffAddress.trim()) e.dropoffAddress = 'Enter the drop-off address.';
    if (!data.dropoffCity.trim()) e.dropoffCity = 'Enter the city.';
  }
  if (key === 'when') {
    if (!data.preferredDate) e.preferredDate = 'Pick a date. If you’re flexible, pick roughly when.';
    else if (!/^20\d{2}-\d{2}-\d{2}$/.test(data.preferredDate)) e.preferredDate = 'Pick a valid date.';
    else if (data.preferredDate < todayIso()) e.preferredDate = 'Pick a date from today on.';
  }
  if (key === 'contact') {
    if (!data.name.trim()) e.name = 'Enter your name.';
    if (data.phone.replace(/\D/g, '').length < 10) e.phone = 'Enter a phone number with at least 10 digits.';
    if (!data.email.trim()) e.email = 'Enter your email. Your written quote is sent there.';
    else if (!EMAIL.test(data.email.trim())) e.email = 'Enter a valid email address.';
  }
  return e;
}

// ---- State (kept by the drawer so progress survives Back and closing the drawer) ------------
export function useStepQuote() {
  const [service, setService] = useState(null);
  const [data, setData] = useState(blank);
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ sending: false, message: '' });
  const [photos, setPhotos] = useState([]);
  const [done, setDone] = useState(null);
  const photosRef = useRef(photos);
  photosRef.current = photos;
  useEffect(() => () => photosRef.current.forEach(photo => URL.revokeObjectURL(photo.preview)), []);

  function reset(keep = {}) {
    photosRef.current.forEach(photo => URL.revokeObjectURL(photo.preview));
    setPhotos([]);
    setService(null);
    setData({ ...blank, ...keep });
    setStep(0);
    setErrors({});
    setStatus({ sending: false, message: '' });
    setDone(null);
  }

  // Switching service keeps the shared answers (addresses, date, contact) and starts its steps.
  function choose(next) {
    setService(next);
    setStep(0);
    setErrors({});
    setStatus({ sending: false, message: '' });
  }

  return { service, choose, data, setData, step, setStep, errors, setErrors, status, setStatus, photos, setPhotos, done, setDone, reset };
}

// limitTo: optional list of offered services ({ serviceSlug, preset }), e.g. a region that
// only offers some of them. A preset entry (like Long Distance) is matched by its title.
export function serviceOptionsFor(services = [], preset = '', limitTo = null) {
  let list = services.filter(item => item?.title).map(({ title, slug, eyebrow, banner_image }) => ({ title, slug, eyebrow, banner_image }));
  if (!list.some(item => kindOf(item) === 'longdistance')) list.push(LONG_DISTANCE);
  if (Array.isArray(limitTo) && limitTo.length) {
    const slugs = limitTo.filter(item => !item.preset).map(item => item.serviceSlug);
    const titles = limitTo.filter(item => item.preset).map(item => item.preset);
    list = [
      ...list.filter(item => titles.includes(item.title) || (kindOf(item) === 'longdistance' && titles.some(t => kindOf({ title: t }) === 'longdistance'))),
      ...list.filter(item => slugs.includes(item.slug)),
    ];
  }
  if (preset && !list.some(item => item.title === preset)) list.push({ title: preset, slug: '', eyebrow: '' });
  return list;
}

// ---- Pieces ---------------------------------------------------------------------------------
function Field({ label, name, error, optional, children }) {
  return <label className={error ? 'field-has-error' : ''} htmlFor={`qs-${name}`}>
    {label}{optional ? <small className="quote-optional"> (optional)</small> : null}
    {children}
    {error ? <small className="field-error">{error}</small> : null}
  </label>;
}

function Chips({ options, value, onPick, multiple = false, label, icons = {} }) {
  const on = option => (multiple ? value.includes(option) : value === option);
  const pick = option => {
    if (multiple) onPick(on(option) ? value.filter(v => v !== option) : [...value, option]);
    else onPick(on(option) ? '' : option);
  };
  return <div className="qs-chips" role="group" aria-label={label}>
    {options.map(option => {
      const Icon = icons[option];
      return <button type="button" key={option} className={on(option) ? 'is-on' : ''} aria-pressed={on(option)} onClick={() => pick(option)}>
        {Icon ? <Icon size={16}/> : null}{option}{on(option) ? <Check size={15} className="qs-chip-check"/> : null}
      </button>;
    })}
  </div>;
}

function ItemGrid({ items, onChange }) {
  const add = (name, delta) => onChange({ ...items, [name]: Math.max(0, Math.min(99, (items[name] || 0) + delta)) });
  return <ul className="qs-items" aria-label="Pick your items">
    {ITEMS.map(([name, Icon]) => {
      const n = items[name] || 0;
      return <li key={name} className={n ? 'is-on' : ''}>
        <button type="button" className="qs-item-add" onClick={() => add(name, 1)} aria-label={`Add ${name}${n ? ` (now ${n})` : ''}`}>
          <span className="qs-item-icon"><Icon size={22}/></span>
          <span className="qs-item-name">{name}</span>
          {n ? <b className="qs-item-count">{n}</b> : <i className="qs-item-plus" aria-hidden="true">+</i>}
        </button>
        {n ? <button type="button" className="qs-item-minus" onClick={() => add(name, -1)} aria-label={`Remove one ${name}`}>−</button> : null}
      </li>;
    })}
  </ul>;
}

function AddressBlock({ side, data, err, onInput, set, title, dot, postalRequired }) {
  return <div className={`qs-stop qs-stop-${dot}`}>
    <span className="qs-stop-dot" aria-hidden="true">{dot === 'end' ? <MapPin size={16}/> : null}</span>
    <div className="qs-stop-body">
      <h4>{title}</h4>
      <Field label="Street address" name={`${side}Address`} error={err(`${side}Address`)}>
        <input id={`qs-${side}Address`} name={`${side}Address`} autoComplete={side === 'pickup' ? 'street-address' : 'off'} value={data[`${side}Address`]} onChange={onInput} placeholder="123 Main St" aria-invalid={Boolean(err(`${side}Address`))}/>
      </Field>
      <div className="row">
        <Field label="City" name={`${side}City`} error={err(`${side}City`)}>
          <input id={`qs-${side}City`} name={`${side}City`} value={data[`${side}City`]} onChange={onInput} placeholder="City" aria-invalid={Boolean(err(`${side}City`))}/>
        </Field>
        <Field label="Postal code" name={`${side}PostalCode`} error={err(`${side}PostalCode`)} optional={!postalRequired}>
          <input id={`qs-${side}PostalCode`} name={`${side}PostalCode`} autoComplete={side === 'pickup' ? 'postal-code' : 'off'} value={data[`${side}PostalCode`]} onChange={onInput} placeholder="A1A 1A1" aria-invalid={Boolean(err(`${side}PostalCode`))}/>
        </Field>
      </div>
      {set ? <>
        <span className="quote-choice-label">Stairs or elevator? <small className="quote-optional">(only if it applies)</small></span>
        <Chips label={`${title} stairs or elevator`} options={ACCESS} value={data[`${side}Access`]} onPick={value => set(`${side}Access`, value)}/>
      </> : null}
    </div>
  </div>;
}

// The job pass: what we know about the job so far.
function Pass({ service, kind, data, photos, reference, stamped, onEdit, steps }) {
  const Icon = SERVICE_ICON[kind] || Truck;
  const from = data.pickupCity.trim();
  const to = data.dropoffCity.trim();
  const rows = [];
  const editTo = key => (onEdit && steps.includes(key) ? () => onEdit(steps.indexOf(key)) : null);
  if (data.moveSize) rows.push(['Size', data.moveSize, editTo('size')]);
  if (kind === 'snow') {
    if (data.snowAreas.length) rows.push(['Clear', data.snowAreas.join(', '), editTo('snow')]);
    if (data.snowPlan) rows.push(['Plan', data.snowPlan, editTo('snow')]);
  }
  if (kind !== 'snow' && (data.jobChips.length || data.jobText.trim())) rows.push([kind === 'assist' ? 'Help on site' : 'Job', [data.jobChips.join(', '), data.jobText.trim()].filter(Boolean).join(' · '), editTo('job')]);
  const items = [itemsText(data.items), data.itemOther.trim()].filter(Boolean).join(' · ');
  if (items) rows.push(['Items', `${items}${photos ? ` · ${photos} photo${photos > 1 ? 's' : ''}` : ''}`, editTo(steps.includes('items') ? 'items' : 'place')]);
  if (data.pickupAddress.trim()) rows.push([steps.includes('route') ? 'Pickup' : 'Address', `${place(data, 'pickup')}${data.pickupAccess ? ` · ${data.pickupAccess}` : ''}`, editTo(steps.includes('route') ? 'route' : 'place')]);
  if (data.dropoffAddress.trim()) rows.push(['Drop-off', `${place(data, 'dropoff')}${data.dropoffAccess ? ` · ${data.dropoffAccess}` : ''}`, editTo('route')]);
  if (data.name.trim()) rows.push(['Customer', [data.name, data.phone, data.email].map(v => v.trim()).filter(Boolean).join(' · '), editTo('contact')]);

  return <div className={`qs-pass ${stamped ? 'is-stamped' : ''}`}>
    <div className="qs-pass-top">
      <span className="qs-pass-brand">Sunwings Transport</span>
      <span className="qs-pass-service"><Icon size={15}/> {service?.title}</span>
    </div>
    <div className="qs-pass-route">
      <div><small>From</small><strong>{from || '—'}</strong></div>
      <span className="qs-pass-plane" aria-hidden="true"><Truck size={20}/></span>
      <div className="qs-pass-to"><small>{steps.includes('route') ? 'To' : 'Date'}</small><strong>{steps.includes('route') ? (to || '—') : (formatDate(data.preferredDate, true) || '—')}</strong></div>
    </div>
    <div className="qs-pass-strip">
      <div><small>Date</small><b>{formatDate(data.preferredDate, true) || 'Not set'}</b></div>
      <div><small>Time</small><b>{data.preferredTime || (data.preferredDate ? 'Any time' : '—')}</b></div>
      <div><small>Ref</small><b>{reference || 'On send'}</b></div>
    </div>
    {rows.length ? <dl className="qs-pass-rows">
      {rows.map(([label, value, edit]) => <div key={label}>
        <dt>{label}</dt><dd>{value}</dd>
        {edit && !stamped ? <button type="button" onClick={edit}>Edit</button> : null}
      </div>)}
    </dl> : null}
    {stamped ? <div className="qs-stamp" aria-hidden="true"><span>Request<br/>received</span></div> : null}
  </div>;
}

// ---- Service picker -------------------------------------------------------------------------
export function ServicePicker({ options, onPick }) {
  return <div className="qs-pick">
    <p className="qs-pick-lead">Pick a service. We’ll only ask what that job needs.</p>
    <div className="qs-tiles">
      {options.map(option => {
        const kind = kindOf(option);
        const Icon = SERVICE_ICON[kind] || Truck;
        return <button type="button" key={option.title} className="qs-tile" onClick={() => onPick(option)}>
          <span className="qs-tile-icon"><Icon size={22}/></span>
          <span className="qs-tile-text"><b>{option.title}</b>{option.eyebrow && option.eyebrow.toLowerCase() !== option.title.toLowerCase() ? <small>{option.eyebrow}</small> : null}</span>
          <ChevronRight size={18} className="qs-tile-go"/>
        </button>;
      })}
    </div>
  </div>;
}

// ---- The step form --------------------------------------------------------------------------
export default function StepQuote({ quote, referral = '', replyHours = '', onClose, onChangeService }) {
  const { service, data, setData, step, setStep, errors, setErrors, status, setStatus, photos, setPhotos, done, setDone, reset } = quote;
  const kind = kindOf(service);
  const steps = FLOWS[kind] || FLOWS.general;
  const key = steps[Math.min(step, steps.length - 1)];
  const headingRef = useRef(null);
  const refRef = useRef('');
  const mounted = useRef(false);

  useEffect(() => {
    if (!mounted.current) { mounted.current = true; return; }
    headingRef.current?.focus({ preventScroll: true });
    headingRef.current?.closest('.quote-drawer-body')?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step, done]);

  useEffect(() => {
    if (!done) trackEvent('quote_step', { step_number: step + 1, step_name: key, service: service?.title || '', lead_source: 'step_quote' });
  }, [step, done, key, service]);

  function set(name, value) {
    setData(current => ({ ...current, [name]: value }));
    if (errors[name]) setErrors(current => ({ ...current, [name]: '' }));
  }
  const clear = names => setErrors(current => { const next = { ...current }; names.forEach(n => { next[n] = ''; }); return next; });
  const onInput = event => set(event.target.name, event.target.type === 'checkbox' ? event.target.checked : event.target.value);

  function addPhotos(event) {
    const picked = [...(event.target.files || [])].filter(file => /^image\//.test(file.type) || /\.(jpe?g|png|webp|heic|heif)$/i.test(file.name));
    event.target.value = '';
    setPhotos(current => [...current, ...picked.slice(0, MAX_PHOTOS - current.length).map(file => ({ file, preview: URL.createObjectURL(file) }))]);
    clear(['photos']);
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
    if (key === 'review') { send(); return; }
    const found = validateStep(key, kind, data);
    if (Object.values(found).some(Boolean)) {
      setErrors(found);
      setTimeout(() => document.getElementById(`qs-${Object.keys(found)[0]}`)?.focus(), 0);
      return;
    }
    setErrors({});
    setStatus({ sending: false, message: '' });
    setStep(step + 1);
  }

  function back() {
    if (status.sending) return;
    setErrors({});
    setStatus({ sending: false, message: '' });
    if (step === 0) onChangeService?.();
    else setStep(step - 1);
  }

  async function send() {
    for (let i = 0; i < steps.length - 1; i += 1) {
      const found = validateStep(steps[i], kind, data);
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
      setStatus({ sending: false, message: `${error.message || 'A photo did not upload.'} You can remove it and send without it.` });
      return;
    }

    const route = steps.includes('route');
    const pickup = accessFields(data.pickupAccess);
    const dropoff = route ? accessFields(data.dropoffAccess) : { stairs: '', elevator: '' };
    const payload = {
      name: data.name, phone: data.phone, email: data.email,
      service: service?.title || '',
      moveSize: data.moveSize || data.snowPlan || data.plan || (kind === 'delivery' ? 'Furniture / item delivery' : ''),
      preferredDate: data.preferredDate,
      preferredTime: data.preferredTime && data.preferredTime !== 'Any time' ? data.preferredTime : '',
      pickupAddress: data.pickupAddress, pickupCity: data.pickupCity, pickupPostalCode: data.pickupPostalCode,
      pickupStairs: pickup.stairs, pickupElevator: pickup.elevator,
      dropoffAddress: route ? data.dropoffAddress : '', dropoffCity: route ? data.dropoffCity : '', dropoffPostalCode: route ? data.dropoffPostalCode : '',
      dropoffStairs: dropoff.stairs, dropoffElevator: dropoff.elevator,
      itemList: itemListFor(kind, data),
      message: [
        `Reference: ${reference}`,
        kind === 'assist' && data.jobChips.length ? `Help available at both ends? ${data.jobChips.join(', ')}` : '',
        data.plan ? `Plan picked on the site: ${data.plan}` : '',
        data.flexible ? 'Date is flexible.' : '',
        data.message.trim(),
        data.referralSource ? `How did you hear about us? ${data.referralSource}` : '',
        referral && data.referralSource !== referral ? `Partner referral link: ${referral}` : '',
        'Sent with the step-by-step quote form.',
      ].filter(Boolean).join('\n\n'),
      photos: photoPaths,
      leadSource: leadSource(),
      // Postal codes are optional here and single-address jobs have no drop-off,
      // so the server's full-request address checks are relaxed. Snow keeps its own checks.
      quickRequest: kind !== 'snow',
      snowRequest: kind === 'snow',
      website: data.website,
    };

    try {
      const response = await fetch('/api/quote', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        const fieldErrors = result.fieldErrors || {};
        const at = Object.keys(fieldErrors).filter(k => fieldErrors[k]).flatMap(k => FIELD_STEP[k] || []).map(k => steps.indexOf(k)).filter(i => i >= 0);
        setErrors(fieldErrors);
        setStatus({ sending: false, message: result.error || 'Unable to send your request. Please try again or call us.' });
        if (at.length) setStep(Math.min(...at));
        return;
      }
      trackEvent('generate_lead', { lead_source: 'step_quote', service: service?.title || '' });
      if (typeof window !== 'undefined' && typeof window.fbq === 'function') window.fbq('track', 'Lead');
      setDone({ reference, when: whenText(data), email: data.email.trim(), photos: photos.length });
      refRef.current = '';
      setStatus({ sending: false, message: '' });
    } catch (error) {
      setStatus({ sending: false, message: error.message || 'Unable to send your request. Please try again or call us.' });
    }
  }

  const err = name => errors[name] || '';
  const passProps = { service, kind, data, photos: photos.length, steps };

  if (done) {
    const hours = String(replyHours || '').trim();
    return <div className="qs qs-done" role="status" aria-live="polite">
      <h3 className="qs-title" tabIndex={-1} ref={headingRef}>You’re on the list!</h3>
      <p className="qs-help">Keep your reference number. It’s on your pass.</p>
      <Pass {...passProps} reference={done.reference} stamped/>
      <div className="qs-next">
        <h4>What happens next</h4>
        <ol>
          <li><span>1</span>We look over your request{done.photos ? ' and photos' : ''}.</li>
          <li><span>2</span>You get a written quote{done.email ? ` at ${done.email}` : ''}{hours ? ` within ${hours} hours` : ''}.</li>
          <li><span>3</span><div><b>Your date isn’t reserved yet.</b> It’s booked once you accept the quote and we confirm.</div></li>
        </ol>
      </div>
      <button type="button" className="btn btn-accent qs-wide" onClick={() => { reset({ referralSource: referral }); onClose?.(); }}>Done</button>
    </div>;
  }

  const Icon = SERVICE_ICON[kind] || Truck;

  return <form className="qs" onSubmit={next} noValidate>
    <div className="qs-head">
      <span className="qs-head-service"><Icon size={16}/> {service?.title}</span>
      <button type="button" className="qs-head-change" onClick={onChangeService}>Change</button>
    </div>

    <ol className="qs-steps" aria-label={`Step ${step + 1} of ${steps.length}`}>
      {steps.map((s, i) => <li key={s} className={i < step ? 'is-done' : i === step ? 'is-now' : ''}>
        <span>{i < step ? <Check size={13}/> : i + 1}</span><small>{STEP_LABEL[s]}</small>
      </li>)}
    </ol>

    <div className="quote-honeypot" aria-hidden="true">
      <label>Website<input tabIndex="-1" autoComplete="off" name="website" value={data.website} onChange={onInput}/></label>
    </div>

    <section className="qs-step" key={`${kind}-${key}`}>
      {key === 'items' ? <>
        <h3 className="qs-title" tabIndex={-1} ref={headingRef}>{kind === 'junk' ? 'What are we hauling away?' : kind === 'delivery' ? 'What are we moving?' : 'Any big items?'}</h3>
        <p className="qs-help">{kind === 'move' || kind === 'longdistance' ? 'Tap the big pieces so we bring the right truck. Skip it if you’re not sure.' : 'Tap each item. Tap again to add more.'}</p>
        <ItemGrid items={data.items} onChange={items => { set('items', items); clear(['itemOther']); }}/>
        <Field label="Something not listed?" name="itemOther" error={err('itemOther')} optional>
          <input id="qs-itemOther" name="itemOther" value={data.itemOther} onChange={onInput} placeholder="E.g. piano, treadmill, patio set" aria-invalid={Boolean(err('itemOther'))}/>
        </Field>
        <PhotoPicker photos={photos} onAdd={addPhotos} onRemove={removePhoto} error={err('photos')} disabled={status.sending}/>
      </> : null}

      {key === 'size' ? <>
        <h3 className="qs-title" tabIndex={-1} ref={headingRef}>{kind === 'packing' ? 'How much are we packing?' : 'How big is the move?'}</h3>
        <p className="qs-help">Pick the closest. It helps us send the right crew and truck.</p>
        <div className="qs-sizes" role="group" aria-label="Size">
          {SIZES.map(([label, sub], i) => <button type="button" id={i === 0 ? 'qs-moveSize' : undefined} key={label} className={data.moveSize === label ? 'is-on' : ''} aria-pressed={data.moveSize === label} onClick={() => set('moveSize', data.moveSize === label ? '' : label)}>
            <span className="qs-size-boxes" aria-hidden="true">{Array.from({ length: Math.min(i + 1, 5) }, (_, n) => <i key={n}/>)}</span>
            <b>{label}</b><small>{sub}</small>
          </button>)}
        </div>
        {err('moveSize') ? <small className="field-error">{err('moveSize')}</small> : null}
      </> : null}

      {key === 'job' ? <>
        <h3 className="qs-title" tabIndex={-1} ref={headingRef}>{JOB_TITLE[kind] || JOB_TITLE.general}</h3>
        <p className="qs-help">{kind === 'assist' ? 'So we know how many movers to send.' : 'Tap what fits. Add a few words if it helps.'}</p>
        <Chips label="Job" options={JOB_CHIPS[kind] || JOB_CHIPS.general} value={kind === 'assist' ? (data.jobChips[0] || '') : data.jobChips} multiple={kind !== 'assist'} onPick={value => { set('jobChips', Array.isArray(value) ? value : (value ? [value] : [])); clear(['jobText', 'jobChips']); }}/>
        {err('jobChips') ? <small className="field-error qs-chips-error">{err('jobChips')}</small> : null}
        <Field label={kind === 'assist' ? 'Anything we should know?' : 'Tell us a bit more'} name="jobText" error={err('jobText')} optional>
          <textarea id="qs-jobText" name="jobText" rows="3" value={data.jobText} onChange={onInput} placeholder={kind === 'warehouse' ? 'E.g. one 40 ft container of boxed furniture' : 'A few words is enough'} aria-invalid={Boolean(err('jobText'))}/>
        </Field>
        <PhotoPicker photos={photos} onAdd={addPhotos} onRemove={removePhoto} error={err('photos')} disabled={status.sending}/>
      </> : null}

      {key === 'route' ? <>
        <h3 className="qs-title" tabIndex={-1} ref={headingRef}>From where to where?</h3>
        <div className="qs-route">
          <AddressBlock side="pickup" title="Pickup" dot="start" data={data} err={err} onInput={onInput} set={set}/>
          <AddressBlock side="dropoff" title="Drop-off" dot="end" data={data} err={err} onInput={onInput} set={set}/>
        </div>
      </> : null}

      {key === 'place' ? <>
        <h3 className="qs-title" tabIndex={-1} ref={headingRef}>{kind === 'snow' ? 'Where’s the property?' : 'Where’s the job?'}</h3>
        <div className="qs-route is-single">
          <AddressBlock side="pickup" title={kind === 'snow' ? 'Property' : 'Address'} dot="end" data={data} err={err} onInput={onInput} set={kind === 'snow' ? null : set} postalRequired={kind === 'snow'}/>
        </div>
      </> : null}

      {key === 'snow' ? <>
        <h3 className="qs-title" tabIndex={-1} ref={headingRef}>What should we clear?</h3>
        <span className="quote-choice-label">Areas <small className="quote-optional">(tap all that apply)</small></span>
        <Chips label="Areas to clear" options={SNOW_AREAS} value={data.snowAreas} multiple onPick={value => set('snowAreas', value)}/>
        <span className="quote-choice-label">Plan <small className="quote-optional">(optional)</small></span>
        <Chips label="Plan" options={SNOW_PLANS} value={data.snowPlan} onPick={value => set('snowPlan', value)}/>
        <Field label="Driveway size or notes" name="itemOther" optional>
          <input id="qs-itemOther" name="itemOther" value={data.itemOther} onChange={onInput} placeholder="Single, double, long, corner lot…"/>
        </Field>
      </> : null}

      {key === 'when' ? <>
        <h3 className="qs-title" tabIndex={-1} ref={headingRef}>{kind === 'snow' ? 'When should we start?' : 'When?'}</h3>
        <div className="qs-quickdates" role="group" aria-label="Quick dates">
          {quickDates().map(([label, iso]) => <button type="button" key={label} className={data.preferredDate === iso ? 'is-on' : ''} onClick={() => set('preferredDate', iso)}>
            <CalendarDays size={16}/><b>{label}</b><small>{formatDate(iso, true)}</small>
          </button>)}
        </div>
        <Field label="Or pick a date" name="preferredDate" error={err('preferredDate')}>
          <input id="qs-preferredDate" type="date" name="preferredDate" min={todayIso()} value={data.preferredDate} onChange={onInput} aria-invalid={Boolean(err('preferredDate'))}/>
        </Field>
        <span className="quote-choice-label">Time of day <small className="quote-optional">(optional)</small></span>
        <Chips label="Time of day" options={TIMES} value={data.preferredTime} onPick={value => set('preferredTime', value)}/>
        <label className="qs-check">
          <input type="checkbox" name="flexible" checked={data.flexible} onChange={onInput}/>
          I’m flexible on the date
        </label>
      </> : null}

      {key === 'contact' ? <>
        <h3 className="qs-title" tabIndex={-1} ref={headingRef}>Who’s it for?</h3>
        <p className="qs-help">Your written quote is emailed to you. We only call if we have a question.</p>
        <Field label="Name" name="name" error={err('name')}>
          <input id="qs-name" name="name" autoComplete="name" value={data.name} onChange={onInput} placeholder="Your name" aria-invalid={Boolean(err('name'))}/>
        </Field>
        <Field label="Phone" name="phone" error={err('phone')}>
          <input id="qs-phone" type="tel" name="phone" autoComplete="tel" inputMode="tel" value={data.phone} onChange={onInput} placeholder="(___) ___-____" aria-invalid={Boolean(err('phone'))}/>
        </Field>
        <Field label="Email" name="email" error={err('email')}>
          <input id="qs-email" type="email" name="email" autoComplete="email" inputMode="email" value={data.email} onChange={onInput} placeholder="you@email.com" aria-invalid={Boolean(err('email'))}/>
        </Field>
      </> : null}

      {key === 'review' ? <>
        <h3 className="qs-title" tabIndex={-1} ref={headingRef}>Here’s your pass</h3>
        <p className="qs-help">Check it over. Tap Edit to fix anything.</p>
        <Pass {...passProps} onEdit={setStep}/>
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
        <p className="qs-help qs-fine">This is a request, not a booking. We send a written quote first.</p>
      </> : null}
    </section>

    {key !== 'review' && step > 0 ? <details className="qs-mini">
      <summary><Truck size={14}/> Your job so far</summary>
      <Pass {...passProps}/>
    </details> : null}

    {status.message ? <p className="fine quote-status qs-status" role="status" aria-live="polite">{status.message}</p> : null}

    <div className="qs-nav">
      <button type="button" className="btn btn-line qs-back" onClick={back} disabled={status.sending}><ArrowLeft size={18}/> Back</button>
      <button type="submit" className="btn btn-accent qs-next-btn" disabled={status.sending}>
        {key === 'review' ? (status.sending ? 'Sending…' : 'Send my request') : 'Continue'}
      </button>
    </div>
  </form>;
}
