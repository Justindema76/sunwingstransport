'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { trackEvent } from './SiteAnalytics';
import ItemPicker, { itemsText } from './ItemPicker';
import { MAX_PHOTOS, PhotoPicker, leadSource, pickFill, readReferral, rememberVisit, uploadPhotos } from './quoteShared';
import StepQuote, { ServicePicker, useStepQuote, serviceOptionsFor } from './StepQuote';

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
  items: {},
  message: '',
  referralSource: '',
  helpAtEnds: '',
  snowAreas: [],
  website: '',
};

// Service-specific questions. Their answers are written into the item list / notes on send,
// so they show in Admin › Quotes without new database columns.
const HELP_OPTIONS = ['Yes, at both ends', 'Pickup only', 'Drop-off only', 'No, the crew does it all'];
const SNOW_AREAS = ['Driveway', 'Front walkway', 'Front steps', 'Sidewalk', 'Side or back path', 'Parking pad'];

function ChoiceList({ name, options, value, onChange, multiple = false }) {
  const picked = multiple ? value : [value];
  return <div className="quote-choice-list" role="group">
    {options.map(option => <label key={option} className={picked.includes(option) ? 'is-on' : ''}>
      <input type={multiple ? 'checkbox' : 'radio'} name={name} value={option} checked={picked.includes(option)} onChange={onChange}/>
      {option}
    </label>)}
  </div>;
}

export const LONG_DISTANCE = 'Long Distance Moving';

