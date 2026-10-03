const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || '';

function clean(value, max = 1000) {
  return String(value || '').trim().slice(0, max);
}

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const payload = {
    site_key: 'sunwings',
    name: clean(body.name, 120),
    phone: clean(body.phone, 60),
    email: clean(body.email, 160),
    service: clean(body.service, 160),
    move_from: clean(body.moveFrom, 220),
    move_to: clean(body.moveTo, 220),
    message: clean(body.message, 3000),
  };

  if (!payload.name || !payload.phone) {
    return Response.json({ error: 'Name and phone are required.' }, { status: 400 });
  }

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return Response.json({ ok: true, demo: true });
  }

  const response = await fetch(`${SUPABASE_URL}/rest/v1/sunwings_quote_requests`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      'content-type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    console.error('[sunwings] quote insert failed', response.status, await response.text());
    return Response.json({ error: 'Unable to send quote request.' }, { status: 500 });
  }

  return Response.json({ ok: true });
}
