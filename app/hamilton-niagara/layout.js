import Header from '@/components/Header';
import { getGlobalBlockProps, getGlobalSection, getLocations, getServicesFor, getSiteSettings } from '@/lib/content';
import { HN, HN_NAV, getHnContent, hnRegions, hnRouteLinks, hnServiceLinks, hnThemeCss, hnTownHref, isHnTown } from '@/lib/hamiltonNiagara';
import './hn.css';

// Hamilton & Niagara section: its own header menu and a "Hamilton & Niagara" label by the logo.
// (The main site header is hidden here by SiteChrome in the root layout; the footer is shared.)
// Label, top bar line and colours: Admin › Hamilton & Niagara › Look & colours.
export default async function HamiltonNiagaraLayout({ children }) {
  const [settings, headerSection, content, services, locations] = await Promise.all([getSiteSettings(), getGlobalSection('header'), getHnContent(), getServicesFor('hn'), getLocations()]);
  const { theme } = content;
  const css = hnThemeCss(theme);
  // The logo goes to this section's home; the switch beside it flips between the two areas.
  // An optional back button can be added as the first menu item (Admin › Look & colours).
  const towns = locations.filter(isHnTown).sort((a, b) => String(a.title).localeCompare(String(b.title)))
    .map(town => ({ label: String(town.title || town.slug).replace(/^(Moving|Movers)( in| and Transport in)? /i, ''), url: hnTownHref(town) }));
  const fill = { services: hnServiceLinks(services), routes: hnRouteLinks(), towns };
  const nav = HN_NAV.map(({ fill: kind, ...item }) => (kind ? { ...item, children: fill[kind] } : item));
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
