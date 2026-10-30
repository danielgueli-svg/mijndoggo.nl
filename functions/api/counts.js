// GET /api/counts -> { total, nl, countries: {NL: n,...}, by_breed: {"<breed slug>": n} }. READ-ONLY on shared D1 puppyalert-listings.
// Same counting as PuppyAlert (functions/api/counts.js @ fcd3d70): ACTIVE breeders (is_active=1 AND listing_status='active'),
// deduplicated per (country, breeder_key); breed strings mapped to page slugs via lib/breedmap.js. by_breed is Europe-wide.
// Numbers only: never returns listing rows, URLs or breeder names.
import { breedSlugs } from '../../lib/breedmap.js';
const H = { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'public, max-age=600' };
export function aggregate(rows) {
  const per = {}, bb = {};
  for (const r of rows) {
    const id = r.country + '|' + r.breeder_key;
    (per[r.country] ||= new Set()).add(id);
    for (const s of breedSlugs(r.breed).slugs) (bb[s] ||= new Set()).add(id);
  }
  const countries = Object.fromEntries(Object.keys(per).sort().map(c => [c, per[c].size]));
  return { total: Object.values(countries).reduce((a, n) => a + n, 0), nl: countries.NL || 0, countries, by_breed: Object.fromEntries(Object.entries(bb).map(([s, v]) => [s, v.size])) };
}
export async function onRequestGet({ env }) {
  if (!env.LISTINGS) return new Response(JSON.stringify({ total: null, error: 'no_db' }), { status: 503, headers: H });
  try {
    const { results } = await env.LISTINGS.prepare("SELECT DISTINCT country, breeder_key, breed FROM listings WHERE is_active = 1 AND listing_status = 'active'").all();
    return new Response(JSON.stringify(aggregate(results)), { headers: H });
  } catch { return new Response(JSON.stringify({ total: null, error: 'db' }), { status: 503, headers: H }); }
}
