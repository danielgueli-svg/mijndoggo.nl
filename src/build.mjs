import OPEN from '../data/open.json' with { type: 'json' };
import { readFileSync, writeFileSync, mkdirSync, rmSync, cpSync } from 'node:fs';
const J = p => JSON.parse(readFileSync(new URL('../' + p, import.meta.url)));
const i18n = J('data/i18n.json'), breeds = J('data/breeds.json'), countries = J('data/countries.json'), places = J('data/places.json');
const SITE = 'https://mijndoggo.nl', OUT = new URL('../dist/', import.meta.url).pathname;
const LANGS = ['nl']; // en = default (no prefix), others under /<lang>/
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const GJH = '<a href="https://gypsyjazzhub.com">Gypsy Jazz Hub</a>';
const COUNTER = (attr) => `<p class="pup-counter" ${attr} hidden><strong class="pc-n"></strong> <span class="pc-l"></span></p>`;
const enName = new Intl.DisplayNames(['en'], { type: 'region' });
const cname = (row, l) => row[2]?.[l] || new Intl.DisplayNames([l], { type: 'region' }).of(row[0]);
const slugify = t => t.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const slugOf = (row, l = 'en') => slugify(cname(row, l));
const isoAlias = row => ({ 'GB-ENG': 'eng', 'GB-SCT': 'sct', 'GB-WLS': 'wls', 'GB-NIR': 'nir' })[row[0]] || row[0].toLowerCase();
// URL pattern: home = / (en), /nl/, /de/, /fr/; country = /<lang>/<country name in that language, ascii slug>/ e.g. /en/netherlands/, /nl/nederland/
const pre = l => '';
const homePath = l => `${pre(l)}/`, countryPath = (l, row) => `/landen/${slugOf(row, l)}/`;
rmSync(OUT, { recursive: true, force: true }); mkdirSync(OUT, { recursive: true });
cpSync(new URL('../public/', import.meta.url).pathname, OUT, { recursive: true });
const alt = () => '';
// Plain-text language dropdown (top right), keeps you on the same page; sets the lang cookie.
const langMenu = (l, pathFor) => `<label class="lang"><span class="lang-label">${esc(i18n[l].chooseLang)}</span><select aria-label="${esc(i18n[l].chooseLang)}" onchange="document.cookie='lang='+this.selectedOptions[0].lang+';path=/;max-age=31536000;samesite=lax';location.href=this.value">${LANGS.map(x => `<option value="${pathFor(x)}" lang="${x}"${x === l ? ' selected' : ''}>${i18n[x].name}</option>`).join('')}</select></label>`;
const head = (l, title, desc, pathFor) => `<!doctype html><html lang="${l}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title><meta name="description" content="${esc(desc)}"><link rel="canonical" href="${SITE}${pathFor(l)}">${alt(pathFor)}
<link rel="icon" href="/favicon.png"><link rel="apple-touch-icon" href="/apple-touch-icon.png"><link rel="stylesheet" href="/style.css">
<meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(desc)}"><meta property="og:url" content="${SITE}${pathFor(l)}"><meta property="og:image" content="${SITE}/logo-doghead.png"></head>
<body><header class="site-header"><div class="wrap head-row"><a class="brand" href="${homePath(l)}"><img src="/logo-doghead.png" alt="" width="40" height="40"><span class="wordmark">MijnDoggo</span></a></div></header>`;
const story = T => `<h2>${esc(T.h_story)}</h2><p>${esc(T.story).replace('{GJH}', GJH)}</p>`;
// Homepage breed ticker: popular breeds (curated order), localized names, each links to its breed page.
const POP = ['Labrador Retriever','Golden Retriever','French Bulldog','Cockapoo','Dachshund','German Shepherd','Cocker Spaniel','Cavapoo','Border Collie','Poodle','Cavalier King Charles Spaniel','Jack Russell Terrier','Labradoodle','Boxer','Siberian Husky','Rottweiler','Shih Tzu','Pomeranian','Chihuahua','Bichon Frise','Maltese','Pug','Staffordshire Bull Terrier','Yorkshire Terrier','Whippet','Dobermann'];
const breedTicker = (T, l) => { const BPx = J('data/breed_pages.json'), i = 1; const items = POP.map(n => BPx.find(b => b[0] === n)).map(b => `<li><a href="${pre(l)}/${T.bSeg}/${slugify(b[i])}/">${esc(b[i])}</a></li>`).join('');
  return `<section class="section countries"><div class="wrap"><h2>${esc(T.bPop)}</h2><div class="ticker"><ul class="ticker-track">${items}</ul><ul class="ticker-track" aria-hidden="true">${items.replaceAll('<a ', '<a tabindex="-1" ')}</ul></div></div></section>`; };
