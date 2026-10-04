import Link from 'next/link';
import { ChevronDown, Phone } from 'lucide-react';
import MobileNav from './MobileNav';

function telHref(phone = '') {
  const digits = String(phone).replace(/\D/g, '');
  return digits ? `tel:+${digits.startsWith('1') ? digits : `1${digits}`}` : '#';
}
function on(value, fallback=true){return value==null||value===''?fallback:String(value)!=='false'}
function px(value,fallback){const n=Number(value);return Number.isFinite(n)?n:fallback}

function SmartNavLink({ href = '#', children, className = '' }) {
  if (/^(https?:|tel:|mailto:)/i.test(String(href))) return <a className={className} href={href}>{children}</a>;
  return <Link className={className} href={href}>{children}</Link>;
}

export default function Header({ settings, services = [], globalHeader = {} }) {
  const phone = settings?.phone || '1-800-555-5555';
  const logo = settings?.logo_url || globalHeader.logo || 'https://sunwingstransport.ca/wp-content/uploads/2026/01/SUNWING-site-logo.png';
  const brand = settings?.site_name || globalHeader.brand || 'Sun Wings';
  const topbarEmphasis = settings?.topbar_emphasis || globalHeader.topbarEmphasis || 'Reliable • On-Time • Professional';
  const topbarText = settings?.topbar_text || globalHeader.topbarText || 'Moving & delivery from Toronto to Niagara';
  const showTopbar=on(settings?.topbar_enabled,true);
  const showCall=on(settings?.call_button_enabled,true);
  const callText=settings?.call_button_text || 'Call Now';
  const vars={
    '--logo-desktop-width':`${px(settings?.logo_desktop_width,140)}px`,
    '--logo-mobile-width':`${px(settings?.logo_mobile_width,170)}px`,
    '--logo-desktop-max-height':`${px(settings?.logo_desktop_max_height,100)}px`,
    '--logo-mobile-max-height':`${px(settings?.logo_mobile_max_height,90)}px`,
    '--logo-x':`${px(settings?.logo_offset_x,0)}px`,
    '--logo-y':`${px(settings?.logo_offset_y,0)}px`,
    '--header-desktop-height':`${px(settings?.header_desktop_height,110)}px`,
    '--header-mobile-height':`${px(settings?.header_mobile_height,105)}px`,
  };

  const navItems = Array.from({ length: 7 }, (_, index) => ({
    label: globalHeader[`nav${index + 1}Label`] || '',
    url: globalHeader[`nav${index + 1}Url`] || '',
  })).filter(item => item.label);
  const fallbackNav = [
    { label:'Services', url:'/services' },{ label:'Service Areas', url:'/locations' },
    { label:'Pricing', url:'/pricing' },{ label:'Moving Tips', url:'/blog' },{ label:'Contact', url:'/contact' },
  ];
  const links = navItems.length ? navItems : fallbackNav;

  return (
    <div className="header-system" style={vars}>
      {showTopbar ? <div className="topbar"><div className="container topbar-centered">
        <span><b>{topbarEmphasis}</b>{topbarText ? <> — {topbarText}</> : null}</span>
      </div></div> : null}
      <header className="site">
        <div className="container nav">
          <Link className="logo" href="/" aria-label={brand}>
            {logo ? <img src={logo} alt={brand}/> : <strong>{brand}</strong>}
          </Link>
          <nav className="nav-links" aria-label="Main navigation">
            {links.map(item => item.url === '/services' ? (
              <div className="nav-dropdown" key={item.url}>
                <Link className="nav-dropdown-trigger" href="/services">{item.label} <ChevronDown size={16} strokeWidth={2.2}/></Link>
                <div className="nav-dropdown-menu">
                  <Link className="nav-dropdown-all" href="/services">All Services</Link>
                  {services.map(service => <Link href={`/services/${service.slug}`} key={service.id || service.slug}>{service.title}</Link>)}
                </div>
              </div>
            ) : <SmartNavLink href={item.url || '#'} key={`${item.label}-${item.url}`}>{item.label}</SmartNavLink>)}
          </nav>
          <div className="nav-cta">{showCall ? <a className="btn btn-accent header-call" href={telHref(phone)}><Phone size={17}/>{callText}</a> : null}</div>
          <div className="mobile-header-actions">
            {showCall ? <a className="btn btn-accent mobile-call" href={telHref(phone)}><Phone size={16}/>{callText}</a> : null}
            <MobileNav links={links} services={services} phone={phone} buttonText="" buttonUrl=""/>
          </div>
        </div>
      </header>
    </div>
  );
}
