import Header from '@/components/Header';
import { getGlobalBlockProps, getGlobalSection, getSiteSettings } from '@/lib/content';
import { HN, HN_NAV, getHnContent, hnThemeCss } from '@/lib/hamiltonNiagara';
import './hn.css';

// Hamilton & Niagara section: its own header menu and a "Hamilton & Niagara" label by the logo.
// (The main site header is hidden here by SiteChrome in the root layout; the footer is shared.)
// Label, top bar line and colours: Admin › Hamilton & Niagara › Look & colours.
export default async function HamiltonNiagaraLayout({ children }) {
  const [settings, headerSection, content] = await Promise.all([getSiteSettings(), getGlobalSection('header'), getHnContent()]);
  const { theme } = content;
  const css = hnThemeCss(theme);
  // The logo goes back to the main site; the first menu item says so. The label opens the section's home.
  const navLinks = theme.backLabel ? [{ label: theme.backLabel, url: '/' }, ...HN_NAV] : HN_NAV;
  const headerProps = getGlobalBlockProps(headerSection, 'HeaderBlock');
  return (
    <>
      {css ? <style dangerouslySetInnerHTML={{ __html: css }}/> : null}
      <Header settings={settings} services={[]} globalHeader={headerProps} navLinks={navLinks} homeHref="/" badgeHref={HN} topbarLine={theme.topbarLine} badge={theme.badge}/>
      {children}
    </>
  );
}
