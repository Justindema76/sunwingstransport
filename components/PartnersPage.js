import PageHero from './PageHero';
import PartnerSignupForm from './PartnerSignupForm';
import { HERO_IMAGE_OPTIONS } from '@/lib/contentDefaults';
import { getSiteSettings } from '@/lib/content';
import { telHref } from '@/lib/phone';

// "You sell the furniture. We handle the delivery." Page for furniture stores, consignment shops
// and retailers. Used on the main site (/partners) and in Hamilton & Niagara (/hamilton-niagara/partners).
const STEPS = [
  { title: 'Sign up in a minute', text: 'Tell us about your store. No account to set up, no fees and no contract.' },
  { title: 'Get your QR card', text: 'We send your store its own link and a printed QR card for the counter, receipts or delivery desk.' },
  { title: 'Customers get a quote', text: 'Your customer scans, sends the item and addresses, and gets a written quote from us before anything is booked.' },
];

const PERKS = [
  { title: 'One reliable delivery contact', text: 'Point customers to one number and one link instead of searching for a mover.' },
  { title: 'Written quotes, upfront', text: 'Customers see the price in writing before they book, so there are no surprises at your counter.' },
  { title: 'Pickup coordinated with you', text: 'We arrange pickup times with your store and the delivery time with your customer.' },
  { title: 'Single items to full rooms', text: 'One sofa, a dining set or a full room of furniture, in a cargo van or a truck.' },
];

export default async function PartnersPage({ area = 'main' }) {
  const settings = await getSiteSettings();
  const hn = area === 'hn';
  const places = hn ? 'Hamilton, Niagara and the GTA' : 'Toronto, the GTA, Hamilton and Niagara';
  return (
    <>
      <PageHero
        placement={hn ? 'hamilton-niagara-partners' : 'partners'}
        crumbs={hn ? [{ label: 'Hamilton & Niagara', href: '/hamilton-niagara' }, { label: 'Store partners' }] : [{ label: 'Home', href: '/' }, { label: 'Store partners' }]}
        eyebrow="For furniture stores & retailers"
        title="You sell the furniture."
        accent="We handle the delivery."
        description={`Give your customers an easy way to get their furniture home. We pick up from your store and deliver across ${places}.`}
        image={HERO_IMAGE_OPTIONS.delivery}
        imageAlt="Sunwings crew delivering furniture"
        phone={settings.phone}
        ctas={false}
      />

      <section className="section">
        <div className="container">
          <div className="section-head">
            <span className="kicker">How it works</span>
            <h2>Three steps, then we take it from there.</h2>
          </div>
          <div className="grid-3">
            {STEPS.map((step, index) => (
              <div className="side-card" key={step.title}>
                <span className="kicker">Step {index + 1}</span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-soft" id="sign-up">
        <div className="container with-side contact-layout">
          <PartnerSignupForm area={hn ? 'Hamilton & Niagara' : ''}/>
          <aside className="side">
            {PERKS.map(perk => (
              <div className="side-card" key={perk.title}>
                <h3>{perk.title}</h3>
                <p className="muted">{perk.text}</p>
              </div>
            ))}
            <div className="side-card">
              <h3>Rather talk first?</h3>
              <a className="btn btn-accent" style={{ width: '100%' }} href={telHref(settings.phone)}>Call {settings.phone}</a>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
