// Selectors navigate to their page. Counter: number only (no listings), from /api/counts.
document.querySelectorAll('select.go').forEach(s => s.addEventListener('change', () => { if (s.value) location.href = s.value; }));

// Homepage breed search only: English and Dutch names, sorted by baked breeder counts, then the breed page.
(function () {
  const box = document.querySelector('.home-breed');
  if (!box) return;
  const find = box.querySelector('.bfind'), sug = box.querySelector('.bsug');
  if (!find || !sug) return;
  const LANGS = ['en', 'nl', 'de', 'fr', 'it', 'fi', 'sv', 'pt', 'da', 'sk'];
  const lang = box.dataset.lang || 'nl', i = Math.max(0, LANGS.indexOf(lang)), bseg = box.dataset.bseg || 'rassen';
  const norm = t => String(t || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const slugify = t => norm(t).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const href = b => '/' + bseg + '/' + slugify(b.names[i] || b.names[0]) + '/';
  let catalog = [];
  const hide = () => { sug.hidden = true; sug.innerHTML = ''; };
  const show = qstr => {
    const nq = norm(qstr).trim();
    if (!nq) { hide(); return; }
    const hits = catalog.filter(b => b.names.some(n => norm(n).includes(nq)))
      .sort((a, b) => (b.n || 0) - (a.n || 0) || (a.names[i] || a.names[0]).localeCompare(b.names[i] || b.names[0], lang));
    sug.innerHTML = '';
    if (!hits.length) { const li = document.createElement('li'); li.className = 'bno'; li.textContent = box.dataset.nohit || ''; sug.append(li); sug.hidden = false; return; }
    hits.slice(0, 8).forEach(b => {
      const li = document.createElement('li'); li.setAttribute('role', 'option');
      li.textContent = b.names[i] || b.names[0];
      li.dataset.href = href(b);
      li.addEventListener('mousedown', e => { e.preventDefault(); location.href = li.dataset.href; });
      sug.append(li);
    });
    sug.hidden = false;
  };
  find.addEventListener('input', () => show(find.value));
  find.addEventListener('keydown', e => {
    if (e.key === 'Escape') { hide(); find.blur(); }
    if (e.key === 'Enter') {
      e.preventDefault();
      const first = !sug.hidden && sug.querySelector('[data-href]');
      if (first) location.href = first.dataset.href;
    }
  });
  find.addEventListener('blur', () => setTimeout(hide, 150));
  fetch('/breed-index.json').then(r => r.ok ? r.json() : []).then(list => {
    catalog = (Array.isArray(list) ? list : []).slice().sort((a, b) => (b.n || 0) - (a.n || 0));
  }).catch(() => {});
})();
const pcs = document.querySelectorAll('.pup-counter');
if (pcs.length) fetch('/api/counts').then(r => r.ok ? r.json() : null).then(d => { if (!d || d.total == null) return;
  pcs.forEach(p => { let n, l;
    if (p.dataset.breed) { n = d.by_breed[p.dataset.breed] || 0; l = 'actieve aanbiedingen van dit ras bij Nederlandse fokkers'; }
    else if (p.dataset.country) { n = d.countries[p.dataset.country === 'GB-ENG' || p.dataset.country.startsWith('GB-') ? 'GB' : p.dataset.country] || 0; l = 'actieve aanbiedingen in dit land'; }
    else { n = d.total; l = 'actieve aanbiedingen van Nederlandse fokkers in onze gegevens'; }
    p.querySelector('.pc-n').textContent = n.toLocaleString('nl-NL'); p.querySelector('.pc-l').textContent = l; p.hidden = false; }); }).catch(() => {});
