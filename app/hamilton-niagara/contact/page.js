import { ContactContent } from '@/app/contact/page';
import { HN, hnMetadata } from '@/lib/hamiltonNiagara';

export function generateMetadata() {
  return hnMetadata('contact', `${HN}/contact`);
}

export default function HnContactPage() {
  return <ContactContent pageId="hn-contact" home={HN}/>;
}
