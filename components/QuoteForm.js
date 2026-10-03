'use client';

import { useState } from 'react';
import { trackEvent } from './SiteAnalytics';

const initialState = {
  name: '',
  phone: '',
  email: '',
  service: '',
  moveFrom: '',
  moveTo: '',
  preferredDate: '',
  moveSize: '',
  message: '',
  website: '',
};

export default function QuoteForm({ services = [], compact = false, preset = '', replyHours = '' }) {
  const [form, setForm] = useState({ ...initialState, service: preset });
  const [state, setState] = useState({ sending: false, message: '', fieldErrors: {} });

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
        body: JSON.stringify(form),
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

      trackEvent('generate_lead', { lead_source:'quote_form', service:form.service || preset || '' });
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

  return (
    <form className={`form-card ${compact ? 'compact' : ''}`} onSubmit={submit} noValidate>
      <h3>{preset ? `Quote for ${preset}` : 'Get your free quote'}</h3>
      <p className="sub">Two minutes. No obligation. We reply fast.</p>

      <div className="quote-honeypot" aria-hidden="true">
        <label>Website<input tabIndex="-1" autoComplete="off" name="website" value={form.website} onChange={update}/></label>
      </div>

      <div className="row">
        <label className={errorFor('name') ? 'field-has-error' : ''}>
          Name
          <input required name="name" autoComplete="name" value={form.name} onChange={update} placeholder="Your name" aria-invalid={Boolean(errorFor('name'))}/>
          {errorFor('name') ? <small className="field-error">{errorFor('name')}</small> : null}
        </label>
        <label className={errorFor('phone') ? 'field-has-error' : ''}>
          Phone
          <input required type="tel" name="phone" autoComplete="tel" value={form.phone} onChange={update} placeholder="(___) ___-____" aria-invalid={Boolean(errorFor('phone'))}/>
          {errorFor('phone') ? <small className="field-error">{errorFor('phone')}</small> : null}
        </label>
      </div>

      <div className="row">
        <label className={errorFor('email') ? 'field-has-error' : ''}>
          Email
          <input type="email" name="email" autoComplete="email" value={form.email} onChange={update} placeholder="you@email.com" aria-invalid={Boolean(errorFor('email'))}/>
          {errorFor('email') ? <small className="field-error">{errorFor('email')}</small> : null}
        </label>
        <label>Service
          <select name="service" value={form.service} onChange={update}>
            <option value="">Select a service</option>
            {services.map(service => <option value={service.title} key={service.slug}>{service.title}</option>)}
          </select>
        </label>
      </div>

      <div className="row">
        <label>Moving from<input name="moveFrom" value={form.moveFrom} onChange={update} placeholder="City or postal code"/></label>
        <label>Moving to<input name="moveTo" value={form.moveTo} onChange={update} placeholder="City or postal code"/></label>
      </div>

      {!compact ? <>
        <div className="row">
          <label className={errorFor('preferredDate') ? 'field-has-error' : ''}>
            Preferred date
            <input type="date" name="preferredDate" value={form.preferredDate} onChange={update} aria-invalid={Boolean(errorFor('preferredDate'))}/>
            {errorFor('preferredDate') ? <small className="field-error">{errorFor('preferredDate')}</small> : null}
          </label>
          <label>Move size
            <select name="moveSize" value={form.moveSize} onChange={update}>
              <option value="">Select size</option>
              <option>Single item</option>
              <option>Studio / 1 bed</option>
              <option>2 bed</option>
              <option>3+ bed / house</option>
              <option>Commercial</option>
            </select>
          </label>
        </div>
        <label>Anything else?<textarea rows="3" name="message" value={form.message} onChange={update} placeholder="Stairs, elevator booking, heavy items…"/></label>
      </> : null}

      <button className="btn btn-accent" disabled={state.sending} type="submit">
        {state.sending ? 'Sending…' : 'Send My Quote Request →'}
      </button>
      {state.message ? <p className="fine quote-status" role="status" aria-live="polite">{state.message}</p> : null}
    </form>
  );
}
