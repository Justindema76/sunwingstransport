import Link from 'next/link';

function telHref(phone = '') {
  const digits = String(phone).replace(/\D/g, '');
  return digits ? `tel:+${digits.startsWith('1') ? digits : `1${digits}`}` : '#';
}

function SmartLink({ href = '#', children }) {
  if (!children) return null;
  if (/^(https?:|tel:|mailto:)/i.test(String(href))) return <a href={href}>{children}</a>;
  return <Link href={href}>{children}</Link>;
}

const SOCIAL_NETWORKS = [
  { key:'facebook', label:'Facebook', icon:'https://www.justconsignin.com/images/brand/social-media-icons/facebook-logo.png' },
  { key:'instagram', label:'Instagram', icon:'https://www.justconsignin.com/images/brand/social-media-icons/instagram-logo.png' },
  { key:'linkedin', label:'LinkedIn', icon:'https://www.justconsignin.com/images/brand/social-media-icons/linkedin-logo.jpeg' },
  { key:'youtube', label:'YouTube', icon:'https://www.justconsignin.com/images/brand/social-media-icons/youtube-logo.png' },
  { key:'tiktok', label:'TikTok', icon:'https://www.justconsignin.com/images/brand/social-media-icons/ticktok-logo.png' },
];

export default function Footer({ settings, globalFooter = {}, socialLinks = {} }) {
  const phone = settings?.phone || '1-800-555-5555';
  const logo = globalFooter.logo || 'https://sunwingstransport.ca/wp-content/uploads/2026/01/SUNWING-site-logo.png';
  const brand = globalFooter.brand || 'Sunwings Transport';
  const tagline = globalFooter.tagline || 'Reliable • On-Time • Professional. Moving, delivery and commercial transport from Toronto to Niagara.';
  const ctaTitle = globalFooter.ctaTitle || 'Ready when you are.';
  const ctaPrimaryText = globalFooter.ctaPrimaryText || 'Get a Free Quote';
  const ctaPrimaryUrl = globalFooter.ctaPrimaryUrl || '/contact';
  const ctaSecondaryText = globalFooter.ctaSecondaryText || 'Call';
  const column1Title = globalFooter.column1Title || 'Services';
  const column2Title = globalFooter.column2Title || 'Service Areas';

  const column1 = [1,2,3,4].map(n => ({
    label: globalFooter[`link${n}Label`] || '',
    url: globalFooter[`link${n}Url`] || '',
  })).filter(item => item.label);

  const column2 = [5,6,7,8].map(n => ({
    label: globalFooter[`link${n}Label`] || '',
    url: globalFooter[`link${n}Url`] || '',
  })).filter(item => item.label);

  const fallback1 = [
    {label:'Residential Moving',url:'/services/residential-moving'},
    {label:'Furniture Delivery',url:'/services/furniture-delivery'},
    {label:'Commercial Transport',url:'/services/commercial-transport'},
    {label:'All Services',url:'/services'},
  ];
  const fallback2 = [
    {label:'Toronto',url:'/locations/toronto'},
    {label:'Hamilton',url:'/locations/hamilton'},
    {label:'Niagara Falls',url:'/locations/niagara-falls'},
    {label:'All Areas',url:'/locations'},
  ];

  const links1 = column1.length ? column1 : fallback1;
  const links2 = column2.length ? column2 : fallback2;
  const activeSocial = SOCIAL_NETWORKS.filter(network => {
    const value = socialLinks?.[network.key];
    return value?.url && value?.enabled !== false;
  });

  return (
    <>
      <section className="cta-band">
        <div className="container">
          <h2>{ctaTitle}</h2>
          <div className="cta-actions">
            {ctaPrimaryText ? <SmartLink href={ctaPrimaryUrl}><span className="btn btn-navy">{ctaPrimaryText}</span></SmartLink> : null}
            {ctaSecondaryText ? <a className="btn btn-line" href={telHref(phone)}>{ctaSecondaryText} {phone}</a> : null}
          </div>
        </div>
      </section>

      <footer>
        <div className="container">
          <div className="foot">
            <div>
              {logo ? <img className="foot-logo" src={logo} alt={brand}/> : <h3>{brand}</h3>}
              <p>{tagline}</p>
            </div>

            <div>
              <h4>{column1Title}</h4>
              {links1.map(item => <SmartLink href={item.url} key={`${item.label}-${item.url}`}>{item.label}</SmartLink>)}
            </div>

            <div>
              <h4>{column2Title}</h4>
              {links2.map(item => <SmartLink href={item.url} key={`${item.label}-${item.url}`}>{item.label}</SmartLink>)}
            </div>

            <div>
              <h4>{globalFooter.socialTitle || 'Company'}</h4>
              {globalFooter.socialText ? <p>{globalFooter.socialText}</p> : null}
              {activeSocial.length ? <div className="footer-social-icons">
                {activeSocial.map(network => (
                  <a
                    className="footer-social-icon"
                    href={socialLinks[network.key].url}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={network.label}
                    title={network.label}
                    key={network.key}
                  >
                    <img src={network.icon} alt=""/>
                  </a>
                ))}
              </div> : null}
              <Link href="/pricing">Pricing</Link>
              <Link href="/blog">Moving Tips</Link>
              <Link href="/contact">Contact</Link>
              <a href={telHref(phone)}>{phone}</a>
            </div>
          </div>

          <div className="foot-bottom">
            <span>© {new Date().getFullYear()} {globalFooter.copyright || 'Sunwings Transport. All rights reserved.'}</span>
            <span>
              {globalFooter.privacyLabel !== '' ? <SmartLink href={globalFooter.privacyUrl || '/privacy'}>{globalFooter.privacyLabel || 'Privacy'}</SmartLink> : null}
              {globalFooter.termsLabel ? <SmartLink href={globalFooter.termsUrl || '/terms'}>{globalFooter.termsLabel}</SmartLink> : null}
            </span>
          </div>
        </div>
      </footer>

      <div className="mbar">
        <a href={telHref(phone)}>Call</a>
        <Link href="/contact">Free Quote</Link>
      </div>
    </>
  );
}
