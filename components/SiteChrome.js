'use client';
import { usePathname } from 'next/navigation';

// The main site header, footer and snow offer. Hidden inside the Hamilton & Niagara
// section, which has its own header and footer (so visitors stay in that section).
export const SECTION_PREFIX = '/hamilton-niagara';

export default function SiteChrome({ children }) {
  const path = usePathname() || '';
  if (path === SECTION_PREFIX || path.startsWith(`${SECTION_PREFIX}/`)) return null;
  return children;
}
