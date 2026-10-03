'use client';

import { useState } from 'react';

const initialState = {
  name: '',
  phone: '',
  email: '',
  service: '',
  moveFrom: '',
  moveTo: '',
  message: '',
};

export default function QuoteForm({ services = [] }) {
  const [form, setForm] = useState(initialState);
  const [state, setState] = useState({ sending: false, message: '' });

  function update(event) {
    setForm(current => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function submit(event) {
    event.preventDefault();
    setState({ sending: true, message: '' });

    try {
      const response = await fetch('/api/quote', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(form),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Unable to send request.');
      setForm(initialState);
      setState({
        sending: false,
        message: result.demo
          ? 'Local demo mode: form works, but Supabase is not connected yet.'
          : 'Thanks. Your quote request has been sent.',
      });
    } catch (error) {
      setState({ sending: false, message: error.message });
    }
  }

  return (
    <form className="quote-form" onSubmit={submit}>
      <div className="form-row">
        <label>Name<input required name="name" value={form.name} onChange={update} /></label>
        <label>Phone<input required name="phone" value={form.phone} onChange={update} /></label>
      </div>
      <div className="form-row">
        <label>Email<input type="email" name="email" value={form.email} onChange={update} /></label>
        <label>Service
          <select name="service" value={form.service} onChange={update}>
            <option value="">Select a service</option>
            {services.map(service => <option value={service.title} key={service.slug}>{service.title}</option>)}
          </select>
        </label>
      </div>
      <div className="form-row">
        <label>From<input name="moveFrom" value={form.moveFrom} onChange={update} /></label>
        <label>To<input name="moveTo" value={form.moveTo} onChange={update} /></label>
      </div>
      <label>Job details<textarea rows="5" name="message" value={form.message} onChange={update} /></label>
      <button className="button button-primary" disabled={state.sending} type="submit">
        {state.sending ? 'Sending…' : 'Request a Quote'}
      </button>
      {state.message ? <p className="form-message" role="status">{state.message}</p> : null}
    </form>
  );
}
