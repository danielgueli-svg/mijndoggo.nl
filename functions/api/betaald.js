// Return page after Mollie checkout. Re-checks the payment at Mollie (webhook may not have arrived yet).
import { page, mollie, mollieKey } from '../../lib/backend.js';
export async function onRequestGet({ request, env }) {
  const t = new URL(request.url).searchParams.get('token') || '';
  if (!/^[0-9a-f]{48}$/.test(t) || !env.SUBS) return page('Link ongeldig', 'Deze link is niet geldig.', 400);
  const row = await env.SUBS.prepare('SELECT payment_id, confirmed_at FROM signups WHERE token = ?').bind(t).first();
  if (!row || !row.payment_id || !mollieKey(env)) return page('Link ongeldig', 'Deze link is niet geldig.', 404);
  const r = await mollie(env, '/payments/' + row.payment_id), p = r.ok ? await r.json() : { status: 'unknown' };
  await env.SUBS.prepare("UPDATE signups SET payment_status = ?, paid_at = CASE WHEN ? = 'paid' THEN COALESCE(paid_at, datetime('now')) ELSE paid_at END WHERE token = ?").bind(p.status, p.status, t).run();
  const conf = row.confirmed_at ? '' : ' Bevestig nog even je e-mailadres via de link in je mail.';
  return p.status === 'paid' ? page('Betaling gelukt', 'Bedankt! Je puppy-alert staat klaar (testbetaling, er is niets echt afgeschreven).' + conf)
    : page('Betaling niet afgerond', `Status: ${p.status}. Je kunt het opnieuw proberen via de raspagina.`);
}
