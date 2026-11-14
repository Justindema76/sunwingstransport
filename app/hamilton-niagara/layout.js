import Header from '@/components/Header';
import HnFooter from '@/components/hn/HnFooter';
import { getGlobalBlockProps, getGlobalSection, getLocations, getSiteSettings } from '@/lib/content';
import { HN, HN_NAV, isHnTown } from '@/lib/hamiltonNiagara';
import './hn.css';

// Hamilton & Niagara section: its own header menu and footer, so visitors stay in it.
// (The main site header/footer are hidden here by SiteChrome in the root layout.)
export default async function HamiltonNiagaraLayout({ children }) {
  const [settings, headerSection, locations] = await Promise.all([getSiteSettings(), getGlobalSection('header'), getLocations()]);
  const headerProps = getGlobalBlockProps(headerSection, 'HeaderBlock');
  return (
    <>
      <Header settings={settings} services={[]} globalHeader={headerProps} navLinks={HN_NAV} homeHref={HN} topbarLine="Hamilton & Niagara moving and transport"/>
      {children}
      <HnFooter settings={settings} towns={locations.filter(isHnTown)}/>
    </>
  );
}
