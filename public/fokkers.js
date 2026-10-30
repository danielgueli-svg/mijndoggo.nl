// Fokkersaantal per ras (live PuppyAlert /api/counts by_breed). <=4 rood: te weinig, aanmelden kan niet. 5-9 oranje: kleine groep. >=10 groen.
(() => {
const T = n => n <= 4 ? 'lo' : n < 10 ? 'mid' : 'ok';
const C = { lo: '#b3261e', mid: '#8a5a00', ok: '#1b6e2f' };
const M = { lo: 'Te weinig fokkers voor dit ras. Aanmelden voor dit ras kan nog niet.', mid: 'Kleine groep fokkers, dus nestjes zijn schaars.' };
const lab = n => n.toLocaleString('nl-NL') + (n === 1 ? ' fokker' : ' fokkers');
const key = h => { const m = String(h).match(/(puppyalert\.eu)?\/(?:nl\/)?rassen\/([^/?#]+)/); return m ? (m[1] ? 'pa:' : '') + m[2] : null; };
Promise.all([fetch('https://puppyalert.eu/api/counts').then(r => r.ok ? r.json() : null), fetch('/fokker-slugs.json').then(r => r.json())]).then(([d, S]) => {
  const B = d && d.by_breed; if (!B) return;
  const N = k => (k && k in S) ? (B[S[k]] || 0) : null;
  // Gids-dropdown: aantal + niveau in elke optie.
  document.querySelectorAll('#gids-ras option').forEach(o => { const n = N(key(o.value)); if (n === null) return; const t = T(n); o.style.color = C[t]; o.textContent += ' · ' + lab(n) + (t === 'lo' ? ' – te weinig' : t === 'mid' ? ' – kleine groep' : ''); });
  // Rassenpagina: badge onder de titel.
  const page = location.pathname.match(/^\/rassen\/([^/]+)\/?$/), h1 = document.querySelector('main h1');
  if (page && h1) { const n = N(page[1]); if (n !== null) { const t = T(n), p = document.createElement('p'); p.className = 'mdthr'; p.dataset.t = t; p.style.cssText = 'margin:.5rem 0 0;font-weight:700;color:' + C[t]; p.textContent = lab(n) + (M[t] ? ' · ' + M[t] : ''); h1.after(p); } }
  // Zoekresultaten en raskaarten: aantal achter elke raslink.
  const tag = () => document.querySelectorAll('#md-search a[href*="/rassen/"]').forEach(a => {
    if (a.querySelector('.mdthr')) return; const n = N(key(a.getAttribute('href'))); if (n === null) return; const t = T(n), s = document.createElement('span');
    s.className = 'mdthr'; s.dataset.t = t; s.style.cssText = 'display:block;font-size:.8rem;font-weight:700;color:' + C[t]; s.textContent = lab(n) + (M[t] ? ' · ' + M[t] : ''); a.append(s); });
  new MutationObserver(tag).observe(document.body, { childList: true, subtree: true });
}).catch(() => {});
})();
