import PartnersPage from '@/components/PartnersPage';

export const metadata = {
  title: { absolute: 'Furniture Delivery Partners in Hamilton & Niagara | Sunwings Transport' },
  description: 'Furniture stores and consignment shops in Hamilton, Burlington, Grimsby and the Niagara Region: free delivery partner program with written quotes for your customers.',
  alternates: { canonical: '/hamilton-niagara/partners' },
};

export default function Page() {
  return <PartnersPage area="hn"/>;
}
