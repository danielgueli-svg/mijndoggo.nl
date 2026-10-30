// Breed page signup (NL only): up to 3 breed rows, optional NL place + radius with cross-border option, plan, email twice, then Mollie (test) checkout.
const f = document.getElementById('signup');
if (f) {
  // Step 1: breed rows (native selects, one breed per line), first pre-filled with the page breed; + adds a row, max 3; ✕ removes.
  const rows = f.querySelector('.brows'), tpl = f.querySelector('.browt'), lim = f.querySelector('.bstep .limit'), sels = () => [...f.querySelectorAll('.brows select[name=breed]')];
  const syncB = () => { const ss = sels(), full = ss.length >= 3;
    ss.forEach((s, i) => { s.setAttribute('aria-label', 'Ras ' + (i + 1)); s.parentElement.querySelector('.addb').hidden = full || i !== ss.length - 1; });
    lim.hidden = !full; lim.textContent = f.dataset.maxb; };
  rows.addEventListener('click', e => {
    if (e.target.closest('.addb') && sels().length < 3) { rows.append(tpl.content.cloneNode(true)); syncB(); sels().at(-1).focus(); f.dispatchEvent(new Event('change')); }
    const rm = e.target.closest('.rmb'); if (rm) { rm.parentElement.remove(); syncB(); sels().at(-1).focus(); f.dispatchEvent(new Event('change')); } });
  syncB();
  const prov = f.querySelector('select[name=province]'), rad = f.querySelector('select[name=radius]'), xbn = f.querySelector('.xbnote'), xbc = f.querySelector('input[name=crossBorder]');
  const syncXb = () => { if (!xbc.checked) { xbn.hidden = true; return; } const o = prov.selectedOptions[0];
    const r = o && o.value ? (JSON.parse(o.dataset.reach)['km' + rad.value] || []) : ['BE', 'DE'];
    xbn.textContent = r.length ? 'Binnen deze straal: ' + r.map(c => c === 'BE' ? 'België' : 'Duitsland').join(' en ') + '.' : 'Binnen deze straal valt nog geen buurland. Kies een grotere straal.'; xbn.hidden = false; };
  f.addEventListener('change', syncXb); syncXb();
  f.addEventListener('submit', async e => { e.preventDefault();
    const st = f.querySelector('.status'), fd = new FormData(f), btn = f.querySelector('button[type=submit]');
    const body = { email: fd.get('email'), email2: fd.get('email2'), consent: !!fd.get('consent'), breeds: [...new Set(fd.getAll('breed').filter(Boolean))], plan: fd.get('plan') };
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
