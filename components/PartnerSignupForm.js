'use client';

import { useState } from 'react';
import { trackEvent } from './SiteAnalytics';

// Store partner sign-up (/partners). Arrives in Admin › Quotes like a contact message, marked
// "Store partner sign-up", so Justin can add the store in Admin › Store partners and send its QR card.
const initialState = { business: '', name: '', phone: '', email: '', location: '', volume: '', furniture: '', notes: '', website: '' };
const VOLUMES = ['1–2 a month', '3–5 a month', '6–10 a month', 'More than 10 a month', 'Not sure yet'];

export default function PartnerSignupForm({ area = '' }) {
  const [form, setForm] = useState(initialState);
  const [state, setState] = useState({ sending: false, message: '', fieldErrors: {}, done: false });

  function update(event) {
    const { name, value } = event.target;
    setForm(current => ({ ...current, [name]: value }));
    setState(current => ({ ...current, fieldErrors: current.fieldErrors?.[name] ? { ...current.fieldErrors, [name]: '' } : current.fieldErrors }));
  }

  async function submit(event) {
    event.preventDefault();
    const fieldErrors = {};
    if (!form.business.trim()) fieldErrors.business = 'Enter the business name.';
    if (!form.location.trim()) fieldErrors.location = 'Enter the store’s town or address.';
    if (Object.keys(fieldErrors).length) return setState({ sending: false, message: 'Please correct the highlighted fields.', fieldErrors, done: false });
    setState({ sending: true, message: '', fieldErrors: {}, done: false });
    try {
      const response = await fetch('/api/quote', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
          email: form.email,
          website: form.website,
          contactRequest: true,
          quickRequest: true,
          service: 'Store partner sign-up',
          leadSource: `Store partner sign-up${area ? ` · ${area}` : ''} · ${window.location.pathname}`,
          message: [
            'STORE PARTNER SIGN-UP',
            `Business: ${form.business}`,
            `Store location: ${form.location}`,
            form.volume ? `Deliveries: ${form.volume}` : '',
            form.furniture ? `Furniture they sell: ${form.furniture}` : '',
            form.notes ? `Notes: ${form.notes}` : '',
          ].filter(Boolean).join('\n'),
        }),
      });
      const result = await response.json();
      if (!response.ok) return setState({ sending: false, message: result.error || 'Unable to send.', fieldErrors: result.fieldErrors || {}, done: false });
      trackEvent('generate_lead', { lead_source: 'partner_signup', service: 'Store partner' });
      setForm(initialState);
      setState({ sending: false, fieldErrors: {}, done: true, message: 'Thanks! We’ll be in touch shortly with your store’s own referral link and QR card.' });
    } catch (error) {
      setState({ sending: false, fieldErrors: {}, done: false, message: error?.message || 'Unable to send.' });
    }
  }

  const errorFor = name => state.fieldErrors?.[name] || '';
  const field = (name, label, props = {}) => (
    <label className={errorFor(name) ? 'field-has-error' : ''}>
      {label}
      <input name={name} value={form[name]} onChange={update} aria-invalid={Boolean(errorFor(name))} {...props}/>
      {errorFor(name) ? <small className="field-error">{errorFor(name)}</small> : null}
    </label>
  );

  return (
    <form className="form-card contact-form" onSubmit={submit} noValidate>
      <h2>Become a delivery partner</h2>
      <p className="sub">Takes a minute. No account, no fees, no commitment.</p>
      <div className="quote-honeypot" aria-hidden="true">
        <label>Website<input tabIndex="-1" autoComplete="off" name="website" value={form.website} onChange={update}/></label>
      </div>
      {field('business', 'Business name *', { required: true, autoComplete: 'organization', placeholder: 'Your store' })}
      <div className="row">
        {field('name', 'Your name *', { required: true, autoComplete: 'name', placeholder: 'Contact name' })}
        {field('phone', 'Phone *', { required: true, type: 'tel', autoComplete: 'tel', placeholder: '(___) ___-____' })}
      </div>
      <div className="row">
        {field('email', 'Email', { type: 'email', autoComplete: 'email', placeholder: 'Optional' })}
        {field('location', 'Store town or address *', { required: true, placeholder: 'e.g. Grimsby' })}
      </div>
      <label>
        About how many deliveries?
        <select name="volume" value={form.volume} onChange={update}>
          <option value="">Choose (optional)</option>
          {VOLUMES.map(item => <option key={item} value={item}>{item}</option>)}
        </select>
      </label>
      {field('furniture', 'What do you sell?', { placeholder: 'e.g. sofas, dining sets, consignment furniture (optional)' })}
      <button className="btn btn-accent" type="submit" disabled={state.sending}>{state.sending ? 'Sending…' : 'Send →'}</button>
      {state.message ? <p className="fine quote-status" role="status" aria-live="polite">{state.message}</p> : null}
    </form>
  );
}
