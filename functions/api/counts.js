// GET /api/counts -> numbers only, never listing rows, URLs or breeder names.
// No query: { total, nl, europe, countries, by_breed }. total, nl and countries.NL are active
// listings in the Netherlands. europe is active listings in the EU plus the UK (country GB).
// English by_breed keys stay NL-only. Slug keys are Europe-wide, which the signup breed list
// sorts on (most breeders first). ?breed=<slug> -> { breed, count }.
import { breedKeys, networkTotals } from '../../lib/data.js';
const H = { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'public, max-age=600' };
export async function onRequestGet({ request, env }) {
  if (!env.LISTINGS) return new Response(JSON.stringify({ total: null, error: 'no_db' }), { status: 503, headers: H });
  const breed = new URL(request.url).searchParams.get('breed');
  try {
    if (breed) {
      const id = breedKeys(breed);
      const row = await env.LISTINGS.prepare('SELECT COUNT(*) AS n FROM listings WHERE is_active = 1 AND breed IN (?, ?)').bind(id.slug, id.en).first();
      return new Response(JSON.stringify({ breed: id.slug, count: row?.n || 0 }), { headers: H });
    }
    const rows = await env.LISTINGS.prepare('SELECT breed, country, COUNT(*) AS n FROM listings WHERE is_active = 1 GROUP BY breed, country').all();
    const byBreed = {}, nlEn = {};
    const { nl, europe } = networkTotals(rows.results);
    for (const r of rows.results) {
      const id = breedKeys(r.breed);
      byBreed[id.slug] = (byBreed[id.slug] || 0) + r.n;
      if (r.country === 'NL') nlEn[id.en] = (nlEn[id.en] || 0) + r.n;
    }
    // total stays the Netherlands figure. europe is active listings in the EU plus the UK (GB).
    return new Response(JSON.stringify({ total: nl, nl, europe, countries: { NL: nl }, by_breed: { ...nlEn, ...byBreed } }), { headers: H });
  } catch { return new Response(JSON.stringify({ total: null, error: 'db' }), { status: 503, headers: H }); }
}
