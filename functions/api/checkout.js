// Payments are OFF. No Mollie call happens here until PAYMENTS_ENABLED === 'true' AND the country is open.
import OPEN from '../../data/open.json';
export async function onRequest({ request, env }) {
  if (request.method !== 'POST') return Response.json({ ok: false, error: 'method' }, { status: 405 });
  if (env.PAYMENTS_ENABLED !== 'true') return Response.json({ ok: false, error: 'closed' }, { status: 403 });
  let b = {}; try { b = await request.json(); } catch {}
  const cs = [].concat(b.countries || []);
  if (!cs.length || !cs.every(c => OPEN[c] === true)) return Response.json({ ok: false, error: 'closed' }, { status: 403 });
  return Response.json({ ok: false, error: 'not_built' }, { status: 503 }); // Mollie test wiring not built yet
}
