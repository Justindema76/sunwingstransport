import Link from 'next/link';
import { ChevronDown, Phone } from 'lucide-react';
import MobileNav from './MobileNav';

function telHref(phone = '') {
  const digits = String(phone).replace(/\D/g, '');
  return digits ? `tel:+${digits.startsWith('1') ? digits : `1${digits}`}` : '#';
}

function SmartNavLink({ href = '#', children, className = '' }) {
  if (/^(https?:|tel:|mailto:)/i.test(String(href))) return <a className={className} href={href}>{children}</a>;
  return <Link className={className} href={href}>{children}</Link>;
}

export default function Header({ settings, services = [], globalHeader = {} }) {
  const phone = settings?.phone || '647-526-5132';
  const logo = globalHeader.logo || 'https://sunwingstransport.ca/wp-content/uploads/2026/01/SUNWING-site-logo.png';
  const brand = globalHeader.brand || 'Sunwings Transport';
  const buttonText = globalHeader.buttonText || 'Free Quote';
  const buttonUrl = globalHeader.buttonUrl || '/contact';

  const navItems = Array.from({ length: 7 }, (_, index) => ({
    label: globalHeader[`nav${index + 1}Label`] || '',
    url: globalHeader[`nav${index + 1}Url`] || '',
  })).filter(item => item.label);

  const fallbackNav = [
    { label:'Services', url:'/services' },
    { label:'Service Areas', url:'/locations' },
    { label:'Pricing', url:'/pricing' },
    { label:'Moving Tips', url:'/blog' },
    { label:'Contact', url:'/contact' },
  ];

  const links = navItems.length ? navItems : fallbackNav;

  return (
    <>
      <div className="topbar">
        <div className="container">
          <span><b>Reliable • On-Time • Professional</b> — Moving &amp; delivery from Toronto to Niagara</span>
          <a href={telHref(phone)}><Phone size={15}/> {phone}</a>
        </div>
      </div>

      <header className="site">
        <div className="container nav">
          <Link className="logo" href="/" aria-label={brand}>
            {logo ? <img src={logo} alt={brand}/> : <strong>{brand}</strong>}
          </Link>

          <nav className="nav-links" aria-label="Main navigation">
            {links.map(item => item.url === '/services' ? (
              <div className="nav-dropdown" key={item.url}>
                <Link className="nav-dropdown-trigger" href="/services">
                  {item.label} <ChevronDown size={16} strokeWidth={2.2}/>
                </Link>
                <div className="nav-dropdown-menu">
                  <Link className="nav-dropdown-all" href="/services">All Services</Link>
                  {services.map(service => (
                    <Link href={`/services/${service.slug}`} key={service.id || service.slug}>
                      {service.title}
                    </Link>
                  ))}
                </div>
              </div>
            ) : <SmartNavLink href={item.url || '#'} key={`${item.label}-${item.url}`}>{item.label}</SmartNavLink>)}
          </nav>

          <div className="nav-cta">
            <a className="nav-phone" href={telHref(phone)}>{phone}</a>
            {buttonText ? <SmartNavLink className="btn btn-accent" href={buttonUrl}>{buttonText}</SmartNavLink> : null}
          </div>

          <MobileNav links={links} services={services} phone={phone} buttonText={buttonText} buttonUrl={buttonUrl}/>
        </div>
      </header>
    </>
  );
}
