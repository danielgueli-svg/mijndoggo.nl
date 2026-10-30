// Breed page signup (NL only): max 3 breeds, optional NL place + radius with cross-border option, plan, email twice, then Mollie (test) checkout.
const f = document.getElementById('signup');
if (f) {
  f.querySelectorAll('fieldset[data-max]').forEach(fs => { const max = +fs.dataset.max, msg = fs.querySelector('.limit');
    const sync = () => { const boxes = [...fs.querySelectorAll('input[name=breed]')], n = boxes.filter(b => b.checked).length;
      boxes.forEach(b => { if (!b.checked) { b.disabled = n >= max; b.parentElement.classList.toggle('off', n >= max); } });
      fs.querySelector('.n').textContent = n; msg.hidden = n < max; msg.textContent = f.dataset.maxb; };
    fs.addEventListener('change', sync); sync(); });
  const prov = f.querySelector('select[name=province]'), rad = f.querySelector('select[name=radius]'), xbn = f.querySelector('.xbnote'), xbc = f.querySelector('input[name=crossBorder]');
  const syncXb = () => { if (!xbc.checked) { xbn.hidden = true; return; } const o = prov.selectedOptions[0];
    const r = o && o.value ? (JSON.parse(o.dataset.reach)['km' + rad.value] || []) : ['BE', 'DE'];
    xbn.textContent = r.length ? 'Binnen deze straal: ' + r.map(c => c === 'BE' ? 'België' : 'Duitsland').join(' en ') + '.' : 'Binnen deze straal valt nog geen buurland. Kies een grotere straal.'; xbn.hidden = false; };
  f.addEventListener('change', syncXb); syncXb();
  f.addEventListener('submit', async e => { e.preventDefault();
    const st = f.querySelector('.status'), fd = new FormData(f), btn = f.querySelector('button[type=submit]');
    const body = { email: fd.get('email'), email2: fd.get('email2'), consent: !!fd.get('consent'), breeds: fd.getAll('breed'), plan: fd.get('plan') };
    body.province = fd.get('province') || null; body.radius = +fd.get('radius'); body.crossBorder = xbc.checked;
    const mis = f.querySelector('.mis'); mis.hidden = fd.get('email').trim().toLowerCase() === fd.get('email2').trim().toLowerCase();
    if (!mis.hidden) { st.textContent = f.dataset.mis; return; }
    if (!body.breeds.length) { st.textContent = f.dataset.need; return; }
    btn.disabled = true; st.textContent = 'Even geduld…';
    try { const r = await fetch('/api/signup', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) }), d = await r.json();
      if (d.checkoutUrl) { location.href = d.checkoutUrl; return; } st.textContent = f.dataset.err; }
    catch { st.textContent = f.dataset.err; }
    btn.disabled = false; });
}
