/**
 * WICKO • TEXT DIRECTIONS — Worker Backend (Twilio)
 * v1.0
 *
 * Reference Cloudflare Worker that receives POSTs from the
 * <wicko-text-directions> custom element and sends an SMS
 * via Twilio with a maps link.
 *
 * Required secrets (use `wrangler secret put`):
 *   TWILIO_ACCOUNT_SID
 *   TWILIO_AUTH_TOKEN
 *   TWILIO_FROM            (e.g. +18016907449)
 *
 * Optional environment vars (in wrangler.toml [vars]):
 *   ALLOWED_ORIGINS        comma-separated list, e.g.
 *                          "https://daviskids.org,https://hiresbigh.com"
 *   BRAND_SUFFIX           string appended to SMS body, default
 *                          " — sent via Wicko Waypoint"
 *
 * Deploy:
 *   wrangler deploy
 *
 * Then point the <wicko-text-directions worker="..."> attribute at
 * the worker URL.
 */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const allowed = parseOrigins(env.ALLOWED_ORIGINS);
    const origin = request.headers.get('Origin') || '';
    const corsOrigin = allowed.length === 0
      ? '*'
      : (allowed.includes(origin) ? origin : allowed[0]);

    const cors = {
      'Access-Control-Allow-Origin': corsOrigin,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Vary': 'Origin',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: cors });
    }

    if (request.method !== 'POST') {
      return json({ ok: false, error: 'Method not allowed' }, 405, cors);
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return json({ ok: false, error: 'Invalid JSON' }, 400, cors);
    }

    const phone = (body.phone || '').toString().trim();
    const address = (body.address || '').toString().trim();
    const mapsUrl = (body.maps_url || '').toString().trim();

    if (!/^\+1\d{10}$/.test(phone)) {
      return json({ ok: false, error: 'Invalid phone number' }, 400, cors);
    }
    if (!address) {
      return json({ ok: false, error: 'Missing address' }, 400, cors);
    }

    const link = mapsUrl || `https://www.google.com/maps/place/${encodeURIComponent(address)}`;
    const suffix = env.BRAND_SUFFIX || ' — sent via Wicko Waypoint';
    const smsBody = `Directions to ${address}: ${link}${suffix}`;

    // Send via Twilio
    const sid   = env.TWILIO_ACCOUNT_SID;
    const token = env.TWILIO_AUTH_TOKEN;
    const from  = env.TWILIO_FROM;

    if (!sid || !token || !from) {
      return json({ ok: false, error: 'Worker not configured' }, 500, cors);
    }

    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`;
    const auth = btoa(`${sid}:${token}`);
    const form = new URLSearchParams({ To: phone, From: from, Body: smsBody });

    try {
      const res = await fetch(twilioUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: form,
      });
      const data = await res.json();
      if (!res.ok) {
        return json({ ok: false, error: data.message || 'SMS send failed' }, 502, cors);
      }
      return json({ ok: true, sid: data.sid }, 200, cors);
    } catch (err) {
      return json({ ok: false, error: err.message || 'Network error' }, 502, cors);
    }
  },
};

function parseOrigins(s) {
  return (s || '').split(',').map(x => x.trim()).filter(Boolean);
}
function json(payload, status, extraHeaders = {}) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json', ...extraHeaders },
  });
}
