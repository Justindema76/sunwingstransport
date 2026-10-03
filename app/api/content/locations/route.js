import { getLocations } from '@/lib/content';

export async function GET() {
  return Response.json({ locations: await getLocations() });
}