const sections = (T, l, cs, home = false) => `<section class="section trust"><div class="wrap ${home ? 'one' : 'two'}">${home ? '' : `<div>${story(T)}</div>`}<div><h2>${esc(T.h_cheap)}</h2><p>${esc(T.cheap)}</p></div></div></section>
<section class="section preview"><div class="wrap"><h2>${esc(T.h_prev)}</h2><p class="example-tag">${esc(T.prev_note)}</p>
<div class="mail" aria-label="${esc(T.prev_note)}"><div class="mail-head"><p>${esc(T.m_from)}</p><p><strong>${esc(T.m_subj)}</strong></p></div><div class="mail-body"><img src="/logo-doghead.png" alt="" width="36" height="36"><p>${esc(T.m_body)}</p><span class="mail-btn">${esc(T.m_btn)}</span><p class="mail-foot"><u>${esc(T.m_unsub)}</u></p></div></div></div></section>
${home ? breedTicker(T, l) : `<section class="section countries"><div class="wrap"><h2>${esc(T.h_ctry)}</h2><p>${esc(T.ctry_note)}</p><ul class="ctry-grid">${cs.map(c => `<li><a href="${countryPath(l, c.row)}">${c.flag} ${esc(c.name)}</a><span class="badge-soon">${esc(T.soon)}</span></li>`).join('')}</ul></div></section>`}</main>
<footer class="site-footer"><div class="wrap foot-row"><a class="brand" href="${homePath(l)}"><img src="/logo-doghead.png" alt="" width="32" height="32"><span class="wordmark">MijnDoggo</span></a><p>${esc(T.f_unsub)}</p></div><div class="wrap"><p class="small">© MijnDoggo.nl</p></div></footer>`;
const opts = (name, items, pre = []) => items.map(([v, label]) => `<label class="chip"><input type="checkbox" name="${name}" value="${esc(v)}"${pre.includes(v) ? ' checked' : ''}><span>${label}</span></label>`).join('');
const PROV = J('data/provinces.json');
const signup = (T, cur) => { const BPs = [...J('data/breed_pages.json')].sort((a, b) => a[1].localeCompare(b[1], 'nl'));
  return `<div class="card"><h2 class="card-title">${esc(T.card)}</h2><form id="signup" data-lang="nl" data-maxb="${esc(T.maxB)}" data-ok="${esc(T.ok)}" data-err="${esc(T.err)}" data-nearbad="${esc(T.nearBad)}" data-mis="${esc(T.mis)}" data-need="${esc(T.need)}">
<input type="hidden" name="country" value="NL">
<fieldset data-max="3" data-msg="maxB"><legend class="step">${esc(T.st1)}</legend><details class="picker"><summary><span>${esc(T.pickB)} (<b class="n">1</b>/3)</span></summary><div class="chips">${opts('breed', BPs.map(b => [b[0], esc(b[1])]), [cur[0]])}</div></details><p class="limit" hidden></p></fieldset>
<fieldset><legend class="step">Stap 2 · Waar in Nederland? (optioneel)</legend><div class="near-body"><p class="note">Land: Nederland. Laat de provincie leeg voor alerts uit heel Nederland.</p>
<label>Provincie<select name="province"><option value="">Heel Nederland</option>${Object.keys(PROV).sort((a, b) => a.localeCompare(b, 'nl')).map(p => `<option value="${esc(p)}" data-reach='${esc(JSON.stringify(PROV[p]))}'>${esc(p)}</option>`).join('')}</select></label>
<label>Zoekradius<select name="radius">${[25, 50, 100, 150].map(k => `<option value="${k}"${k === 50 ? ' selected' : ''}>${k} km</option>`).join('')}</select></label>
<label class="consent"><input type="checkbox" name="crossBorder"> Ook resultaten over de grens (België en Duitsland)</label><p class="note xbnote" hidden></p></div></fieldset>
<fieldset><legend class="step">${esc(T.st3)}</legend><div class="plans"><label class="plan"><input type="radio" name="plan" value="12m" checked><span>${esc(T.p12)}</span></label></div><p class="note"><strong>${esc(T.once)}</strong> Je betaalt via Mollie (iDEAL of kaart). Testomgeving: er wordt niets echt afgeschreven.</p></fieldset>
<fieldset><legend class="step">${esc(T.st4)}</legend><label>${esc(T.email)}<input type="email" name="email" required autocomplete="email"></label><label>${esc(T.email2)}<input type="email" name="email2" required autocomplete="email"></label><p class="limit mis" hidden>${esc(T.mis)}</p>
<label class="consent"><input type="checkbox" name="consent" required> ${esc(T.consent)}</label>
<button type="submit">Aanmelden en betalen</button><p class="status" role="status"></p></fieldset>
<ul class="card-notes"><li>${esc(T.optin)}</li><li>${esc(T.noauto)}</li></ul></form></div>`; };
const write = (p, html) => { mkdirSync(OUT + p, { recursive: true }); writeFileSync(OUT + p + 'index.html', html); };
const sm = [];
for (const l of LANGS) {
  const T = i18n[l];
  const cs = countries.map(row => ({ row, cc: row[0], flag: row[1], name: cname(row, l) })).sort((a, b) => a.name.localeCompare(b.name, l));
  // Homepage: language selector + country selector, no signup form.
  write(homePath(l), head(l, T.title, T.desc, homePath) + `<main id="content"><section class="hero"><div class="wrap split"><div class="hero-copy">
<h1>${esc(T.heroH)}</h1><p class="hero-line">${esc(T.heroSub)}</p>${COUNTER('data-scope="all"')}<div class="hero-story">${story(T)}</div>
</div><div class="card"><h2 class="card-title">${esc(T.bStep)}</h2>
<label class="step"><select class="go" aria-label="${esc(T.bStep)}"><option value="">${esc(T.bChoose)}</option>${[...J('data/breed_pages.json')].map(b => [b[1], `${pre(l)}/${T.bSeg}/${slugify(b[1])}/`]).sort((a, b) => a[0].localeCompare(b[0], l)).map(([n, u]) => `<option value="${u}">${esc(n)}</option>`).join('')}</select></label>
<ul class="card-notes"><li>${esc(T.homeNote)}</li><li>${esc(T.once)}</li><li>${esc(T.noauto)}</li></ul></div></div></section>
${sections(T, l, cs, true)}<script src="/home.js" defer></script></body></html>`);
  if (l === 'nl') sm.push(homePath);
}
// Breed landing pages: /breeds/<slug>/ (en), /nl/rassen/<slug>/, /de/rassen/, /fr/races/, /it/razze/. No listings, counts or prices.
const BP = J('data/breed_pages.json'), LI = Object.fromEntries([['nl', 1]]);
const bName = (b, l) => b[LI[l]];
const BIMG = J('data/breed_images.json'), BBL = J('data/breed_blurbs.json');
const SHOWALL = { en: 'Show all breeds', nl: 'Toon alle rassen', de: 'Alle Rassen anzeigen', fr: 'Voir toutes les races', it: 'Mostra tutte le razze' };
const PHOTO = { en: 'Photo', nl: 'Foto', de: 'Foto', fr: 'Photo', it: 'Foto' }, ALT = { en: '{b} dog', nl: '{b}, hond', de: '{b}, Hund', fr: 'Chien {b}', it: 'Cane {b}' };
const credit = (m, l) => /^(public domain|pd|cc0)/i.test(m.license) ? `<a href="${esc(m.source)}" rel="nofollow noopener">${PHOTO[l]}</a>: ${esc(m.author)} (${esc(m.license)})` : `<a href="${esc(m.source)}" rel="nofollow noopener">${PHOTO[l]}</a>: ${esc(m.author)}, ${m.license_url ? `<a href="${esc(m.license_url)}" rel="license nofollow noopener">${esc(m.license)}</a>` : esc(m.license)}`;
const bFig = (b, l) => { const m = BIMG[b[0]]; if (!m) return ''; return `<figure class="breed-photo"><img src="${m.file_small}" srcset="${m.file_small} 320w, ${m.file} 640w" sizes="(max-width: 599px) 180px, 320px" width="${m.width}" height="${m.height}" loading="lazy" decoding="async" alt="${esc(ALT[l].replace('{b}', bName(b, l)))}"><figcaption>${credit(m, l)}</figcaption></figure>`; };
const bThumb = (b, l) => { const m = BIMG[b[0]]; return m ? `<img class="bthumb" src="${m.file_small}" width="48" height="36" loading="lazy" decoding="async" alt="">` : ''; };
const breedIdx = l => `${pre(l)}/${i18n[l].bSeg}/`, breedPath = (l, b) => `${breedIdx(l)}${slugify(bName(b, l))}/`;
const bSlugs = new Set(); for (const l of LANGS) for (const b of BP) { const p = breedPath(l, b); if (bSlugs.has(p)) throw new Error('dup breed path ' + p); bSlugs.add(p); }
for (const l of LANGS) {
  const T = i18n[l];
  const cs = countries.map(row => ({ row, name: cname(row, l), flag: row[1] })).sort((a, b) => a.name.localeCompare(b.name, l));
  const sorted = [...BP].sort((a, b) => bName(a, l).localeCompare(bName(b, l), l));
  const list = skip => `<ul class="ctry-grid breed-grid">${sorted.filter(b => b !== skip).map(b => `<li><a href="${breedPath(l, b)}">${bThumb(b, l)}${esc(bName(b, l))}</a></li>`).join('')}</ul>`;
  const foot = `<footer class="site-footer"><div class="wrap foot-row"><a class="brand" href="${homePath(l)}"><img src="/logo-doghead.png" alt="" width="32" height="32"><span class="wordmark">MijnDoggo</span></a><p>${esc(T.f_unsub)}</p></div><div class="wrap"><p class="small">© MijnDoggo.nl</p></div></footer><script src="/home.js" defer></script><script src="/signup.js" defer></script></body></html>`;
  write(breedIdx(l), head(l, `${T.bH} | MijnDoggo`, T.desc, breedIdx) + `<main id="content"><section class="hero"><div class="wrap split"><div class="hero-copy">
<p class="crumb"><a href="${homePath(l)}">← ${esc(T.backHome)}</a></p><h1>${esc(T.bH)}</h1><p class="hero-line">${esc(T.heroSub)}</p></div><div class="card"><h2 class="card-title">${esc(T.bStep)}</h2><label class="step"><select class="go" aria-label="${esc(T.bStep)}"><option value="">${esc(T.bChoose)}</option>${sorted.map(b => `<option value="${breedPath(l, b)}">${esc(bName(b, l))}</option>`).join('')}</select></label></div></div></section>
<section class="section countries"><div class="wrap"><h2>${esc(T.bAll)}</h2>${list()}</div></section></main>${foot}`);
  if (l === 'nl') sm.push(breedIdx);
  for (const b of BP) {
    const pf = x => breedPath(x, b), r = s => s.replaceAll('{b}', bName(b, l));
    write(pf(l), head(l, r(T.bTitle), r(T.bDesc), pf) + `<main id="content"><section class="hero"><div class="wrap split"><div class="hero-copy">
<p class="crumb"><a href="${breedIdx(l)}">← ${esc(T.bAll)}</a></p><p class="eyebrow">${esc(r(T.bEyebrow))}</p><h1>${esc(r(T.bH1))}</h1>${bFig(b, l)}<p class="breed-fame">${esc(BBL[b[0]][l])}</p><p class="lead">${esc(r(T.bLead))}</p>${COUNTER(`data-breed="${esc(b[0])}"`)}</div>${signup(T, b)}</div></section>
<section class="section trust"><div class="wrap two"><div>${story(T)}</div><div><h2>${esc(T.h_cheap)}</h2><p>${esc(T.cheap)}</p></div></div></section>
<section class="section countries"><div class="wrap"><h2>${esc(T.bOthers)}</h2><details class="all-breeds"><summary>${esc(SHOWALL[l])}</summary>${list(b)}</details></div></section></main>${foot}`);
    if (l === 'nl') sm.push(pf);
  }
}
function write404() { const T = i18n.nl; writeFileSync(OUT + '404.html', head('nl', 'Pagina niet gevonden | MijnDoggo', T.desc, homePath).replace('<link rel="canonical"', '<meta name="robots" content="noindex"><link rel="x"') + `<main id="content"><section class="hero"><div class="wrap"><h1>Deze pagina bestaat niet</h1><p class="hero-line">Woef! Hier is niets te vinden.</p><p><a class="mail-btn" href="/">Naar de homepage</a> <a class="mail-btn" href="/rassen/">Alle rassen</a></p></div></section></main></body></html>`); }
// 301 redirects (Cloudflare Pages _redirects). Language homepages /nl/ /de/ /fr/ are real pages and always win:
// no rule ever targets a bare /<lang>/ path, and iso shortcuts only exist one level deeper (/<lang>/<iso>/).
const R = new Map(), add = (from, to) => { if (from !== to && !R.has(from)) R.set(from, to); };

const homes = new Set(LANGS.map(homePath));
const canon = new Set(sm.flatMap(pf => LANGS.map(pf)));
for (const k of R.keys()) if (canon.has(k) || homes.has(k)) throw new Error('redirect clashes with a real page: ' + k);
for (const [a, t] of [...R]) if (a.length > 1 && a.endsWith('/')) add(a.slice(0, -1), t); // no-trailing-slash variants
write404();
writeFileSync(OUT + '_redirects', [...R].map(([a, b]) => `${a} ${b} 301`).join('\n') + '\n');
writeFileSync(OUT + 'robots.txt', `User-agent: *\nAllow: /\nDisallow: /api/\nSitemap: ${SITE}/sitemap.xml\n`);
const links = () => '';
writeFileSync(OUT + 'sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${sm.flatMap(pf => LANGS.map(l => `<url><loc>${SITE}${pf(l)}</loc>${links(pf)}</url>`)).join('\n')}\n</urlset>\n`);
console.log('built', sm.length * LANGS.length, 'pages,', countries.length, 'countries,', R.size, 'redirects');
