'use client';

import { useState } from 'react';

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
};

export default function QuoteForm({ services = [], compact = false, preset = '' }) {
  const [form, setForm] = useState({ ...initialState, service: preset });
  const [state, setState] = useState({ sending: false, message: '' });

  function update(event) {
    setForm(current => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function submit(event) {
    event.preventDefault();
    setState({ sending: true, message: '' });

    const details = [
      form.preferredDate ? `Preferred date: ${form.preferredDate}` : '',
      form.moveSize ? `Move size: ${form.moveSize}` : '',
      form.message,
    ].filter(Boolean).join('\n');

    try {
      const response = await fetch('/api/quote', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ...form, message: details }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Unable to send request.');
      setForm({ ...initialState, service: preset });
      setState({ sending: false, message: 'Thanks. Your quote request has been sent.' });
    } catch (error) {
      setState({ sending: false, message: error.message });
    }
  }

  return (
    <form className={`form-card ${compact ? 'compact' : ''}`} onSubmit={submit}>
      <h3>{preset ? `Quote for ${preset}` : 'Get your free quote'}</h3>
      <p className="sub">Two minutes. No obligation. We reply fast.</p>

      <div className="row">
        <label>Name<input required name="name" value={form.name} onChange={update} placeholder="Your name"/></label>
        <label>Phone<input required name="phone" value={form.phone} onChange={update} placeholder="(___) ___-____"/></label>
      </div>

      <div className="row">
        <label>Email<input type="email" name="email" value={form.email} onChange={update} placeholder="you@email.com"/></label>
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
          <label>Preferred date<input type="date" name="preferredDate" value={form.preferredDate} onChange={update}/></label>
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
      {state.message ? <p className="fine" role="status">{state.message}</p> : null}
    </form>
  );
}
