// GET /api/counts -> { total, countries: {NL: n,...}, by_breed: {"<EN breed>": n} }. READ-ONLY on shared D1 puppyalert-listings.
// Numbers only: never returns listing rows, URLs or breeder names. Active = is_active=1. Dutch-only site: all counts filtered to country='NL'.
const H = { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'public, max-age=600' };
export async function onRequestGet({ env }) {
  if (!env.LISTINGS) return new Response(JSON.stringify({ total: null, error: 'no_db' }), { status: 503, headers: H });
  try {
    const c = await env.LISTINGS.prepare('SELECT country, COUNT(*) AS n FROM listings WHERE is_active = 1 AND country = ? GROUP BY country').bind('NL').all();
    const b = await env.LISTINGS.prepare('SELECT breed, COUNT(*) AS n FROM listings WHERE is_active = 1 AND country = ? GROUP BY breed').bind('NL').all();
    const countries = Object.fromEntries(c.results.map(r => [r.country, r.n]));
    return new Response(JSON.stringify({ total: c.results.reduce((a, r) => a + r.n, 0), countries, by_breed: Object.fromEntries(b.results.map(r => [r.breed, r.n])) }), { headers: H });
  } catch { return new Response(JSON.stringify({ total: null, error: 'db' }), { status: 503, headers: H }); }
}
