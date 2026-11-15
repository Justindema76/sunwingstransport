import PartnersPage from '@/components/PartnersPage';
import { hnMetadata } from '@/lib/hamiltonNiagara';

export function generateMetadata() {
  return hnMetadata('partners', '/hamilton-niagara/partners');
}

export default function Page() {
  return <PartnersPage area="hn"/>;
}
