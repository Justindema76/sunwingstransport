import Header from '@/components/Header';
import { getGlobalBlockProps, getGlobalSection, getSiteSettings } from '@/lib/content';
import { HN, HN_NAV } from '@/lib/hamiltonNiagara';
import './hn.css';

// Hamilton & Niagara section: its own header menu and a "Hamilton & Niagara" label by the logo.
// (The main site header is hidden here by SiteChrome in the root layout; the footer is shared.)
export default async function HamiltonNiagaraLayout({ children }) {
  const [settings, headerSection] = await Promise.all([getSiteSettings(), getGlobalSection('header')]);
  const headerProps = getGlobalBlockProps(headerSection, 'HeaderBlock');
  return (
    <>
      <Header settings={settings} services={[]} globalHeader={headerProps} navLinks={HN_NAV} homeHref={HN} topbarLine="Hamilton & Niagara moving and transport" badge="Hamilton & Niagara"/>
      {children}
    </>
  );
}
