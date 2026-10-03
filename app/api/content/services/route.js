import { getServices } from '@/lib/content';

export async function GET() {
  return Response.json({ services: await getServices() });
}
