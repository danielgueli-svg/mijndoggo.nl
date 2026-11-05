// POST /api/signup. Validates breeds (max 3), stacked countries (max 3) and an optional
// province/region plus radius (150/300/500 km). Stores a pending signup, sends the double
// opt-in mail to the signer only, then creates a Mollie TEST payment and returns its checkout URL.
import { json, token, confirmEmail, sendMail, mollie, mollieKey, PRICES } from '../../lib/backend.js';
import { BREEDS, RADII, listingCountry } from '../../lib/data.js';
import REGIONS from '../../data/regions.json' with { type: 'json' };
export async function onRequestPost({ request, env }) {
  if (env.SIGNUPS_OPEN !== 'true') return json({ ok: false, error: 'closed' }, 403);
  let b; try { b = await request.json(); } catch { return json({ ok: false, error: 'bad_json' }, 400); }
  const email = String(b.email || '').trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 200) return json({ ok: false, error: 'email' }, 400);
  if (email !== String(b.email2 || '').trim().toLowerCase()) return json({ ok: false, error: 'email_mismatch' }, 400);
  if (b.consent !== true) return json({ ok: false, error: 'consent' }, 400);
  const breeds = [...new Set([].concat(b.breeds || []).map(x => String(x)))];
  if (!breeds.length || breeds.length > 3 || !breeds.every(x => BREEDS.has(x))) return json({ ok: false, error: 'breeds' }, 400);
  if (!PRICES[b.plan]) return json({ ok: false, error: 'plan' }, 400);
  const countries = [...new Set([].concat(b.countries || []).map(c => String(c || '').trim()).filter(Boolean))];
  if (!countries.length || countries.length > 3 || countries.some(c => !REGIONS[c])) return json({ ok: false, error: 'countries' }, 400);
  let near = { countries };
  if (b.near != null) {
    const radius = +b.near.radius, regions = [].concat(b.near.regions || []);
    if (b.near.unit !== 'km' || !RADII.includes(radius) || !regions.length || regions.length > 3) return json({ ok: false, error: 'near' }, 400);
    const clean = [];
    for (const r of regions) {
      const pack = REGIONS[r.country];
      const hit = pack && pack.regions.find(x => x.id === r.id);
      if (!hit || !countries.includes(r.country)) return json({ ok: false, error: 'near' }, 400);
      if (!clean.some(x => x.country === r.country && x.id === hit.id)) clean.push({ country: r.country, id: hit.id, name: hit.name });
    }
    if (!clean.length) return json({ ok: false, error: 'near' }, 400);
    near = { place: clean.map(r => r.name).join('; '), radius, unit: 'km', regions: clean, countries };
  }
  if (!env.SUBS) return json({ ok: false, error: 'not_stored' }, 503);
  if (!mollieKey(env)) return json({ ok: false, error: 'payments_not_configured' }, 503);
  const tok = token(), unsub = token(), country = listingCountry(countries[0]);
  await env.SUBS.prepare(`INSERT INTO signups (email, breeds, country, near, plan, token, unsub_token) VALUES (?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT (email) DO UPDATE SET breeds = excluded.breeds, country = excluded.country, near = excluded.near, plan = excluded.plan, token = excluded.token, confirmed_at = NULL, unsubscribed_at = NULL, payment_id = NULL, payment_status = NULL, paid_at = NULL`)
    .bind(email, JSON.stringify(breeds), country, JSON.stringify(near), b.plan, tok, unsub).run();
  const row = await env.SUBS.prepare('SELECT unsub_token FROM signups WHERE email = ?').bind(email).first();
  const base = new URL(request.url).origin;
  const mail = await sendMail(env, email, confirmEmail(base, tok, row.unsub_token));
  const [value, label] = PRICES[b.plan];
  const r = await mollie(env, '/payments', { method: 'POST', body: JSON.stringify({ amount: { currency: 'EUR', value }, description: `MijnDoggo puppy-alert ${label}`,
    redirectUrl: `${base}/api/betaald?token=${tok}`, webhookUrl: `${base}/api/mollie-webhook`, locale: 'nl_NL', metadata: { token: tok } }) }).catch(() => null);
  const pay = r && r.ok ? await r.json() : null;
  await env.SUBS.prepare('UPDATE signups SET mail_status = ?, payment_id = ?, payment_status = ? WHERE email = ?').bind(mail, pay?.id || null, pay?.status || 'create_failed', email).run();
  if (!pay) return json({ ok: false, stored: true, mail, error: 'payment_create_failed' }, 502);
  return json({ ok: true, stored: true, mail, checkoutUrl: pay._links.checkout.href, test: true });
}
