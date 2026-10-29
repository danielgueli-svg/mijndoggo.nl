// Multi-select with max 3: at the limit, grey out unchecked options and show the translated message.
const f = document.getElementById('signup');
f.querySelectorAll('fieldset[data-max]').forEach(fs => {
  const max = +fs.dataset.max, msg = fs.querySelector('.limit');
  fs.addEventListener('change', () => {
    const boxes = [...fs.querySelectorAll('input[type=checkbox]')], n = boxes.filter(b => b.checked).length;
    boxes.forEach(b => { if (!b.checked) { b.disabled = n >= max; b.parentElement.classList.toggle('off', n >= max); } });
    msg.hidden = n < max; msg.textContent = f.dataset[fs.dataset.msg.toLowerCase()];
  });
});
f.addEventListener('submit', async e => {
  e.preventDefault();
  const st = f.querySelector('.status'), fd = new FormData(f);
  const body = { lang: f.dataset.lang, email: fd.get('email'), consent: !!fd.get('consent'), breeds: fd.getAll('breed'), countries: fd.getAll('country') };
  if (!body.breeds.length || !body.countries.length) { st.textContent = f.dataset.need; return; }
  try { const r = await fetch('/api/signup', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) }); st.textContent = r.ok ? f.dataset.ok : f.dataset.err; }
  catch { st.textContent = f.dataset.err; }
});
