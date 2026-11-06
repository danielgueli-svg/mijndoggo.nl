import OPEN from '../data/open.json' with { type: 'json' };
import { readFileSync, writeFileSync, mkdirSync, rmSync, cpSync } from 'node:fs';
const J = p => JSON.parse(readFileSync(new URL('../' + p, import.meta.url)));
const i18n = J('data/i18n.json'), breeds = J('data/breeds.json'), countries = J('data/countries.json'), places = J('data/places.json');
// Active listings per breed: nl = Netherlands, eu = EU plus the UK. Lists sort on eu (the wider count).
const COUNTS = J('data/breed_counts.json');
const breedStat = id => { const row = COUNTS[id] || {}; return { nl: +row.nl || 0, eu: +row.eu || 0 }; };
const breedN = id => breedStat(id).eu;
const fmtN = n => n.toLocaleString('nl-NL');
const pair = id => { const s = breedStat(id); return `${fmtN(s.nl)} NL · ${fmtN(s.eu)} EU`; };
const byBreeders = (a, b) => breedN(b[0]) - breedN(a[0]) || String(a[1]).localeCompare(String(b[1]), 'nl');
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
const breedOptions = selected => `<option value="">${esc(i18n.nl.bChoose)}</option>` + [...J('data/breed_pages.json')].sort(byBreeders).map(b => `<option value="${esc(b[0])}" data-n="${breedN(b[0])}"${b[0] === selected ? ' selected' : ''}>${esc(b[1])}</option>`).join('');
const countryOptions = selected => countries.map(row => ({ code: row[0], flag: row[1], name: cname(row, 'nl') })).sort((a, b) => a.name.localeCompare(b.name, 'nl')).map(c => `<option value="${esc(c.code)}"${c.code === selected ? ' selected' : ''}>${c.flag} ${esc(c.name)}</option>`).join('');
const signup = (T, cur) => `<div class="card"><h2 class="card-title">${esc(T.card)}</h2><form id="signup" class="v2" data-lang="nl" data-maxb="${esc(T.maxB)}" data-maxc="${esc(T.maxC)}" data-ok="${esc(T.ok)}" data-err="${esc(T.err)}" data-nearbad="${esc(T.nearBad)}" data-mis="${esc(T.mis)}" data-need="${esc(T.need)}" data-nohit="${esc(T.nohit)}" data-any="${esc(T.anyRegion)}" data-search="${esc(T.searchB)}" data-gate="${esc(JSON.stringify(T.gate))}" data-minopen="5" data-cleanfrom="10" data-bmin="4">
<fieldset class="bstep" data-max="3"><legend class="step2"><span class="num">1</span>${esc(T.stBreeds)}</legend><input type="search" class="sel bfind" placeholder="${esc(T.searchB)}" aria-label="${esc(T.searchB)}" autocomplete="off" enterkeyhint="search"><ul class="bsug" hidden role="listbox"></ul><div class="brows"><div class="brow"><select name="breed" class="sel bsel" aria-label="${esc(T.stBreeds)} 1">${breedOptions(cur[0])}</select><button type="button" class="addb" aria-label="${esc(T.addB)}" title="${esc(T.addB)}">+</button></div></div><template class="browt"><div class="brow"><select name="breed" class="sel bsel">${breedOptions('')}</select><button type="button" class="addb" aria-label="${esc(T.addB)}" title="${esc(T.addB)}">+</button><button type="button" class="rmb" aria-label="${esc(T.rmB)}" title="${esc(T.rmB)}">✕</button></div></template><p class="limit" hidden></p></fieldset>
<fieldset class="cstep" data-max="3"><legend class="step2"><span class="num">2</span>${esc(T.stLand)}</legend><div class="crows"><div class="crow"><select name="country" class="sel csel" aria-label="${esc(T.stLand)} 1">${countryOptions('NL')}</select><select name="region" class="sel rsel" aria-label="${esc(T.regionLabel)}"><option value="">${esc(T.anyRegion)}</option></select><button type="button" class="addc" aria-label="${esc(T.addC)}" title="${esc(T.addC)}">+</button></div></div><template class="crowt"><div class="crow"><select name="country" class="sel csel">${countryOptions('')}</select><select name="region" class="sel rsel"><option value="">${esc(T.anyRegion)}</option></select><button type="button" class="addc" aria-label="${esc(T.addC)}" title="${esc(T.addC)}">+</button><button type="button" class="rmc" aria-label="${esc(T.rmC)}" title="${esc(T.rmC)}">✕</button></div></template><p class="limit climit" hidden></p></fieldset>
<fieldset class="rstep"><legend class="step2"><span class="num">3</span>${esc(T.stRadius)} <em class="opt">(${esc(T.optional)})</em></legend><div class="seg" role="radiogroup" aria-label="${esc(T.stRadius)}"><label><input type="radio" name="radius" value="150"><span>150 <i class="u">km</i></span></label><label><input type="radio" name="radius" value="300" checked><span>300 <i class="u">km</i></span></label><label><input type="radio" name="radius" value="500"><span>500 <i class="u">km</i></span></label></div><p class="note r4">${esc(T.pickRegion)}</p></fieldset>
<div class="gate" aria-live="polite" hidden><p class="gate-n" hidden></p><h3 class="gate-h"></h3><p class="gate-t"></p><p class="gate-tip"></p><button type="button" class="gate-btn" hidden></button></div><p class="note gate-uni">${esc(T.gate.universal)}</p>
<fieldset><legend class="step2"><span class="num">4</span>${esc(T.stPlan)}</legend><div class="plans"><label class="plan"><input type="radio" name="plan" value="12m" checked><span>${esc(T.p12)}</span></label></div><p class="note"><strong>${esc(T.once)}</strong> Je betaalt via Mollie (iDEAL of kaart). Testomgeving: er wordt niets echt afgeschreven.</p></fieldset>
<fieldset><legend class="step2"><span class="num">5</span>${esc(T.stMail)}</legend><label>${esc(T.email)}<input type="email" name="email" required autocomplete="email"></label><label>${esc(T.email2)}<input type="email" name="email2" required autocomplete="email"></label><p class="limit mis" hidden>${esc(T.mis)}</p>
<label class="consent"><input type="checkbox" name="consent" required> ${esc(T.consent)}</label>
<button type="submit">${esc(T.submitAlert)}</button><p class="status" role="status"></p></fieldset>
<ul class="card-notes"><li>${esc(T.optin)}</li><li>${esc(T.noauto)}</li></ul></form></div>`;
const write = (p, html) => { mkdirSync(OUT + p, { recursive: true }); writeFileSync(OUT + p + 'index.html', html); };
const sm = [];
for (const l of LANGS) {
  const T = i18n[l];
  const cs = countries.map(row => ({ row, cc: row[0], flag: row[1], name: cname(row, l) })).sort((a, b) => a.name.localeCompare(b.name, l));
  // Homepage: breed search only. The full signup form stays on the breed pages.
  const ranked = [...J('data/breed_pages.json')].sort(byBreeders);
  const breedItem = b => `<li><a href="${pre(l)}/${T.bSeg}/${slugify(b[1])}/"><span class="rn">${esc(b[1])}</span><span class="rc">${esc(pair(b[0]))}</span></a></li>`;
  const topList = ranked.slice(0, 20).map(breedItem).join('');
  const restList = ranked.slice(20).map(breedItem).join('');
  const moreBreeds = restList ? `<details class="more-breeds"><summary>Toon alle rassen</summary><ol class="rasklikker">${restList}</ol></details>` : '';
  const homeBreed = `<div class="card v2 home-breed" data-lang="nl" data-bseg="${esc(T.bSeg)}" data-nohit="${esc(T.nohit)}"><h2 class="card-title">${esc(T.bStep)}</h2><div class="home-find"><input type="search" class="sel bfind" placeholder="${esc(T.searchB)}" aria-label="${esc(T.bStep)}" autocomplete="off" enterkeyhint="search"><ul class="bsug" hidden role="listbox"></ul></div><ol class="rasklikker">${topList}</ol>${moreBreeds}</div>`;
  write(homePath(l), head(l, T.title, T.desc, homePath) + `<main id="content"><section class="hero"><div class="wrap split"><div class="hero-copy">
<h1>${esc(T.heroH)}</h1><figure class="hero-photo"><img src="/img/hero/golden-retriever-puppy-320.webp" srcset="/img/hero/golden-retriever-puppy-320.webp 320w, /img/hero/golden-retriever-puppy-640.webp 640w" sizes="(max-width: 599px) 200px, 360px" width="640" height="480" fetchpriority="high" decoding="async" alt="Golden retriever-pup die op een houten vloer ligt"><figcaption><a href="https://commons.wikimedia.org/wiki/File:Golden_Retriever_Puppy_12weeks.JPG" rel="nofollow noopener">Foto</a>: Beatrice Milek, <a href="https://creativecommons.org/licenses/by/3.0" rel="license nofollow noopener">CC BY 3.0</a></figcaption></figure><p class="hero-line">${esc(T.heroSub)}</p><p class="pup-counter" data-scope="all" hidden><strong class="pc-nl"></strong> Nederlandse fokkers en <strong class="pc-eu"></strong> fokkers in heel Europa plus het VK</p><div class="hero-story">${story(T)}</div>
</div>${homeBreed}</div></section>
${sections(T, l, cs, true)}<script src="/home.js" defer></script><script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='{"token":"8e1136cf637345998ad9c91fa1f40765"}'></script></body></html>`);
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
  const sorted = [...BP].sort((a, b) => breedN(b[0]) - breedN(a[0]) || bName(a, l).localeCompare(bName(b, l), l));
  const list = skip => `<ul class="ctry-grid breed-grid">${sorted.filter(b => b !== skip).map(b => `<li><a href="${breedPath(l, b)}">${bThumb(b, l)}${esc(bName(b, l))}</a></li>`).join('')}</ul>`;
  const foot = `<footer class="site-footer"><div class="wrap foot-row"><a class="brand" href="${homePath(l)}"><img src="/logo-doghead.png" alt="" width="32" height="32"><span class="wordmark">MijnDoggo</span></a><p>${esc(T.f_unsub)}</p></div><div class="wrap"><p class="small">© MijnDoggo.nl</p></div></footer><script src="/home.js" defer></script><script src="/signup.js" defer></script><script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='{"token":"8e1136cf637345998ad9c91fa1f40765"}'></script></body></html>`;
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
function write404() { const T = i18n.nl; writeFileSync(OUT + '404.html', head('nl', 'Pagina niet gevonden | MijnDoggo', T.desc, homePath).replace('<link rel="canonical"', '<meta name="robots" content="noindex"><link rel="x"') + `<main id="content"><section class="hero"><div class="wrap"><h1>Deze pagina bestaat niet</h1><p class="hero-line">Woef! Hier is niets te vinden.</p><p><a class="mail-btn" href="/">Naar de homepage</a> <a class="mail-btn" href="/rassen/">Alle rassen</a></p></div></section></main><script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='{"token":"8e1136cf637345998ad9c91fa1f40765"}'></script></body></html>`); }
// 301 redirects (Cloudflare Pages _redirects). Language homepages /nl/ /de/ /fr/ are real pages and always win:
// no rule ever targets a bare /<lang>/ path, and iso shortcuts only exist one level deeper (/<lang>/<iso>/).
const R = new Map(), add = (from, to) => { if (from !== to && !R.has(from)) R.set(from, to); };

const homes = new Set(LANGS.map(homePath));
const canon = new Set(sm.flatMap(pf => LANGS.map(pf)));
for (const k of R.keys()) if (canon.has(k) || homes.has(k)) throw new Error('redirect clashes with a real page: ' + k);
for (const [a, t] of [...R]) if (a.length > 1 && a.endsWith('/')) add(a.slice(0, -1), t); // no-trailing-slash variants
write404();
writeFileSync(OUT + 'breed-index.json', JSON.stringify(BP.map(b => { const s = breedStat(b[0]); return { id: b[0], slug: slugify(b[0]), n: s.eu, nl: s.nl, eu: s.eu, names: b }; })));
cpSync(new URL('../data/regions.json', import.meta.url).pathname, OUT + 'regions.json');
writeFileSync(OUT + '_redirects', [...R].map(([a, b]) => `${a} ${b} 301`).join('\n') + '\n');
writeFileSync(OUT + 'robots.txt', `User-agent: *\nAllow: /\nDisallow: /api/\nSitemap: ${SITE}/sitemap.xml\n`);
const links = () => '';
writeFileSync(OUT + 'sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${sm.flatMap(pf => LANGS.map(l => `<url><loc>${SITE}${pf(l)}</loc>${links(pf)}</url>`)).join('\n')}\n</urlset>\n`);
console.log('built', sm.length * LANGS.length, 'pages,', countries.length, 'countries,', R.size, 'redirects');
