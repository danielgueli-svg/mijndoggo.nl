// Multi-select with max 3: at the limit, grey out unchecked options and show the translated message.
const f = document.getElementById('signup');
f.querySelectorAll('fieldset[data-max]').forEach(fs => {
  const max = +fs.dataset.max, msg = fs.querySelector('.limit');
  fs.addEventListener('change', () => {
    const boxes = [...fs.querySelectorAll('.picker:not(.region) input[type=checkbox]')], n = boxes.filter(b => b.checked).length;
    boxes.forEach(b => { if (!b.checked) { b.disabled = n >= max; b.parentElement.classList.toggle('off', n >= max); } });
    fs.querySelector('.n').textContent = n; msg.hidden = n < max; msg.textContent = f.dataset[fs.dataset.msg.toLowerCase()];
  });
});
// Optional regions: shown only for selected countries; none ticked = whole country.
const syncRegions = () => {
  const sel = new Set([...f.querySelectorAll('input[name=country]:checked')].map(b => b.value));
  f.querySelectorAll('details.region').forEach(d => {
    const on = sel.has(d.dataset.cc); d.hidden = !on;
    if (!on) d.querySelectorAll('input:checked').forEach(b => { b.checked = false; });
    const n = d.querySelectorAll('input:checked').length, rn = d.querySelector('.rn');
    rn.textContent = n ? rn.dataset.sel.replace('{n}', n) : rn.dataset.all;
  });
};
f.addEventListener('change', syncRegions);
f.addEventListener('submit', async e => {
  e.preventDefault();
  const st = f.querySelector('.status'), fd = new FormData(f);
  const body = { lang: f.dataset.lang, email: fd.get('email'), email2: fd.get('email2'), consent: !!fd.get('consent'), breeds: fd.getAll('breed'), countries: fd.getAll('country'), plan: fd.get('plan'), regions: {} };
  for (const v of fd.getAll('region')) { const [cc, r] = [v.slice(0, 2), v.slice(3)]; if (body.countries.includes(cc)) (body.regions[cc] ||= []).push(r); }
  const mis = f.querySelector('.mis'); mis.hidden = fd.get('email') === fd.get('email2');
  if (!mis.hidden) { st.textContent = f.dataset.mis; return; }
  if (!body.breeds.length || !body.countries.length) { st.textContent = f.dataset.need; return; }
  try { const r = await fetch('/api/signup', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) }); st.textContent = r.ok ? f.dataset.ok : f.dataset.err; }
  catch { st.textContent = f.dataset.err; }
});
