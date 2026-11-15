import Header from '@/components/Header';
import { getGlobalBlockProps, getGlobalSection, getServicesFor, getSiteSettings } from '@/lib/content';
import { HN, HN_NAV, getHnContent, hnRegions, hnServiceLinks, hnThemeCss } from '@/lib/hamiltonNiagara';
import './hn.css';

// Hamilton & Niagara section: its own header menu and a "Hamilton & Niagara" label by the logo.
// (The main site header is hidden here by SiteChrome in the root layout; the footer is shared.)
// Label, top bar line and colours: Admin › Hamilton & Niagara › Look & colours.
export default async function HamiltonNiagaraLayout({ children }) {
  const [settings, headerSection, content, services] = await Promise.all([getSiteSettings(), getGlobalSection('header'), getHnContent(), getServicesFor('hn')]);
  const { theme } = content;
  const css = hnThemeCss(theme);
  // The logo goes to this section's home; the switch beside it flips between the two areas.
  // An optional back button can be added as the first menu item (Admin › Look & colours).
  const nav = HN_NAV.map(item => (item.children ? { ...item, children: hnServiceLinks(services) } : item));
  const navLinks = theme.backLabel ? [{ label: theme.backLabel, url: '/' }, ...nav] : nav;
  const headerProps = getGlobalBlockProps(headerSection, 'HeaderBlock');
  return (
    <>
      {css ? <style dangerouslySetInnerHTML={{ __html: css }}/> : null}
      <Header settings={settings} services={[]} globalHeader={headerProps} navLinks={navLinks} homeHref={HN} badgeHref={HN} topbarLine={theme.topbarLine} badge={theme.badge} regions={hnRegions(theme, true)}/>
      {children}
    </>
  );
}
