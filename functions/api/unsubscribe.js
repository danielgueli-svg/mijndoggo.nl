import { page } from '../../lib/backend.js';
export async function onRequestGet({ request, env }) {
  const t = new URL(request.url).searchParams.get('token') || '';
  if (!/^[0-9a-f]{48}$/.test(t) || !env.SUBS) return page('Link ongeldig', 'Deze link is niet geldig.', 400);
  const r = await env.SUBS.prepare("UPDATE signups SET unsubscribed_at = COALESCE(unsubscribed_at, datetime('now')) WHERE unsub_token = ?").bind(t).run();
  return r.meta.changes ? page('Afgemeld', 'Je bent afgemeld. Je krijgt geen mails meer.') : page('Link ongeldig', 'Deze link is niet geldig.', 404);
}
