import { readFileSync, writeFileSync, mkdirSync, rmSync, cpSync } from 'node:fs';
const J = p => JSON.parse(readFileSync(new URL('../' + p, import.meta.url)));
const i18n = J('data/i18n.json'), breeds = J('data/breeds.json'), countries = J('data/countries.json');
const SITE = 'https://puppyalert.eu', OUT = new URL('../dist/', import.meta.url).pathname;
const LANGS = ['en', 'nl', 'de', 'fr']; // en = default at /, others at /<lang>/
const path = l => l === 'en' ? '/' : `/${l}/`;
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const GJH = '<a href="https://gypsyjazzhub.com">Gypsy Jazz Hub</a>';
rmSync(OUT, { recursive: true, force: true }); mkdirSync(OUT, { recursive: true });
cpSync(new URL('../public/', import.meta.url).pathname, OUT, { recursive: true });
const hreflang = LANGS.map(l => `<link rel="alternate" hreflang="${l}" href="${SITE}${path(l)}">`).join('') + `<link rel="alternate" hreflang="x-default" href="${SITE}/">`;
// EU-flag language switcher (same pattern as EuroRentAlert.eu: <details> with 🇪🇺 summary)
const langMenu = l => `<details class="lang"><summary>🇪🇺 ${i18n[l].name}</summary><ul>${LANGS.map(x => `<li><a href="${path(x)}" hreflang="${x}"${x === l ? ' aria-current="true"' : ''}>${i18n[x].name}</a></li>`).join('')}</ul></details>`;
for (const l of LANGS) {
  const T = i18n[l], dn = new Intl.DisplayNames([l], { type: 'region' });
  const cs = countries.map(([cc, f]) => [cc, f, dn.of(cc)]).sort((a, b) => a[2].localeCompare(b[2], l));
  const opts = (name, items) => items.map(([v, label]) => `<label class="chip"><input type="checkbox" name="${name}" value="${esc(v)}"><span>${label}</span></label>`).join('');
  const html = `<!doctype html><html lang="${l}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(T.title)}</title><meta name="description" content="${esc(T.desc)}"><link rel="canonical" href="${SITE}${path(l)}">${hreflang}
<link rel="icon" href="/favicon.png"><link rel="apple-touch-icon" href="/apple-touch-icon.png"><link rel="stylesheet" href="/style.css">
<meta property="og:title" content="${esc(T.title)}"><meta property="og:url" content="${SITE}${path(l)}"><meta property="og:image" content="${SITE}/logo-doghead.png"></head>
<body><header class="site-header"><div class="wrap head-row"><a class="brand" href="${path(l)}"><img src="/logo-doghead.png" alt="" width="40" height="40"><span class="wordmark">PuppyAlert</span></a>${langMenu(l)}</div></header>
<main id="content"><section class="hero"><div class="wrap split"><div class="hero-copy">
<p class="eyebrow">${esc(T.eyebrow)}</p><h1>${esc(T.h1a)} <span class="h1-accent">${esc(T.h1b)}</span></h1><p class="hero-line">${esc(T.h1line)}</p><p class="lead">${esc(T.lead)}</p>
</div><div class="card"><h2 class="card-title">${esc(T.card)}</h2><form id="signup" data-lang="${l}" data-maxb="${esc(T.maxB)}" data-maxc="${esc(T.maxC)}" data-ok="${esc(T.ok)}" data-err="${esc(T.err)}" data-mis="${esc(T.mis)}" data-need="${esc(T.need)}">
<fieldset data-max="3" data-msg="maxB"><legend class="step">${esc(T.st1)}</legend><details class="picker"><summary><span>${esc(T.pickB)} (<b class="n">0</b>/3)</span></summary><div class="chips">${opts('breed', [...breeds].sort((a, b) => a.localeCompare(b, l)).map(b => [b, esc(b)]))}</div></details><p class="limit" hidden></p></fieldset>
<fieldset data-max="3" data-msg="maxC"><legend class="step">${esc(T.st2)}</legend><details class="picker"><summary><span>${esc(T.pickC)} (<b class="n">0</b>/3)</span></summary><div class="chips">${opts('country', cs.map(([cc, f, n]) => [cc, `${f} ${esc(n)}`]))}</div></details><p class="limit" hidden></p></fieldset>
<fieldset><legend class="step">${esc(T.st3)}</legend><div class="plans"><label class="plan"><input type="radio" name="plan" value="6m" checked><span>${esc(T.p6)}</span></label><label class="plan"><input type="radio" name="plan" value="12m"><span>${esc(T.p12)}</span></label></div><p class="note">${esc(T.payoff)}</p></fieldset>
<fieldset><legend class="step">${esc(T.st4)}</legend><label>${esc(T.email)}<input type="email" name="email" required autocomplete="email"></label><label>${esc(T.email2)}<input type="email" name="email2" required autocomplete="email"></label><p class="limit mis" hidden>${esc(T.mis)}</p>
<label class="consent"><input type="checkbox" name="consent" required> ${esc(T.consent)}</label>
<button type="submit">${esc(T.submit)}</button><p class="status" role="status"></p></fieldset>
<ul class="card-notes"><li>${esc(T.optin)}</li><li>${esc(T.noauto)}</li></ul></form></div></div></section>
<section class="section trust"><div class="wrap two"><div><h2>${esc(T.h_story)}</h2><p>${esc(T.story).replace('{GJH}', GJH)}</p></div><div><h2>${esc(T.h_cheap)}</h2><p>${esc(T.cheap)}</p></div></div></section>
<section class="section preview"><div class="wrap"><h2>${esc(T.h_prev)}</h2><p class="example-tag">${esc(T.prev_note)}</p>
<div class="mail" aria-label="${esc(T.prev_note)}"><div class="mail-head"><p>${esc(T.m_from)}</p><p><strong>${esc(T.m_subj)}</strong></p></div><div class="mail-body"><img src="/logo-doghead.png" alt="" width="36" height="36"><p>${esc(T.m_body)}</p><span class="mail-btn">${esc(T.m_btn)}</span><p class="mail-foot"><u>${esc(T.m_unsub)}</u></p></div></div></div></section>
<section class="section countries"><div class="wrap"><h2>${esc(T.h_ctry)}</h2><p>${esc(T.ctry_note)}</p><ul class="ctry-grid">${cs.map(([cc, f, n]) => `<li><span>${f} ${esc(n)}</span><span class="badge-soon">${esc(T.soon)}</span></li>`).join('')}</ul></div></section></main>
<footer class="site-footer"><div class="wrap foot-row"><a class="brand" href="${path(l)}"><img src="/logo-doghead.png" alt="" width="32" height="32"><span class="wordmark">PuppyAlert</span></a><p>${esc(T.f_unsub)}</p></div><div class="wrap"><p class="small">© PuppyAlert.eu</p></div></footer>
<script src="/signup.js" defer></script></body></html>`;
  mkdirSync(OUT + path(l), { recursive: true }); writeFileSync(OUT + path(l) + 'index.html', html);
}
writeFileSync(OUT + 'robots.txt', `User-agent: *\nAllow: /\nDisallow: /api/\nSitemap: ${SITE}/sitemap.xml\n`);
writeFileSync(OUT + 'sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${LANGS.map(l => `<url><loc>${SITE}${path(l)}</loc>${LANGS.map(x => `<xhtml:link rel="alternate" hreflang="${x}" href="${SITE}${path(x)}"/>`).join('')}<xhtml:link rel="alternate" hreflang="x-default" href="${SITE}/"/></url>`).join('\n')}\n</urlset>\n`);
console.log('built', LANGS.length, 'pages');
