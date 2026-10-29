// Multi-select with max 3: at the limit, grey out unchecked options and show the translated message.
const f = document.getElementById('signup');
f.querySelectorAll('fieldset[data-max]').forEach(fs => {
  const max = +fs.dataset.max, msg = fs.querySelector('.limit');
  fs.addEventListener('change', () => {
    const boxes = [...fs.querySelectorAll('input[name=breed], input[name=country]')], n = boxes.filter(b => b.checked).length;
    boxes.forEach(b => { if (!b.checked) { b.disabled = n >= max; b.parentElement.classList.toggle('off', n >= max); } });
    fs.querySelector('.n').textContent = n; msg.hidden = n < max; msg.textContent = f.dataset[fs.dataset.msg.toLowerCase()];
  });
});
// Optional place + radius. Miles if the UK is among the chosen countries, otherwise km.
const rad = f.querySelector('select[name=radius]'), place = f.querySelector('input[name=place]');
const syncRadius = () => {
  const mi = f.querySelector('input[name=country][value=GB]:checked'), unit = mi ? 'mi' : 'km';
  if (rad.dataset.unit === unit) return; rad.dataset.unit = unit;
  rad.innerHTML = rad.dataset[unit].split(',').map(v => `<option value="${v}">${v} ${unit === 'mi' ? 'miles' : 'km'}</option>`).join('');
};
// Cross-border checkbox: only when the place + radius reaches a country that isn't already chosen (precomputed in data/places.json).
const xb = f.querySelector('.xb'), opt = v => [...document.querySelectorAll('#places option')].find(o => o.value === v);
const crossing = () => {
  const o = opt((place.value || '').trim()); if (!o) return false;
  const chosen = new Set([...f.querySelectorAll('input[name=country]:checked')].map(b => b.value));
  return (JSON.parse(o.dataset.reach)[rad.dataset.unit + rad.value] || []).some(c => !chosen.has(c));
};
const syncXb = () => { xb.hidden = !crossing(); };
syncRadius(); syncXb(); f.addEventListener('change', () => { syncRadius(); syncXb(); }); place.addEventListener('input', syncXb);
f.addEventListener('submit', async e => {
  e.preventDefault();
  const st = f.querySelector('.status'), fd = new FormData(f);
  const body = { lang: f.dataset.lang, email: fd.get('email'), email2: fd.get('email2'), consent: !!fd.get('consent'), breeds: fd.getAll('breed'), countries: fd.getAll('country'), plan: fd.get('plan') };
  const bad = f.querySelector('.badplace'), pv = (fd.get('place') || '').trim(); bad.hidden = true;
  if (pv) { if (![...document.querySelectorAll('#places option')].some(o => o.value === pv)) { bad.hidden = false; st.textContent = f.dataset.nearbad; return; } body.near = { place: pv, radius: +fd.get('radius'), unit: rad.dataset.unit, crossBorder: crossing() && f.querySelector('input[name=crossBorder]').checked }; }
  const mis = f.querySelector('.mis'); mis.hidden = fd.get('email') === fd.get('email2');
  if (!mis.hidden) { st.textContent = f.dataset.mis; return; }
  if (!body.breeds.length || !body.countries.length) { st.textContent = f.dataset.need; return; }
  try { const r = await fetch('/api/signup', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) }); st.textContent = r.ok ? f.dataset.ok : f.dataset.err; }
  catch { st.textContent = f.dataset.err; }
});
