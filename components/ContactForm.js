'use client';

import { useState } from 'react';

const initialState = {
  name: '',
  phone: '',
  service: '',
  message: '',
  website: '',
};

export default function ContactForm({ services = [] }) {
  const [form, setForm] = useState(initialState);
  const [state, setState] = useState({ sending:false, message:'', fieldErrors:{} });

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
    setState({ sending:true, message:'', fieldErrors:{} });

    try {
      const response = await fetch('/api/quote', {
        method:'POST',
        headers:{ 'content-type':'application/json' },
        body:JSON.stringify({
          ...form,
          contactRequest:true,
          quickRequest:true,
          service:form.service || 'General Contact',
        }),
      });
      const result = await response.json();

      if (!response.ok) {
        setState({
          sending:false,
          message:result.error || 'Unable to send your message.',
          fieldErrors:result.fieldErrors || {},
        });
        return;
      }

      setForm(initialState);
      setState({
        sending:false,
        fieldErrors:{},
        message:'Thanks. Your message has been sent. We’ll get back to you as soon as possible.',
      });
    } catch (error) {
      setState({
        sending:false,
        fieldErrors:{},
        message:error?.message || 'Unable to send your message.',
      });
    }
  }

  const errorFor = name => state.fieldErrors?.[name] || '';

  return (
    <form className="form-card contact-form" onSubmit={submit} noValidate>
      <h2>Contact Sunwings</h2>
      <p className="sub">Send us a message and we’ll get back to you.</p>

      <div className="quote-honeypot" aria-hidden="true">
        <label>Website<input tabIndex="-1" autoComplete="off" name="website" value={form.website} onChange={update}/></label>
      </div>

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

      <label>
        Service
        <select name="service" value={form.service} onChange={update}>
          <option value="">General question</option>
          {services.map(service => <option value={service.title} key={service.slug}>{service.title}</option>)}
        </select>
      </label>

      <label className={errorFor('message') ? 'field-has-error' : ''}>
        Message *
        <textarea
          required
          rows="7"
          name="message"
          value={form.message}
          onChange={update}
          placeholder="How can we help?"
          aria-invalid={Boolean(errorFor('message'))}
        />
        {errorFor('message') ? <small className="field-error">{errorFor('message')}</small> : null}
      </label>

      <button className="btn btn-accent" type="submit" disabled={state.sending}>
        {state.sending ? 'Sending…' : 'Send Message →'}
      </button>

      {state.message ? <p className="fine quote-status" role="status" aria-live="polite">{state.message}</p> : null}
    </form>
  );
}
