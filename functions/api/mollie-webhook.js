// Mollie webhook (TEST). Mollie posts id=tr_...; we re-fetch the payment from Mollie and store its status.
import { mollie, mollieKey } from '../../lib/backend.js';
export async function onRequestPost({ request, env }) {
  const id = (await request.formData().catch(() => null))?.get('id') || '';
  if (!/^tr_[A-Za-z0-9]+$/.test(id) || !mollieKey(env) || !env.SUBS) return new Response('ok');
  const r = await mollie(env, '/payments/' + id); if (!r.ok) return new Response('ok');
  const p = await r.json();
  await env.SUBS.prepare("UPDATE signups SET payment_status = ?, paid_at = CASE WHEN ? = 'paid' THEN COALESCE(paid_at, datetime('now')) ELSE paid_at END WHERE payment_id = ?").bind(p.status, p.status, id).run();
  return new Response('ok');
}
