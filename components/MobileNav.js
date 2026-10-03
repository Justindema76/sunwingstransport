'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ChevronDown, Menu, Phone, X } from 'lucide-react';

function telHref(phone = '') {
  const digits = String(phone).replace(/\D/g, '');
  return digits ? `tel:+${digits.startsWith('1') ? digits : `1${digits}`}` : '#';
}

function SmartLink({ href = '#', children, onClick, className = '' }) {
  if (/^(https?:|tel:|mailto:)/i.test(String(href))) {
    return <a className={className} href={href} onClick={onClick}>{children}</a>;
  }
  return <Link className={className} href={href} onClick={onClick}>{children}</Link>;
}

export default function MobileNav({ links = [], services = [], phone = '', buttonText = 'Free Quote', buttonUrl = '/contact' }) {
  const [open, setOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    function outside(event) {
      if (open && wrapRef.current && !wrapRef.current.contains(event.target)) setOpen(false);
    }
    function keydown(event) {
      if (event.key === 'Escape') setOpen(false);
    }
    document.addEventListener('pointerdown', outside);
    document.addEventListener('keydown', keydown);
    return () => {
      document.removeEventListener('pointerdown', outside);
      document.removeEventListener('keydown', keydown);
    };
  }, [open]);

  const close = () => {
    setOpen(false);
    setServicesOpen(false);
  };

  return (
    <div className="mobile-nav-wrap" ref={wrapRef}>
      <button
        className="mobile-menu-button"
        type="button"
        aria-label={open ? 'Close navigation' : 'Open navigation'}
        aria-expanded={open}
        aria-controls="mobile-site-nav"
        onClick={() => setOpen(value => !value)}
      >
        {open ? <X size={24}/> : <Menu size={24}/>}
      </button>

      <div className={`mobile-nav-panel ${open ? 'open' : ''}`} id="mobile-site-nav">
        <nav aria-label="Mobile navigation">
          {links.map(item => item.url === '/services' ? (
            <div className="mobile-nav-services" key={item.url}>
              <div className="mobile-nav-service-row">
                <Link href="/services" onClick={close}>{item.label}</Link>
                <button
                  type="button"
                  aria-label="Toggle services"
                  aria-expanded={servicesOpen}
                  onClick={() => setServicesOpen(value => !value)}
                >
                  <ChevronDown size={18} className={servicesOpen ? 'open' : ''}/>
                </button>
              </div>
              {servicesOpen ? <div className="mobile-nav-submenu">
                {services.map(service => (
                  <Link href={`/services/${service.slug}`} onClick={close} key={service.id || service.slug}>{service.title}</Link>
                ))}
              </div> : null}
            </div>
          ) : (
            <SmartLink href={item.url || '#'} onClick={close} key={`${item.label}-${item.url}`}>{item.label}</SmartLink>
          ))}
        </nav>

        <div className="mobile-nav-actions">
          <a className="mobile-nav-phone" href={telHref(phone)} onClick={close}><Phone size={17}/> {phone}</a>
          {buttonText ? <SmartLink className="btn btn-accent" href={buttonUrl} onClick={close}>{buttonText}</SmartLink> : null}
        </div>
      </div>
    </div>
  );
}
