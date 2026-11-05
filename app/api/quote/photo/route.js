// Saves one quote photo to the private "sunwings-quote-photos" bucket.
// The browser shrinks each photo to a JPEG first, so one request stays small.
// The quote itself (POST /api/quote) then lists the saved paths; the database only
// keeps paths that really exist in the bucket.

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || '';
const BUCKET = 'sunwings-quote-photos';
const MAX_BYTES = 3 * 1024 * 1024;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(request) {
  const url = new URL(request.url);
  const upload = String(url.searchParams.get('upload') || '').toLowerCase();
  const index = Number(url.searchParams.get('n'));
  if (!UUID.test(upload) || !Number.isInteger(index) || index < 0 || index > 5) {
    return Response.json({ error: 'Invalid photo upload.' }, { status: 400 });
  }
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return Response.json({ error: 'Photo upload is not available right now.' }, { status: 500 });
  }

  const bytes = new Uint8Array(await request.arrayBuffer());
  const isJpeg = bytes.length > 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (!isJpeg) return Response.json({ error: 'That photo could not be read. Try a different photo.' }, { status: 400 });
  if (bytes.length > MAX_BYTES) return Response.json({ error: 'That photo is too large.' }, { status: 413 });

  const path = `${upload}/${index}.jpg`;
  const response = await fetch(`${SUPABASE_URL}/storage/v1/object/${BUCKET}/${path}`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      'content-type': 'image/jpeg',
      'x-upsert': 'false',
    },
    body: bytes,
    cache: 'no-store',
  });
  if (!response.ok) {
    console.error('[sunwings] quote photo upload failed', response.status, await response.text().catch(() => ''));
    return Response.json({ error: 'The photo did not upload. Please try again.' }, { status: 502 });
  }
  return Response.json({ path });
}
