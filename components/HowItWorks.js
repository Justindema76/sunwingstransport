const DEFAULT_STEPS = [
  { title: 'Tell us the job', text: 'Send pickup, drop-off, date and what’s moving. Takes about two minutes.' },
  { title: 'Get your price', text: 'We confirm the details and send a clear, upfront quote. No hidden fees.' },
  { title: 'We move it', text: 'The crew shows up on time, protects everything and places it where you want it.' },
];

export default function HowItWorks(props = {}) {
  const steps = DEFAULT_STEPS.map((fallback, i) => ({
    title: props[`step${i + 1}Title`] ?? fallback.title,
    text: props[`step${i + 1}Text`] ?? fallback.text,
  })).filter(step => step.title);

  return (
    <div className="steps">
      {steps.map((step, i) => <div className="step" key={i}><h3>{step.title}</h3><p>{step.text}</p></div>)}
    </div>
  );
}
