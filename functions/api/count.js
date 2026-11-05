// GET /api/count?breed=<slug>&country=<code> -> { breed, country, count, tier }.
// Whole-country active listings only (region and radius are not columns on listings).
// tier: <5 blocked, <10 scarce, else clean. Numbers only, never listing rows.
import { breedKeys, listingCountry } from '../../lib/data.js';
const H = { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'public, max-age=600' };
const tier = n => n < 5 ? 'blocked' : n < 10 ? 'scarce' : 'clean';
export async function onRequestGet({ request, env }) {
  const u = new URL(request.url);
  const breed = u.searchParams.get('breed'), country = u.searchParams.get('country');
  if (!breed || !country) return new Response(JSON.stringify({ error: 'bad_request' }), { status: 400, headers: H });
  if (!env.LISTINGS) return new Response(JSON.stringify({ error: 'no_db' }), { status: 503, headers: H });
  const id = breedKeys(breed), cc = listingCountry(country);
  try {
    const row = await env.LISTINGS.prepare('SELECT COUNT(*) AS n FROM listings WHERE is_active = 1 AND country = ? AND breed IN (?, ?)').bind(cc, id.slug, id.en).first();
    const count = row?.n || 0;
    return new Response(JSON.stringify({ breed: id.slug, country: cc, count, tier: tier(count) }), { headers: H });
  } catch { return new Response(JSON.stringify({ error: 'db' }), { status: 503, headers: H }); }
}
