import { getSiteSettings } from '@/lib/content';

export async function GET() {
  return Response.json({ settings: await getSiteSettings() });
}
