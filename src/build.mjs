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
<body><header class="top"><a class="brand" href="${path(l)}"><img src="/logo-doghead.png" alt="" width="56" height="56"><span>PuppyAlert</span></a>${langMenu(l)}</header>
<main class="grid"><section class="left">
<h2>${esc(T.h_story)}</h2><p>${esc(T.story)}</p>
<h2>${esc(T.h_cheap)}</h2><p>${esc(T.cheap).replace('{GJH}', GJH)}</p>
<h2>${esc(T.h_net)}</h2><p>${esc(T.net)}</p><p class="soon">${esc(T.counts)}</p>
</section><section class="right"><form id="signup" data-lang="${l}" data-maxb="${esc(T.maxB)}" data-maxc="${esc(T.maxC)}" data-ok="${esc(T.ok)}" data-err="${esc(T.err)}" data-need="${esc(T.need)}">
<fieldset data-max="3" data-msg="maxB"><legend>${esc(T.s1)}</legend><div class="chips">${opts('breed', breeds.map(b => [b, esc(b)]))}</div><p class="limit" hidden></p></fieldset>
<fieldset data-max="3" data-msg="maxC"><legend>${esc(T.s2)}</legend><div class="chips">${opts('country', cs.map(([cc, f, n]) => [cc, `${f} ${esc(n)}`]))}</div><p class="limit" hidden></p></fieldset>
<fieldset><legend>${esc(T.s3)}</legend><label>${esc(T.email)}<input type="email" name="email" required autocomplete="email"></label>
<p class="pay">${esc(T.pay)}</p><label class="consent"><input type="checkbox" name="consent" required> ${esc(T.consent)}</label><p class="small">${esc(T.optin)}</p>
<button type="submit">${esc(T.submit)}</button><p class="status" role="status"></p></fieldset></form></section></main>
<footer>© PuppyAlert.eu</footer><script src="/signup.js" defer></script></body></html>`;
  mkdirSync(OUT + path(l), { recursive: true }); writeFileSync(OUT + path(l) + 'index.html', html);
}
writeFileSync(OUT + 'robots.txt', `User-agent: *\nAllow: /\nDisallow: /api/\nSitemap: ${SITE}/sitemap.xml\n`);
writeFileSync(OUT + 'sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${LANGS.map(l => `<url><loc>${SITE}${path(l)}</loc>${LANGS.map(x => `<xhtml:link rel="alternate" hreflang="${x}" href="${SITE}${path(x)}"/>`).join('')}<xhtml:link rel="alternate" hreflang="x-default" href="${SITE}/"/></url>`).join('\n')}\n</urlset>\n`);
console.log('built', LANGS.length, 'pages');
