// Maps PuppyCrawler breed strings (puppyalert-listings.listings.breed, ';'-separated, mixed EN/DE/FR) to our breed page slugs.
// Slug = slugify(English name in data/breed_pages.json). Unknown names map to null (reported as unmapped, not counted per breed).
import pages from '../data/breed_pages.json' with { type: 'json' };
export const slugify = t => t.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const key = t => slugify(t.replace(/\([^)]*\)/g, ''));
const SLUGS = new Set(pages.map(b => slugify(b[0])));
// Canonical slug -> aliases in EN/NL/DE/FR/IT/ES/PL (data/breed_aliases.json) plus every page name in data/breed_pages.json.
// All language variants merge into ONE slug. Slugs without a page are known but not counted per breed (stay in unmapped).
// Generic names (data/breed_aliases_ambiguous.json) are deliberately absent so they are never guessed.
import aliases from '../data/breed_aliases.json' with { type: 'json' };
export const ALIAS = {};
const put = (k, s) => { if (ALIAS[k] && ALIAS[k] !== s) throw new Error(`alias ${k} -> ${ALIAS[k]} and ${s}`); ALIAS[k] = s; };
for (const b of pages) for (const n of b) put(key(n), slugify(b[0]));
for (const [s, list] of Object.entries(aliases)) for (const n of list) put(key(n), s);
for (const [k, s] of Object.entries({ 'cavalier-king-charles': 'cavalier-king-charles-spaniel', 'australian-labradoodle': 'labradoodle', 'welsh-corgi-pembroke': 'pembroke-welsh-corgi',
  'franzosische-bulldogge': 'french-bulldog', 'englische-bulldogge': 'english-bulldog', 'bulldog': 'english-bulldog', 'deutscher-schaferhund': 'german-shepherd',
  'teckel-a-poil-dur': 'dachshund', 'dachshund-kurzhaar': 'dachshund', 'dachshund-rauhaar': 'dachshund', 'american-cocker-spaniel': 'cocker-spaniel' })) put(k, s); // legacy entries kept as-is

export function breedSlugs(raw) { // -> { slugs: Set, unmapped: string[] }
  const slugs = new Set(), unmapped = [];
  for (const part of String(raw || '').split(';').map(s => s.trim().replace(/,$/, '')).filter(Boolean)) {
    const k = key(part), s = ALIAS[k] || (SLUGS.has(k) ? k : null);
    if (s && SLUGS.has(s)) slugs.add(s); else unmapped.push(part);
  }
  return { slugs, unmapped };
}
