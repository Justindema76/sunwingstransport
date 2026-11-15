import FacebookFeedPage from '@/components/FacebookFeedPage';
import { getSiteSettings } from '@/lib/content';

export const metadata = {
  title: 'Latest from Sunwings on Facebook',
  description: 'Recent jobs, open spots and news from Sunwings Transport, straight from our Facebook page.',
  alternates: { canonical: '/facebook' },
};

export default async function FacebookPage() {
  const settings = await getSiteSettings();
  return <FacebookFeedPage settings={settings}/>;
}
