import { Armchair, Building2, House, PackageCheck, Trash2, Truck, UsersRound } from 'lucide-react';

const ICONS = {
  'residential-moving': House,
  'furniture-delivery': Armchair,
  'commercial-transport': Building2,
  'packing-protection': PackageCheck,
  'warehouse-container-unloading': Truck,
  'general-labour': UsersRound,
  'junk-removal': Trash2,
};

export default function ServiceIcon({ slug, size = 22 }) {
  const Icon = ICONS[slug] || Truck;
  return <Icon size={size} strokeWidth={2.2}/>;
}
