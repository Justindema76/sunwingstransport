import { CheckCircle2, FileText, Handshake, Send } from 'lucide-react';
import QuoteDrawerTrigger from './QuoteDrawerTrigger';

const STEPS = [
  { icon: FileText, title: 'Get a written quote', text: 'Get a written quote from another moving or delivery company for your job.' },
  { icon: Send, title: 'Send it to us', text: 'Attach it or mention it when you request your Sunwings quote, before you book.' },
  { icon: Handshake, title: 'We match the price', text: 'If it’s for the same job, we match it. Same crew, same care, lower price.' },
];

const RULES = [
  'The quote must be in writing (email, PDF or on the company’s letterhead).',
  'It must be for the same job: same date, addresses, crew size, truck size and services.',
  'It must come from a real, licensed and insured local company.',
  'Send it to us before your job is booked.',
];

// Pricing page section explaining the price-match guarantee in detail.
export default function PriceMatch() {
  return (
    <section className="section section-soft price-match" id="price-match">
      <div className="container">
        <div className="section-head">
          <span className="kicker">Price-match guarantee</span>
          <h2>We match any lower written quote.</h2>
          <p>Found a lower price somewhere else? Don’t book with them yet. Show us their written quote for the same job and we’ll match it.</p>
        </div>

        <div className="grid-3 price-match-steps">
          {STEPS.map(({ icon: Icon, title, text }, index) => (
            <div className="price-match-step" key={title}>
              <div className="price-match-num">{index + 1}</div>
              <Icon size={26}/>
              <h3>{title}</h3>
              <p>{text}</p>
            </div>
          ))}
        </div>

        <div className="price-match-rules">
          <div>
            <h3>What counts</h3>
            <ul>{RULES.map(rule => <li key={rule}><CheckCircle2 size={18}/> {rule}</li>)}</ul>
          </div>
          <QuoteDrawerTrigger className="btn btn-accent">Get my quote and price match →</QuoteDrawerTrigger>
        </div>
      </div>
    </section>
  );
}
