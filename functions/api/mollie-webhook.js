// Mollie posts id=tr_.... We re-fetch that payment from the Mollie API. A receipt goes out
// only when that object says paid, and only once per payment id.
import { mollie, mollieKey, sendMail, receiptEmail } from '../../lib/backend.js';
export async function onRequestPost({ request, env }) {
  const id = (await request.formData().catch(() => null))?.get('id') || '';
  if (!/^tr_[A-Za-z0-9]+$/.test(id) || !mollieKey(env) || !env.SUBS) return new Response('ok');
  const r = await mollie(env, '/payments/' + id);
  if (!r.ok) return new Response('ok');
  const p = await r.json();
  const paidAt = p.status === 'paid' ? (p.paidAt || null) : null;
  await env.SUBS.prepare("UPDATE signups SET payment_status = ?, paid_at = CASE WHEN ? = 'paid' THEN COALESCE(paid_at, COALESCE(?, datetime('now'))) ELSE paid_at END WHERE payment_id = ?").bind(p.status, p.status, paidAt, id).run();
  if (p.status !== 'paid') return new Response('ok');
  const claim = await env.SUBS.prepare("UPDATE signups SET receipt_sent_at = datetime('now') WHERE payment_id = ? AND receipt_sent_at IS NULL").bind(id).run();
  if (!Number(claim.meta?.changes)) return new Response('ok');
  const row = await env.SUBS.prepare('SELECT email, unsub_token FROM signups WHERE payment_id = ?').bind(id).first();
  const base = new URL(request.url).origin;
  const mail = row?.email ? await sendMail(env, row.email, receiptEmail(base, row.unsub_token, p)) : 'failed';
  if (mail !== 'sent') await env.SUBS.prepare('UPDATE signups SET receipt_sent_at = NULL WHERE payment_id = ?').bind(id).run();
  return new Response('ok');
}
