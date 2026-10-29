// IP-based default language, '/' only. 302, skipped when a 'lang' cookie exists or for bots.
const BOT = /bot|crawler|spider|googlebot/i;
export async function onRequest({ request, next }) {
  if (request.method !== "GET" && request.method !== "HEAD") return next();
  const ua = request.headers.get('user-agent') || '', cookie = request.headers.get('cookie') || '';
  const al = (request.headers.get('accept-language') || '').toLowerCase();
  const res = await next(); const out = new Response(res.body, res);
  out.headers.append('Vary', 'Accept-Language, Cookie');
  if (BOT.test(ua) || /(?:^|;\s*)lang=/.test(cookie)) return out;
  const cc = request.cf?.country, first = (al.match(/\b(nl|fr|de)\b/) || [])[1];
  let to = null;
  if (cc === 'NL') to = 'nl';
  else if (cc === 'BE') to = first === 'fr' ? 'fr' : 'nl';
  else if (cc === 'DE' || cc === 'AT') to = 'de';
  else if (cc === 'FR') to = 'fr';
  else if (cc === 'LU') to = first === 'de' ? 'de' : first === 'fr' ? 'fr' : null;
  if (!to) return out;
  return new Response(null, { status: 302, headers: { Location: `/${to}/`, Vary: 'Accept-Language, Cookie', 'Cache-Control': 'private, no-store' } });
}
