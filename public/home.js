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
  let catalog = [], ready = false;
  const hide = () => { sug.hidden = true; sug.innerHTML = ''; };
  const label = b => {
    const name = b.names[i] || b.names[0];
    if (typeof b.nl === 'number' && typeof b.eu === 'number') return name + ' — ' + b.nl.toLocaleString('nl-NL') + ' NL · ' + b.eu.toLocaleString('nl-NL') + ' EU';
    return name;
  };
  const go = li => { location.href = li.dataset.href; };
  const show = qstr => {
    const nq = norm(qstr).trim();
    if (!nq) { hide(); return; }
    if (!ready) return;
    const hits = catalog.filter(b => b.names.some(n => norm(n).includes(nq)))
      .sort((a, b) => (b.eu || b.n || 0) - (a.eu || a.n || 0) || (a.names[i] || a.names[0]).localeCompare(b.names[i] || b.names[0], lang));
    sug.innerHTML = '';
    if (!hits.length) { const li = document.createElement('li'); li.className = 'bno'; li.textContent = box.dataset.nohit || ''; sug.append(li); sug.hidden = false; return; }
    hits.slice(0, 8).forEach(b => {
      const li = document.createElement('li'); li.setAttribute('role', 'option');
      li.textContent = label(b);
      li.dataset.href = href(b);
      li.addEventListener('pointerdown', e => { e.preventDefault(); go(li); });
      sug.append(li);
    });
    sug.hidden = false;
    const vv = window.visualViewport;
    const room = (vv ? vv.height : window.innerHeight) - find.getBoundingClientRect().bottom;
    if (room < 140) sug.scrollIntoView({ block: 'nearest' });
  };
  find.addEventListener('input', () => show(find.value));
  find.addEventListener('search', () => show(find.value));
  find.addEventListener('keydown', e => {
    if (e.key === 'Escape') { hide(); find.blur(); }
    if (e.key === 'Enter') {
      e.preventDefault();
      const first = !sug.hidden && sug.querySelector('[data-href]');
      if (first) go(first);
    }
  });
  find.addEventListener('blur', () => setTimeout(hide, 180));
  fetch('/breed-index.json').then(r => r.ok ? r.json() : []).then(list => {
    catalog = (Array.isArray(list) ? list : []).slice().sort((a, b) => (b.eu || b.n || 0) - (a.eu || a.n || 0));
    ready = true;
    if (norm(find.value).trim()) show(find.value);
  }).catch(() => {});
})();
const pcs = document.querySelectorAll('.pup-counter');
if (pcs.length) fetch('/api/counts').then(r => r.ok ? r.json() : null).then(d => { if (!d || d.total == null) return;
  const fmt = n => n.toLocaleString('nl-NL');
  pcs.forEach(p => {
    if (p.dataset.scope === 'all') {
      const nl = typeof d.nl === 'number' ? d.nl : d.countries && d.countries.NL;
      const eu = d.europe;
      const nlEl = p.querySelector('.pc-nl'), euEl = p.querySelector('.pc-eu');
      if (typeof nl !== 'number' || typeof eu !== 'number' || !nlEl || !euEl) return;
      nlEl.textContent = fmt(nl); euEl.textContent = fmt(eu); p.hidden = false; return;
    }
    let n, l;
    if (p.dataset.breed) { n = d.by_breed[p.dataset.breed] || 0; l = 'actieve aanbiedingen van dit ras bij Nederlandse fokkers'; }
    else if (p.dataset.country) { n = d.countries[p.dataset.country === 'GB-ENG' || p.dataset.country.startsWith('GB-') ? 'GB' : p.dataset.country] || 0; l = 'actieve aanbiedingen in dit land'; }
    else { n = d.total; l = 'actieve aanbiedingen van Nederlandse fokkers in onze gegevens'; }
    p.querySelector('.pc-n').textContent = fmt(n); p.querySelector('.pc-l').textContent = l; p.hidden = false;
  }); }).catch(() => {});
