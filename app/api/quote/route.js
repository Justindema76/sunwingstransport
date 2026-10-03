const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || '';

function clean(value, max = 1000) {
  return String(value || '').trim().slice(0, max);
}

function clientIp(request) {
  const forwarded = clean(request.headers.get('x-forwarded-for'), 300);
  if (forwarded) return forwarded.split(',')[0].trim();
  return clean(request.headers.get('x-real-ip'), 120);
}

function validate(body) {
  const fieldErrors = {};
  const name = clean(body.name, 120);
  const phone = clean(body.phone, 60);
  const email = clean(body.email, 160);
  const digits = phone.replace(/\D/g, '');

  if (!name) fieldErrors.name = 'Enter your name.';
  if (digits.length < 10) fieldErrors.phone = 'Enter a phone number with at least 10 digits.';
  if (!email) fieldErrors.email = 'Enter your email address.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) fieldErrors.email = 'Enter a valid email address.';
  if (!clean(body.service, 160)) fieldErrors.service = 'Choose a service.';
  if (!body.preferredDate) fieldErrors.preferredDate = 'Choose a date.';
  else if (!/^\d{4}-\d{2}-\d{2}$/.test(String(body.preferredDate))) fieldErrors.preferredDate = 'Choose a valid date.';
  if (!clean(body.pickupAddress, 220)) fieldErrors.pickupAddress = 'Enter the pickup address.';
  if (!clean(body.pickupPostalCode, 24)) fieldErrors.pickupPostalCode = 'Enter the pickup postal code.';
  if (!clean(body.dropoffAddress, 220)) fieldErrors.dropoffAddress = 'Enter the drop-off address.';
  if (!clean(body.dropoffPostalCode, 24)) fieldErrors.dropoffPostalCode = 'Enter the drop-off postal code.';

  return fieldErrors;
}

function rpcErrorMessage(message = '') {
  const text = String(message || '');
  if (text.includes('rate_limited')) return { status:429, error:'Too many requests were sent from this connection. Please wait a few minutes and try again.' };
  if (text.includes('phone_invalid')) return { status:400, error:'Enter a phone number with at least 10 digits.', fieldErrors:{ phone:'Enter a phone number with at least 10 digits.' } };
  if (text.includes('email_required')) return { status:400, error:'Enter your email address.', fieldErrors:{ email:'Enter your email address.' } };
  if (text.includes('email_invalid')) return { status:400, error:'Enter a valid email address.', fieldErrors:{ email:'Enter a valid email address.' } };
  if (text.includes('name_required')) return { status:400, error:'Enter your name.', fieldErrors:{ name:'Enter your name.' } };
  if (text.includes('service_required')) return { status:400, error:'Choose a service.', fieldErrors:{ service:'Choose a service.' } };
  if (text.includes('date_required')) return { status:400, error:'Choose a date.', fieldErrors:{ preferredDate:'Choose a date.' } };
  if (text.includes('date_invalid')) return { status:400, error:'Choose a valid date.', fieldErrors:{ preferredDate:'Choose a valid date.' } };
  if (text.includes('pickup_address_required')) return { status:400, error:'Enter the pickup address.', fieldErrors:{ pickupAddress:'Enter the pickup address.' } };
  if (text.includes('pickup_postal_required')) return { status:400, error:'Enter the pickup postal code.', fieldErrors:{ pickupPostalCode:'Enter the pickup postal code.' } };
  if (text.includes('dropoff_address_required')) return { status:400, error:'Enter the drop-off address.', fieldErrors:{ dropoffAddress:'Enter the drop-off address.' } };
  if (text.includes('dropoff_postal_required')) return { status:400, error:'Enter the drop-off postal code.', fieldErrors:{ dropoffPostalCode:'Enter the drop-off postal code.' } };
  return { status:500, error:'Unable to send quote request.' };
}

export async function POST(request) {
  const body = await request.json().catch(() => ({}));

  if (clean(body.website, 200)) {
    return Response.json({ ok: true });
  }

  const fieldErrors = validate(body);
  if (Object.keys(fieldErrors).length) {
    return Response.json({ error:'Please correct the highlighted fields.', fieldErrors }, { status:400 });
  }

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error('[sunwings] quote submission unavailable: Supabase environment variables are missing');
    return Response.json({ error:'Quote requests are temporarily unavailable. Please call Sunwings instead.' }, { status:500 });
  }

  const payload = {
    name: clean(body.name, 120),
    phone: clean(body.phone, 60),
    email: clean(body.email, 160),
    service: clean(body.service, 160),
    moveFrom: clean(body.moveFrom, 220),
    moveTo: clean(body.moveTo, 220),
    preferredDate: clean(body.preferredDate, 20),
    preferredTime: clean(body.preferredTime, 80),
    moveSize: clean(body.moveSize, 120),
    pickupAddress: clean(body.pickupAddress, 220),
    pickupCity: clean(body.pickupCity, 120),
    pickupPostalCode: clean(body.pickupPostalCode, 24),
    pickupElevator: clean(body.pickupElevator, 10),
    pickupStairs: clean(body.pickupStairs, 10),
    dropoffAddress: clean(body.dropoffAddress, 220),
    dropoffCity: clean(body.dropoffCity, 120),
    dropoffPostalCode: clean(body.dropoffPostalCode, 24),
    dropoffElevator: clean(body.dropoffElevator, 10),
    dropoffStairs: clean(body.dropoffStairs, 10),
    itemList: clean(body.itemList, 6000),
    message: clean(body.message, 3000),
  };

  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/sunwings_submit_quote`, {
    method:'POST',
    headers:{
      apikey:SUPABASE_ANON_KEY,
      Authorization:`Bearer ${SUPABASE_ANON_KEY}`,
      'content-type':'application/json',
    },
    body:JSON.stringify({ p:payload, p_ip:clientIp(request) }),
    cache:'no-store',
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    console.error('[sunwings] quote submit failed', response.status, data);
    const mapped = rpcErrorMessage(data?.message || data?.error || '');
    return Response.json({ error:mapped.error, fieldErrors:mapped.fieldErrors || {} }, { status:mapped.status });
  }

  const saved = Array.isArray(data) ? data[0] : data;
  if (!saved?.id || !saved?.notification_token) {
    console.error('[sunwings] quote submit returned no id/token');
    return Response.json({ error:'Unable to send quote request.' }, { status:500 });
  }

  try {
    const mailResponse = await fetch(`${SUPABASE_URL}/functions/v1/send-site-email`, {
      method:'POST',
      headers:{
        apikey:SUPABASE_ANON_KEY,
        Authorization:`Bearer ${SUPABASE_ANON_KEY}`,
        'content-type':'application/json',
      },
      body:JSON.stringify({
        action:'quote_request',
        requestId:saved.id,
        notificationToken:saved.notification_token,
      }),
      cache:'no-store',
    });
    if (!mailResponse.ok) {
      console.error('[sunwings] quote notification failed', mailResponse.status, await mailResponse.text());
    }
  } catch (error) {
    console.error('[sunwings] quote notification error', error);
  }

  return Response.json({ ok:true });
}
