import FacebookFeedPage from '@/components/FacebookFeedPage';
import { getSiteSettings } from '@/lib/content';
import { HN, getHnContent, hnMetadata } from '@/lib/hamiltonNiagara';

export function generateMetadata() {
  return hnMetadata('facebook', `${HN}/facebook`);
}

export default async function HnFacebookPage() {
  const [settings, content] = await Promise.all([getSiteSettings(), getHnContent()]);
  return <FacebookFeedPage settings={settings} home={HN} placement="hamilton-niagara" fallbackImage={content.home.image}/>;
}
