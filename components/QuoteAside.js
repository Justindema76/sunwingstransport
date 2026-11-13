import { Phone } from 'lucide-react';
import { telHref } from '@/lib/phone';

// Left side of a quote-form section: what happens after they send it, and a call option.
// Sticks in view on desktop while the (taller) form scrolls past.
export default function QuoteAside({ eyebrow, heading, text, replyHours, phone, children }) {
  const hours = String(replyHours || '').trim();
  const steps = [
    ['Send the basics', 'Takes about two minutes. Photos of the items or stairs help us price it right.'],
    ['Get your price', hours ? `We reply with an upfront quote within ${hours} hours.` : 'We reply with an upfront quote within 24 hours.'],
    ['Pick your date', 'Say yes and we book the crew and truck for the day that suits you.'],
  ];
  return <div className="quote-aside">
    {eyebrow ? <span className="kicker">{eyebrow}</span> : null}
    {heading ? <h2>{heading}</h2> : null}
    {text ? <p className="muted quote-aside-text">{text}</p> : null}
    <ol className="quote-steps">
      {steps.map(([title, body], index) => <li key={title}>
        <span className="quote-step-num">{index + 1}</span>
        <span><b>{title}</b><small>{body}</small></span>
      </li>)}
    </ol>
    {phone ? <a className="quote-call" href={telHref(phone)}>
      <span className="quote-call-icon"><Phone size={18}/></span>
      <span><small>Rather talk it through?</small><b>Call {phone}</b></span>
    </a> : null}
    {children}
  </div>;
}
