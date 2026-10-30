import { page } from '../../lib/backend.js';
export async function onRequestGet({ request, env }) {
  const t = new URL(request.url).searchParams.get('token') || '';
  if (!/^[0-9a-f]{48}$/.test(t) || !env.SUBS) return page('Link ongeldig', 'Deze bevestigingslink is niet geldig.', 400);
  const r = await env.SUBS.prepare("UPDATE signups SET confirmed_at = COALESCE(confirmed_at, datetime('now')) WHERE token = ? AND unsubscribed_at IS NULL").bind(t).run();
  return r.meta.changes ? page('Bevestigd', 'Bedankt, je e-mailadres is bevestigd.') : page('Link ongeldig', 'Deze bevestigingslink is niet geldig.', 404);
}
