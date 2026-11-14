import Link from 'next/link';
import QuoteDrawerTrigger from '@/components/QuoteDrawerTrigger';
import { telHref } from '@/lib/phone';
import { HN, HN_REGIONS, HN_SERVICES, hnTownHref } from '@/lib/hamiltonNiagara';

// Footer for the Hamilton & Niagara section: only links inside the section.
export default function HnFooter({ settings = {}, towns = [] }) {
  const phone = settings.phone || '647-526-5132';
  const logo = 'https://nowsajdmbpxvlvrhopjg.supabase.co/storage/v1/object/public/site-assets/sunwings/1791334339517-SUNWING-site-logo.png';
  return (
    <>
    <footer className="site-footer hn-footer">
      <div className="container hn-footer-grid">
        <div>
          <Link href={HN} className="hn-footer-logo"><img src={logo} alt="Sunwings Transport" width="170"/></Link>
          <p>Hamilton &amp; Niagara moving, furniture delivery and long-distance transport to Toronto and the GTA.</p>
          <p><a href={telHref(phone)}>Call {phone}</a></p>
        </div>
        <div>
          <h4>Services</h4>
          {HN_SERVICES.map(item => <Link key={item.slug} href={`${HN}/${item.slug}`}>{item.label}</Link>)}
          <Link href={`${HN}#routes`}>Popular routes</Link>
        </div>
        {HN_REGIONS.map(region => {
          const list = towns.filter(town => town.region === region.key);
          return list.length ? (
            <div key={region.key}>
              <h4>{region.title}</h4>
              {list.map(town => <Link key={town.slug} href={hnTownHref(town)}>{town.title}</Link>)}
            </div>
          ) : null;
        })}
      </div>
      <div className="container hn-footer-bottom">© {new Date().getFullYear()} Sunwings Transport · Hamilton &amp; Niagara</div>
    </footer>
    {/* Phone bottom bar, same as the main site. */}
    <div className="mbar">
      <a href={telHref(phone)}>Call Now</a>
      <QuoteDrawerTrigger className="mbar-quote" preset="Long Distance Moving">Request Quote</QuoteDrawerTrigger>
    </div>
    </>
  );
}
