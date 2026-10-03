'use client';

import { useEffect, useId, useState } from 'react';
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
  website: '',
};

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
}) {
  const drawerId = useId();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ ...initialState, service: preset });
  const [state, setState] = useState({ sending: false, message: '', fieldErrors: {} });

  useEffect(() => {
    if (!global) return undefined;

    function openQuoteDrawer(event) {
      const nextPreset = String(event?.detail?.preset || '').trim();
      if (nextPreset) setForm(current => ({ ...current, service: nextPreset }));
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
    setState({ sending: true, message: '', fieldErrors: {} });

    try {
      const response = await fetch('/api/quote', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ...form, quickRequest: compact }),
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

      setForm({ ...initialState, service: preset });
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
            Move / Service Date *
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

        {!compact ? <label>Move / Job Size
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

      {!compact ? <>
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
          <label>Item List
            <textarea rows="5" name="itemList" value={form.itemList} onChange={update} placeholder="List the furniture, boxes, equipment or other items to be transported"/>
          </label>
          <label>Additional Details
            <textarea rows="3" name="message" value={form.message} onChange={update} placeholder="Heavy items, access details, packing, disassembly, special instructions…"/>
          </label>
        </div>
      </> : null}

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
              <p>Tell us what you need moved and where it is going.</p>
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
