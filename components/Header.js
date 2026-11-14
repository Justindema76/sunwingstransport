import Link from 'next/link';
import { ChevronDown, Phone, Snowflake } from 'lucide-react';
import MobileNav from './MobileNav';
import TopbarFlip from './TopbarFlip';
import { telHref } from '@/lib/phone';

function on(value, fallback=true){return value==null||value===''?fallback:String(value)!=='false'}
function px(value,fallback){const n=Number(value);return Number.isFinite(n)?n:fallback}

function SmartNavLink({ href = '#', children, className = '' }) {
  if (/^(https?:|tel:|mailto:)/i.test(String(href))) return <a className={className} href={href}>{children}</a>;
  return <Link className={className} href={href}>{children}</Link>;
}

// navLinks / homeHref / topbarLine / badge: used by the Hamilton & Niagara section, which has its own menu.
export default function Header({ settings, services = [], globalHeader = {}, promo = null, navLinks = null, homeHref = '/', topbarLine = '', badge = '' }) {
  const phone = settings?.phone || '647-526-5132';
  const logo = globalHeader.logo || settings?.logo_url || 'https://nowsajdmbpxvlvrhopjg.supabase.co/storage/v1/object/public/site-assets/sunwings/1791334339517-SUNWING-site-logo.png';
  const brand = settings?.site_name || globalHeader.brand || 'Sun Wings';
  const topbarEmphasis = settings?.topbar_emphasis || globalHeader.topbarEmphasis || 'Reliable • On-Time • Professional';
  const topbarText = topbarLine || settings?.topbar_text || globalHeader.topbarText || 'Moving & delivery from Toronto to Niagara';
  const showTopbar=on(globalHeader.topbarEnabled ?? settings?.topbar_enabled,true);
  const showCall=on(globalHeader.callButtonEnabled ?? settings?.call_button_enabled,true);
  const callText=globalHeader.callButtonText || settings?.call_button_text || 'Call Now';
  const vars={
    '--logo-desktop-width':`${px(globalHeader.logoDesktopWidth ?? settings?.logo_desktop_width,140)}px`,
    '--logo-mobile-width':`${px(globalHeader.logoMobileWidth ?? settings?.logo_mobile_width,170)}px`,
    '--logo-desktop-max-height':`${px(globalHeader.logoDesktopMaxHeight ?? settings?.logo_desktop_max_height,100)}px`,
    '--logo-mobile-max-height':`${px(globalHeader.logoMobileMaxHeight ?? settings?.logo_mobile_max_height,90)}px`,
    '--logo-x':`${px(globalHeader.logoOffsetX ?? settings?.logo_offset_x,0)}px`,
    '--logo-y':`${px(globalHeader.logoOffsetY ?? settings?.logo_offset_y,0)}px`,
    '--header-desktop-height':`${px(globalHeader.headerDesktopHeight ?? settings?.header_desktop_height,110)}px`,
    '--header-mobile-height':`${px(globalHeader.headerMobileHeight ?? settings?.header_mobile_height,105)}px`,
  };

  const navItems = Array.from({ length: 7 }, (_, index) => ({
    label: globalHeader[`nav${index + 1}Label`] || '',
    url: globalHeader[`nav${index + 1}Url`] || '',
  })).filter(item => item.label);
  const fallbackNav = [
    { label:'Services', url:'/services' },{ label:'Service Areas', url:'/locations' },
    { label:'Pricing', url:'/pricing' },{ label:'Moving Tips', url:'/blog' },{ label:'Contact', url:'/contact' },
  ];
  const links = navLinks || (navItems.length ? navItems : fallbackNav);

  return (
    <div className="header-system" style={vars}>
      {showTopbar ? <div className="topbar">{promo ? <TopbarFlip>
        <div className="container topbar-centered">
          <span className="topbar-msg"><b>{topbarEmphasis}</b>{topbarText ? <i className="topbar-more"> — {topbarText}</i> : null}</span>
        </div>
        <div className="container topbar-centered">
          <Link className="topbar-promo" href={promo.href}><Snowflake size={14}/> <b>{promo.label}</b>{promo.price ? <>&nbsp;{promo.price.replace(/^From/, 'from')}</> : null} · <u>See plans →</u></Link>
        </div>
      </TopbarFlip> : <div className="container topbar-centered">
        <span className="topbar-msg"><b>{topbarEmphasis}</b>{topbarText ? <i className="topbar-more"> — {topbarText}</i> : null}</span>
      </div>}</div> : null}
      <header className="site">
        <div className="container nav">
          <Link className="logo" href={homeHref} aria-label={brand}>
            {logo ? <img src={logo} alt={brand}/> : <strong>{brand}</strong>}
            {badge ? <span className="logo-badge">{badge}</span> : null}
          </Link>
          <nav className="nav-links" aria-label="Main navigation">
            {links.map(item => item.url === '/services' ? (
              <div className="nav-dropdown" key={item.url}>
                <Link className="nav-dropdown-trigger" href="/services">{item.label} <ChevronDown size={16} strokeWidth={2.2}/></Link>
                <div className="nav-dropdown-menu">
                  <Link className="nav-dropdown-all" href="/services">All Services</Link>
                  {services.map(service => <Link href={`/services/${service.slug}`} key={service.id || service.slug}>{service.title}</Link>)}
                  <Link href="/long-distance">Long Distance Moving</Link>
                </div>
              </div>
            ) : <SmartNavLink href={item.url || '#'} key={`${item.label}-${item.url}`}>{item.label}</SmartNavLink>)}
          </nav>
          <div className="nav-cta">{showCall ? <a className="btn btn-accent header-call" href={telHref(phone)}><Phone size={17}/>{callText}</a> : null}</div>
          <div className="mobile-header-actions">
            <MobileNav links={links} services={services} phone={phone} buttonText="" buttonUrl=""/>
          </div>
        </div>
      </header>
    </div>
  );
}
