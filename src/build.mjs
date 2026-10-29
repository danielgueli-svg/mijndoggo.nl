import OPEN from '../data/open.json' with { type: 'json' };
import { readFileSync, writeFileSync, mkdirSync, rmSync, cpSync } from 'node:fs';
const J = p => JSON.parse(readFileSync(new URL('../' + p, import.meta.url)));
const i18n = J('data/i18n.json'), breeds = J('data/breeds.json'), countries = J('data/countries.json'), places = J('data/places.json');
const SITE = 'https://puppyalert.eu', OUT = new URL('../dist/', import.meta.url).pathname;
const LANGS = ['en', 'nl', 'de', 'fr', 'it']; // en = default (no prefix), others under /<lang>/
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const GJH = '<a href="https://gypsyjazzhub.com">Gypsy Jazz Hub</a>';
const enName = new Intl.DisplayNames(['en'], { type: 'region' });
const cname = (row, l) => row[2]?.[l] || new Intl.DisplayNames([l], { type: 'region' }).of(row[0]);
const slugify = t => t.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const slugOf = (row, l = 'en') => slugify(cname(row, l));
const isoAlias = row => ({ 'GB-ENG': 'eng', 'GB-SCT': 'sct', 'GB-WLS': 'wls', 'GB-NIR': 'nir' })[row[0]] || row[0].toLowerCase();
// URL pattern: home = / (en), /nl/, /de/, /fr/; country = /<lang>/<country name in that language, ascii slug>/ e.g. /en/netherlands/, /nl/nederland/
const pre = l => l === 'en' ? '' : `/${l}`;
const homePath = l => `${pre(l)}/`, countryPath = (l, row) => `/${l}/${slugOf(row, l)}/`;
rmSync(OUT, { recursive: true, force: true }); mkdirSync(OUT, { recursive: true });
cpSync(new URL('../public/', import.meta.url).pathname, OUT, { recursive: true });
const alt = pathFor => LANGS.map(l => `<link rel="alternate" hreflang="${l}" href="${SITE}${pathFor(l)}">`).join('') + `<link rel="alternate" hreflang="x-default" href="${SITE}${pathFor('en')}">`;
// Plain-text language dropdown (top right), keeps you on the same page; sets the lang cookie.
const langMenu = (l, pathFor) => `<label class="lang"><span class="lang-label">${esc(i18n[l].chooseLang)}</span><select aria-label="${esc(i18n[l].chooseLang)}" onchange="document.cookie='lang='+this.selectedOptions[0].lang+';path=/;max-age=31536000;samesite=lax';location.href=this.value">${LANGS.map(x => `<option value="${pathFor(x)}" lang="${x}"${x === l ? ' selected' : ''}>${i18n[x].name}</option>`).join('')}</select></label>`;
const head = (l, title, desc, pathFor) => `<!doctype html><html lang="${l}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title><meta name="description" content="${esc(desc)}"><link rel="canonical" href="${SITE}${pathFor(l)}">${alt(pathFor)}
<link rel="icon" href="/favicon.png"><link rel="apple-touch-icon" href="/apple-touch-icon.png"><link rel="stylesheet" href="/style.css">
<meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(desc)}"><meta property="og:url" content="${SITE}${pathFor(l)}"><meta property="og:image" content="${SITE}/logo-doghead.png"></head>
<body><header class="site-header"><div class="wrap head-row"><a class="brand" href="${homePath(l)}"><img src="/logo-doghead.png" alt="" width="40" height="40"><span class="wordmark">PuppyAlert</span></a>${langMenu(l, pathFor)}</div></header>`;
const story = T => `<h2>${esc(T.h_story)}</h2><p>${esc(T.story).replace('{GJH}', GJH)}</p>`;
const sections = (T, l, cs, home = false) => `<section class="section trust"><div class="wrap ${home ? 'one' : 'two'}">${home ? '' : `<div>${story(T)}</div>`}<div><h2>${esc(T.h_cheap)}</h2><p>${esc(T.cheap)}</p></div></div></section>
<section class="section preview"><div class="wrap"><h2>${esc(T.h_prev)}</h2><p class="example-tag">${esc(T.prev_note)}</p>
<div class="mail" aria-label="${esc(T.prev_note)}"><div class="mail-head"><p>${esc(T.m_from)}</p><p><strong>${esc(T.m_subj)}</strong></p></div><div class="mail-body"><img src="/logo-doghead.png" alt="" width="36" height="36"><p>${esc(T.m_body)}</p><span class="mail-btn">${esc(T.m_btn)}</span><p class="mail-foot"><u>${esc(T.m_unsub)}</u></p></div></div></div></section>
<section class="section countries"><div class="wrap"><h2>${esc(T.h_ctry)}</h2><p>${esc(T.ctry_note)}</p><ul class="ctry-grid">${cs.map(c => `<li><a href="${countryPath(l, c.row)}">${c.flag} ${esc(c.name)}</a><span class="badge-soon">${esc(T.soon)}</span></li>`).join('')}</ul></div></section></main>
<footer class="site-footer"><div class="wrap foot-row"><a class="brand" href="${homePath(l)}"><img src="/logo-doghead.png" alt="" width="32" height="32"><span class="wordmark">PuppyAlert</span></a><p>${esc(T.f_unsub)}</p></div><div class="wrap"><p class="small">© PuppyAlert.eu</p></div></footer>`;
const opts = (name, items, pre = []) => items.map(([v, label]) => `<label class="chip"><input type="checkbox" name="${name}" value="${esc(v)}"${pre.includes(v) ? ' checked' : ''}><span>${label}</span></label>`).join('');
const signup = (T, l, cs, cc) => `<div class="card"><h2 class="card-title">${esc(T.card)}</h2><form id="signup" data-lang="${l}" data-maxb="${esc(T.maxB)}" data-maxc="${esc(T.maxC)}" data-ok="${esc(T.ok)}" data-err="${esc(T.err)}" data-nearbad="${esc(T.nearBad)}" data-mis="${esc(T.mis)}" data-need="${esc(T.need)}">
<fieldset data-max="3" data-msg="maxB"><legend class="step">${esc(T.st1)}</legend><details class="picker"><summary><span>${esc(T.pickB)} (<b class="n">0</b>/3)</span></summary><div class="chips">${opts('breed', [...breeds].sort((a, b) => a.localeCompare(b, l)).map(b => [b, esc(b)]))}</div></details><p class="limit" hidden></p></fieldset>
<fieldset data-max="3" data-msg="maxC"><legend class="step">${esc(T.st2)}</legend><details class="picker"><summary><span>${esc(T.pickC)} (<b class="n">1</b>/3)</span></summary><div class="chips">${opts('country', cs.map(c => [c.cc, `${c.flag} ${esc(c.name)}`]), [cc])}</div></details><p class="limit" hidden></p>
<details class="picker near"><summary><span>${esc(T.nearT)}</span></summary><div class="near-body"><p class="note">${esc(T.nearHint)}</p>
<label>${esc(T.nearPlace)}<input type="text" name="place" list="places" placeholder="${esc(T.nearPh)}" autocomplete="off"></label><datalist id="places">${places.map(([pc, n, , , reach]) => `<option value="${esc(n)} (${pc})" data-reach='${esc(JSON.stringify(reach))}'>`).join('')}</datalist>
<label>${esc(T.nearRad)}<select name="radius" data-km="50,100,150" data-mi="50,100"></select></label><label class="consent xb" hidden><input type="checkbox" name="crossBorder" checked> ${esc(T.xb)}</label><p class="limit badplace" hidden>${esc(T.nearBad)}</p></div></details></fieldset>
<fieldset><legend class="step">${esc(T.st3)}</legend><div class="plans"><label class="plan"><input type="radio" name="plan" value="6m" checked><span>${esc(T.p6)}</span></label><label class="plan"><input type="radio" name="plan" value="12m"><span>${esc(T.p12)}</span></label></div><p class="note"><strong>${esc(T.once)}</strong> ${esc(T.payoff)}</p></fieldset>
<fieldset><legend class="step">${esc(T.st4)}</legend><label>${esc(T.email)}<input type="email" name="email" required autocomplete="email"></label><label>${esc(T.email2)}<input type="email" name="email2" required autocomplete="email"></label><p class="limit mis" hidden>${esc(T.mis)}</p>
<label class="consent"><input type="checkbox" name="consent" required> ${esc(T.consent)}</label>
<button type="submit">${esc(T.submit)}</button><p class="status" role="status"></p></fieldset>
<ul class="card-notes"><li>${esc(T.optin)}</li><li>${esc(T.noauto)}</li></ul></form></div>`;
const write = (p, html) => { mkdirSync(OUT + p, { recursive: true }); writeFileSync(OUT + p + 'index.html', html); };
const sm = [];
for (const l of LANGS) {
  const T = i18n[l];
  const cs = countries.map(row => ({ row, cc: row[0], flag: row[1], name: cname(row, l) })).sort((a, b) => a.name.localeCompare(b.name, l));
  // Homepage: language selector + country selector, no signup form.
  write(homePath(l), head(l, T.title, T.desc, homePath) + `<main id="content"><section class="hero"><div class="wrap split"><div class="hero-copy">
<h1>${esc(T.h1a)} <span class="h1-accent">${esc(T.h1b)}</span></h1><p class="hero-line">${esc(T.h1line)}</p><div class="hero-story">${story(T)}</div>
</div><div class="card"><h2 class="card-title">${esc(T.homeStep)}</h2>
<label class="step"><select class="go" aria-label="${esc(T.homeCard)}"><option value="">${esc(T.chooseC)}</option>${cs.map(c => `<option value="${countryPath(l, c.row)}">${c.flag} ${esc(c.name)}</option>`).join('')}</select></label>
<ul class="card-notes"><li>${esc(T.homeNote)}</li><li>${esc(T.once)}</li><li>${esc(T.noauto)}</li></ul></div></div></section>
${sections(T, l, cs, true)}<script src="/home.js" defer></script></body></html>`);
  if (l === 'en') sm.push(homePath);
  for (const c of cs) {
    const pf = x => countryPath(x, c.row), r = s => s.replaceAll('{c}', c.name);
    write(pf(l), head(l, r(T.cTitle), r(T.cDesc), pf) + `<main id="content"><section class="hero"><div class="wrap split"><div class="hero-copy">
<p class="crumb"><a href="${homePath(l)}">← ${esc(T.backHome)}</a></p><p class="eyebrow">${esc(r(T.cEyebrow))}</p><h1>${esc(r(T.cH1a))} <span class="h1-accent">${esc(T.cH1b)}</span></h1><p class="lead">${esc(r(T.cLead))}</p><p><span class="badge-soon dark">${esc(T.counts)}</span></p>
</div>${OPEN[c.cc] ? signup(T, l, cs, c.cc) : `<div class="card"><h2 class="card-title">${esc(T.card)}</h2><p class="closed">${esc(T.closed)}</p></div>`}</div></section>
${sections(T, l, cs)}<script src="/signup.js" defer></script></body></html>`);
    if (l === 'en') sm.push(pf);
  }
}
// 301 redirects (Cloudflare Pages _redirects). Language homepages /nl/ /de/ /fr/ are real pages and always win:
// no rule ever targets a bare /<lang>/ path, and iso shortcuts only exist one level deeper (/<lang>/<iso>/).
const R = new Map(), add = (from, to) => { if (from !== to && !R.has(from)) R.set(from, to); };
add('/en/', '/');
const homes = new Set(LANGS.map(homePath));
for (const row of countries) {
  for (const l of LANGS) {
    add(`/${l}/${isoAlias(row)}/`, countryPath(l, row));            // /nl/nl/ -> /nl/nederland/
    add(`${pre(l)}/europe/${slugify(cname(row, 'en'))}/`, countryPath(l, row)); // old WRA-style paths
  }
  for (const l of LANGS) { const bare = `/${slugOf(row, l)}/`; if (!homes.has(bare)) add(bare, countryPath('en', row)); } // bare slug -> EN
}
const canon = new Set(sm.flatMap(pf => LANGS.map(pf)));
for (const k of R.keys()) if (canon.has(k) || homes.has(k)) throw new Error('redirect clashes with a real page: ' + k);
for (const [a, t] of [...R]) if (a.length > 1 && a.endsWith('/')) add(a.slice(0, -1), t); // no-trailing-slash variants
writeFileSync(OUT + '_redirects', [...R].map(([a, b]) => `${a} ${b} 301`).join('\n') + '\n');
writeFileSync(OUT + 'robots.txt', `User-agent: *\nAllow: /\nDisallow: /api/\nSitemap: ${SITE}/sitemap.xml\n`);
const links = pf => LANGS.map(x => `<xhtml:link rel="alternate" hreflang="${x}" href="${SITE}${pf(x)}"/>`).join('') + `<xhtml:link rel="alternate" hreflang="x-default" href="${SITE}${pf('en')}"/>`;
writeFileSync(OUT + 'sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${sm.flatMap(pf => LANGS.map(l => `<url><loc>${SITE}${pf(l)}</loc>${links(pf)}</url>`)).join('\n')}\n</urlset>\n`);
console.log('built', sm.length * LANGS.length, 'pages,', countries.length, 'countries,', R.size, 'redirects');