function YesNo({ name, value, onChange }) {
  return <div className="quote-choice-row" role="group" aria-label={name}>
    <label><input type="radio" name={name} value="yes" checked={value === 'yes'} onChange={onChange}/> Yes</label>
    <label><input type="radio" name={name} value="no" checked={value === 'no'} onChange={onChange}/> No</label>
  </div>;
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
  // Drawer: the customer picks a service, then gets that service's step-by-step form.
  const stepQuote = useStepQuote();
  const serviceChoices = serviceOptionsFor(services);
  const findService = title => serviceChoices.find(item => item.title === title) || { title, slug: '', eyebrow: '' };

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
    stepQuote.setData(current => ({ ...current, referralSource: current.referralSource || label }));
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
      if (stepQuote.done) stepQuote.reset({ referralSource: referral });
      if (Object.keys(nextFill).length || nextPlan) stepQuote.setData(current => ({ ...current, ...nextFill, plan: nextPlan || current.plan }));
      if (nextPreset) stepQuote.choose(findService(nextPreset));
      setOpen(true);
    }

    window.addEventListener('sunwings:open-quote', openQuoteDrawer);
    return () => window.removeEventListener('sunwings:open-quote', openQuoteDrawer);
  }, [global, stepQuote.done, referral, services]); // eslint-disable-line react-hooks/exhaustive-deps

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
    if (!state.sending && !stepQuote.status.sending) setOpen(false);
  }

  function update(event) {
    const { name, value, type, checked } = event.target;
    setForm(current => ({
      ...current,
      [name]: type === 'checkbox'
        ? (checked ? [...current[name], value] : current[name].filter(item => item !== value))
        : value,
    }));
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
    if (/snow/i.test(form.service) && !form.pickupAddress.trim()) {
      setState({ sending: false, message: 'Please correct the highlighted fields.', fieldErrors: { pickupAddress: 'Enter the property address.' } });
      return;
    }
    if (form.service && needsItems && !itemsText(form.items, form.itemList)) {
      setState({ sending: false, message: 'Please correct the highlighted fields.', fieldErrors: { itemList: 'Tap the items, or type what you need moved.' } });
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
        body: JSON.stringify({ ...form, helpAtEnds: undefined, snowAreas: undefined, items: undefined, itemList: [
          snowJob && form.snowAreas.length ? `Areas to clear: ${form.snowAreas.join(', ')}` : '',
          snowJob ? form.itemList : itemsText(form.items, form.itemList),
        ].filter(Boolean).join('\n\n'), message: [
          assistJob && form.helpAtEnds ? `Help available at both ends? ${form.helpAtEnds}` : '',
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
  const assistJob = /client assist/i.test(form.service);
  // Long distance is its own page, not a service in the list, so it's added here. A preset that
  // isn't in the list (e.g. from an older link) is kept as an option so the select shows it.
  const serviceOptions = [...new Set([
    ...services.map(service => service.title),
    LONG_DISTANCE,
    ...(form.service ? [form.service] : []),
  ])];
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
          <label>Time Window
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
              {serviceOptions.map(title => <option value={title} key={title}>{title}</option>)}
            </select>
            {errorFor('service') ? <small className="field-error">{errorFor('service')}</small> : null}
          </label>
        </div>

        {assistJob ? <div className="quote-choice-block">
          <span className="quote-choice-label">Will someone be there to help at both ends?</span>
          <ChoiceList name="helpAtEnds" options={HELP_OPTIONS} value={form.helpAtEnds} onChange={update}/>
        </div> : null}

        {compact && snowJob ? <>
          <label className={errorFor('pickupAddress') ? 'field-has-error' : ''}>Property address *
            <input required name="pickupAddress" autoComplete="street-address" value={form.pickupAddress} onChange={update} placeholder="Address to be cleared" aria-invalid={Boolean(errorFor('pickupAddress'))}/>
            {errorFor('pickupAddress') ? <small className="field-error">{errorFor('pickupAddress')}</small> : null}
          </label>
          <div className="quote-choice-block">
            <span className="quote-choice-label">Areas to clear</span>
            <ChoiceList name="snowAreas" options={SNOW_AREAS} value={form.snowAreas} onChange={update} multiple/>
          </div>
        </> : null}

        {compact && fill ? <div className="row">
          <label>Moving from
            <input name="pickupCity" value={form.pickupCity} onChange={update} placeholder="City"/>
          </label>
          <label>Moving to
            <input name="dropoffCity" value={form.dropoffCity} onChange={update} placeholder="City"/>
          </label>
        </div> : null}

        {compact && !snowJob ? <div className={errorFor('itemList') ? 'field-has-error' : ''}>
          <span className="quote-choice-label">What are we moving? * <small className="quote-optional">Tap each item</small></span>
          <ItemPicker items={form.items} onChange={items => { setForm(current => ({ ...current, items })); setState(current => ({ ...current, fieldErrors: { ...current.fieldErrors, itemList: '' } })); }}/>
          <label>Something not listed? <small className="quote-optional">(optional)</small>
            <textarea rows="2" name="itemList" value={form.itemList} onChange={update} placeholder="E.g. piano, treadmill, 10 boxes" aria-invalid={Boolean(errorFor('itemList'))}/>
            {errorFor('itemList') ? <small className="field-error">{errorFor('itemList')}</small> : null}
          </label>
        </div> : null}

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
        <div className="quote-choice-block">
          <span className="quote-choice-label">Areas to clear</span>
          <ChoiceList name="snowAreas" options={SNOW_AREAS} value={form.snowAreas} onChange={update} multiple/>
        </div>
        <label>Property Details <small className="quote-optional">(optional)</small>
          <textarea rows="3" name="itemList" value={form.itemList} onChange={update} placeholder="Driveway size (single, double, long), corner lot…"/>
        </label>
        <label>Additional Details <small className="quote-optional">(optional)</small>
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
          <span className="quote-choice-label">Items * <small className="quote-optional">Tap each item</small></span>
          <ItemPicker items={form.items} onChange={items => { setForm(current => ({ ...current, items })); setState(current => ({ ...current, fieldErrors: { ...current.fieldErrors, itemList: '' } })); }}/>
          <label className={errorFor('itemList') ? 'field-has-error' : ''}>Something not listed? <small className="quote-optional">(optional)</small>
            <textarea rows="3" name="itemList" value={form.itemList} onChange={update} placeholder="Other furniture, boxes, equipment…" aria-invalid={Boolean(errorFor('itemList'))}/>
            {errorFor('itemList') ? <small className="field-error">{errorFor('itemList')}</small> : null}
          </label>
          <label>Additional Details <small className="quote-optional">(optional)</small>
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
              <h2 id={`${drawerId}-title`}>{stepQuote.done ? 'Request sent' : stepQuote.service ? 'Your quote' : 'What can we help with?'}</h2>
              <p>{stepQuote.done ? 'Here’s your job pass.' : stepQuote.service ? 'A few quick taps. About a minute.' : 'Every job gets its own short form.'}</p>
            </div>
            <button className="quote-drawer-close" type="button" onClick={closeDrawer} aria-label="Close quote form">
              <X size={21}/>
            </button>
          </header>
          <div className="quote-drawer-body">
            {stepQuote.service || stepQuote.done
              ? <StepQuote quote={stepQuote} referral={referral} replyHours={replyHours} onClose={() => setOpen(false)} onChangeService={() => stepQuote.choose(null)}/>
              : <ServicePicker options={serviceChoices} onPick={option => stepQuote.choose(option)}/>}
          </div>
        </aside>
      </> : null}
    </>
  );
}
