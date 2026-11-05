// Signup form v2. Field names sent to the API: breeds[], countries[], near: { place, radius, unit, regions }.
const f = document.getElementById('signup');
if (f) {
const q = s => f.querySelector(s), qa = s => [...f.querySelectorAll(s)];
const norm = t => String(t || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
// Step 1: search + breed rows (native selects), first pre-filled with the page breed; + adds a row, max 3; ✕ removes.
const rows = q('.brows'), tpl = q('.browt'), lim = q('.bstep .limit');
const sels = () => qa('select[name=breed]');
const syncB = () => {
  const ss = sels(), full = ss.length >= 3;
  ss.forEach((s, i) => { s.setAttribute('aria-label', q('.bstep legend').textContent.trim() + ' ' + (i + 1)); const a = s.parentElement.querySelector('.addb'); if (a) a.hidden = full || i !== ss.length - 1; });
  if (lim) { lim.hidden = !full; lim.textContent = f.dataset.maxb; }
};
rows.addEventListener('click', e => {
  if (e.target.closest('.addb') && sels().length < 3) { rows.append(tpl.content.cloneNode(true)); syncB(); sortBreedSelect(sels().at(-1)); sels().at(-1).focus(); gate(); }
  const rm = e.target.closest('.rmb'); if (rm) { rm.parentElement.remove(); syncB(); sels().at(-1)?.focus(); gate(); }
});
rows.addEventListener('change', () => gate());
syncB();

const find = q('.bfind'), sug = q('.bsug');
let catalog = [], counts = null;
const applyCounts = () => {
  if (!counts || !catalog.length) return;
  catalog.forEach(b => { if (typeof counts[b.slug] === 'number') b.n = counts[b.slug]; });
  sels().forEach(sel => {
    [...sel.options].forEach(o => {
      const b = catalog.find(x => x.id === o.value);
      if (b && b.n != null) o.dataset.n = String(b.n);
    });
    sortBreedSelect(sel);
  });
};
const taken = () => new Set(sels().map(s => s.value).filter(Boolean));
const fillBreed = id => {
  const empty = sels().find(s => !s.value);
  if (empty) empty.value = id;
  else if (sels().length < 3) {
    rows.append(tpl.content.cloneNode(true)); syncB(); sortBreedSelect(sels().at(-1));
    sels().at(-1).value = id;
  } else return false;
  gate(); return true;
};
const hideSug = () => { if (sug) { sug.hidden = true; sug.innerHTML = ''; } };
const showSug = qstr => {
  if (!sug || !catalog.length) return;
  const nq = norm(qstr).trim();
  if (!nq) { hideSug(); return; }
  const used = taken();
  const hits = catalog.filter(b => !used.has(b.id) && (norm(b.names.join(' ')).includes(nq) || b.names.some(n => norm(n).includes(nq))))
    .sort((a, b) => (b.n || 0) - (a.n || 0) || a.names[0].localeCompare(b.names[0], f.dataset.lang));
  sug.innerHTML = '';
  if (!hits.length) { const li = document.createElement('li'); li.className = 'bno'; li.textContent = f.dataset.nohit; sug.append(li); sug.hidden = false; return; }
  hits.slice(0, 8).forEach(b => {
    const li = document.createElement('li'); li.setAttribute('role', 'option');
    const langI = ['en','nl','de','fr','it','fi','sv','pt','da','sk'].indexOf(f.dataset.lang);
    li.textContent = b.names[langI] || b.names[0];
    li.dataset.id = b.id;
    li.addEventListener('mousedown', e => { e.preventDefault(); fillBreed(b.id); find.value = ''; hideSug(); });
    sug.append(li);
  });
  sug.hidden = false;
};
if (find) {
  find.addEventListener('input', () => showSug(find.value));
  find.addEventListener('keydown', e => {
    if (e.key === 'Escape') { hideSug(); find.blur(); }
    if (e.key === 'Enter') {
      e.preventDefault();
      const first = sug && !sug.hidden && sug.querySelector('[data-id]');
      if (first) { fillBreed(first.dataset.id); find.value = ''; hideSug(); }
    }
  });
  find.addEventListener('blur', () => setTimeout(hideSug, 150));
}
const sortBreedSelect = sel => {
  if (!sel || !catalog.length) return;
  const cur = sel.value;
  const rest = [...sel.options].slice(1).sort((a, b) => {
    const na = catalog.find(x => x.id === a.value)?.n || +a.dataset.n || 0;
    const nb = catalog.find(x => x.id === b.value)?.n || +b.dataset.n || 0;
    return nb - na || a.textContent.localeCompare(b.textContent, f.dataset.lang);
  });
  rest.forEach(o => sel.append(o));
  sel.value = cur;
};
fetch('/breed-index.json').then(r => r.ok ? r.json() : []).then(list => {
  catalog = Array.isArray(list) ? list : [];
  applyCounts();
  sels().forEach(sortBreedSelect);
}).catch(() => {});
fetch('/api/counts').then(r => r.ok ? r.json() : null).then(d => {
  if (!d || !d.by_breed) return;
  counts = d.by_breed;
  applyCounts();
}).catch(() => {});

// Step 2: stackable country + province/region rows (max 3), same + / ✕ pattern as breeds.
const crows = q('.crows'), ctpl = q('.crowt'), clim = q('.cstep .limit');
const csels = () => qa('select[name=country]');
let REG = null;
const fillRegions = row => {
  const cc = row.querySelector('select[name=country]').value, rs = row.querySelector('select[name=region]');
  const keep = rs.value, pack = REG && REG[cc], lang = f.dataset.lang;
  const term = (pack && pack.term && (pack.term[lang] || pack.term.en)) || '';
  rs.setAttribute('aria-label', term || q('.cstep legend').textContent.trim());
  rs.innerHTML = '';
  const any = document.createElement('option'); any.value = ''; any.textContent = f.dataset.any; rs.append(any);
  (pack ? pack.regions : []).forEach(r => { const o = document.createElement('option'); o.value = r.id; o.textContent = r.name; o.dataset.lat = r.lat; o.dataset.lon = r.lon; rs.append(o); });
  if ([...rs.options].some(o => o.value === keep)) rs.value = keep;
};
const syncC = () => {
  const ss = csels(), full = ss.length >= 3;
  ss.forEach((s, i) => { s.setAttribute('aria-label', q('.cstep legend').textContent.trim() + ' ' + (i + 1)); const a = s.parentElement.querySelector('.addc'); if (a) a.hidden = full || i !== ss.length - 1; });
  if (clim) { clim.hidden = !full; clim.textContent = f.dataset.maxc; }
  dimRadius();
};
const dimRadius = () => {
  const rstep = q('.rstep');
  if (!rstep) return;
  const none = qa('select[name=region]').every(s => !s.value);
  rstep.classList.toggle('dim', none);
};
if (crows) {
  crows.addEventListener('click', e => {
    if (e.target.closest('.addc') && csels().length < 3) { crows.append(ctpl.content.cloneNode(true)); const row = crows.lastElementChild; if (REG) fillRegions(row); syncC(); row.querySelector('select[name=country]').focus(); gate(); }
    const rm = e.target.closest('.rmc'); if (rm) { rm.parentElement.remove(); syncC(); csels().at(-1)?.focus(); gate(); }
  });
  crows.addEventListener('change', e => {
    if (e.target.name === 'country') fillRegions(e.target.closest('.crow'));
    dimRadius(); gate();
  });
}
fetch('/regions.json').then(r => r.ok ? r.json() : null).then(d => {
  REG = d;
  qa('.crow').forEach(fillRegions);
  syncC();
}).catch(() => { syncC(); });
syncC();

const picked = () => sels().filter(s => s.value).map(s => ({ value: s.value, label: s.selectedOptions[0].textContent }));
const pickedCc = () => [...new Set(csels().map(s => s.value).filter(Boolean))];

// Breeder-count gate (under 5: ask for another breed or a wider area). Combo count shown only inside this form.
const G = JSON.parse(f.dataset.gate || '{}'), MIN_OPEN = +f.dataset.minopen, CLEAN_FROM = +f.dataset.cleanfrom;
const gbox = q('.gate'), sub = q('button[type=submit]');
const pf = (t, c) => (t && typeof t === 'object') ? (t[new Intl.PluralRules(f.dataset.lang).select(c)] ?? t.other) : t;
const fill = (t, v) => String(pf(t, v.c) || '').replace(/\{n\}/g, v.n).replace(/\{(breed|ras)\}/g, v.breed).replace(/\{(region|regio)\}/g, v.region);
const fmt = n => n.toLocaleString(f.dataset.lang);
let gateOpen = true, seq = 0;
const regionName = () => {
  const bits = qa('.crow').map(row => {
    const c = row.querySelector('select[name=country]');
    const r = row.querySelector('select[name=region]');
    const cn = c.selectedOptions[0] ? c.selectedOptions[0].textContent.replace(/^\S+\s/, '').trim() : '';
    return r && r.value && r.selectedOptions[0] ? r.selectedOptions[0].textContent : cn;
  }).filter(Boolean);
  return [...new Set(bits)].join(', ');
};
const gate = async () => {
  const my = ++seq, on = picked(), ccs = pickedCc();
  if (!on.length || !ccs.length) { gbox.hidden = true; gateOpen = true; sub.disabled = f.dataset.thin === '1'; return; }
  const get = u => fetch(u).then(r => (r.ok ? r.json() : null)).catch(() => null);
  const res = await Promise.all(ccs.flatMap(cc => on.map(b => get(`/api/count?breed=${encodeURIComponent(slugify(b.value))}&country=${encodeURIComponent(cc)}`).then(r => ({ r, b, cc })))));
  if (my !== seq) return;
  if (res.some(x => !x.r)) { gbox.hidden = true; gateOpen = true; sub.disabled = f.dataset.thin === '1'; return; }
  const worst = res.reduce((a, x) => (x.r.count < a.r.count ? x : a), res[0]);
  const n = worst.r.count;
  const v = { n: fmt(n), c: n, breed: worst.b.label, region: regionName() };
  const t = n < MIN_OPEN ? 1 : n < CLEAN_FROM ? 2 : 3;
  gbox.hidden = false; gbox.dataset.tier = t;
  q('.gate-h').textContent = fill(G['t' + t + 'h'], v);
  const gn = q('.gate-n'), hasN = /\{n\}/.test(G['t' + t + 'h'] || ''); gn.hidden = hasN || t === 1; gn.textContent = v.n;
  q('.gate-t').textContent = t === 3 ? '' : fill(G['t' + t], v);
  q('.gate-tip').textContent = t === 2 ? G.t2tip : '';
  const gb = q('.gate-btn'); gb.hidden = t !== 1; gb.textContent = G.t1btn || '';
  sub.textContent = t === 1 ? sub.textContent : (G['t' + t + 'btn'] || sub.textContent);
  gateOpen = t !== 1; sub.disabled = !gateOpen || f.dataset.thin === '1';
};
const slugify = t => String(t).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
q('.gate-btn').onclick = () => (csels()[0] || find).focus();
gate();

f.addEventListener('submit', async e => {
  e.preventDefault();
  const st = q('.status'), fd = new FormData(f), btn = q('button[type=submit]');
  const body = { lang: f.dataset.lang, email: fd.get('email'), email2: fd.get('email2'), consent: !!fd.get('consent'), breeds: [...new Set(fd.getAll('breed').filter(Boolean))], countries: pickedCc(), plan: fd.get('plan') };
  const regions = qa('.crow').map(row => {
    const cc = row.querySelector('select[name=country]').value;
    const rs = row.querySelector('select[name=region]');
    if (!cc || !rs.value) return null;
    return { country: cc, id: rs.value, name: rs.selectedOptions[0].textContent };
  }).filter(Boolean);
  if (regions.length) body.near = { place: regions.map(r => r.name).join('; '), radius: +q('input[name=radius]:checked').value, unit: 'km', regions };
  const mis = q('.mis'); mis.hidden = String(fd.get('email') || '').trim().toLowerCase() === String(fd.get('email2') || '').trim().toLowerCase();
  if (!mis.hidden) { st.textContent = f.dataset.mis; return; }
  if (!body.breeds.length || !body.countries.length) { st.textContent = f.dataset.need; return; }
  if (!gateOpen) { st.textContent = G.t1h || ''; return; }
  if (f.dataset.closed) { st.textContent = f.dataset.closed; st.classList.add('soon'); return; }
  btn.disabled = true;
  try { const r = await fetch('/api/signup', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) }); const d = await r.json().catch(() => ({})); st.textContent = r.ok ? f.dataset.ok : (r.status === 400 && d.error === 'near' ? f.dataset.nearbad : f.dataset.err); if (r.ok && d.checkoutUrl && /^https:\/\/[a-z0-9.-]*mollie\.com\//.test(d.checkoutUrl)) { location.href = d.checkoutUrl; return; } }
  catch { st.textContent = f.dataset.err; }
  btn.disabled = false;
});
}
