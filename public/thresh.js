// Breeder-count threshold per selected breed (Europe-wide, live /api/counts by_breed; same rules as PuppyAlert public/thresh.js @ fcd3d70).
// <=4 red: too few, blocks signup. 5-9 orange: small-pool note + old PuppyAlert 'Klein clubje' box. >=10 green: count only.
(() => {
const C = { u: ['fokker', 'fokkers'], lo: 'Te weinig fokkers voor dit ras. Aanmelden voor dit ras kan nog niet.', mid: 'Kleine groep fokkers, dus nestjes zijn schaars.', lot: 'te weinig', mot: 'kleine groep' };
const slug = t => t.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const fmt = n => n.toLocaleString('nl-NL'), cnt = n => fmt(n) + ' ' + C.u[n === 1 ? 0 : 1];
fetch('/api/counts').then(r => r.ok ? r.json() : null).then(d => {
  const B = d && d.by_breed; if (!B) return; // API down: nothing shown, nothing blocked
  const N = s => B[s] || 0;
  document.querySelectorAll('select.go option[data-s]').forEach(o => { const n = N(o.dataset.s); o.style.color = n <= 4 ? '#b3261e' : n < 10 ? '#8a5a00' : '#1b6e2f'; o.textContent += ' · ' + cnt(n) + (n <= 4 ? ' – ' + C.lot : n < 10 ? ' – ' + C.mot : ''); });
  const f = document.getElementById('signup'); if (!f) return;
  const sub = f.querySelector('button[type=submit]'), gbox = f.querySelector('.gate');
  const run = () => {
    let thin = false, mid = null;
    f.querySelectorAll('.brows .brow').forEach(row => {
      const s = row.querySelector('select'); let p = row.nextElementSibling;
      if (!p || !p.classList.contains('bthr')) { p = document.createElement('p'); p.className = 'bthr'; p.setAttribute('aria-live', 'polite'); row.after(p); }
      if (!s.value) { p.hidden = true; return; }
      const n = N(slug(s.value)), t = n <= 4 ? 'lo' : n < 10 ? 'mid' : 'ok'; if (t === 'lo') thin = true; if (t === 'mid' && (mid === null || n > mid)) mid = n;
      p.hidden = false; p.dataset.t = t; p.innerHTML = '<b></b> <span></span>';
      p.querySelector('b').textContent = cnt(n); p.querySelector('span').textContent = t === 'ok' ? '' : C[t];
    });
    f.querySelectorAll('.brows .bthr').forEach(p => { if (!p.previousElementSibling || !p.previousElementSibling.classList.contains('brow')) p.remove(); });
    if (gbox) { gbox.hidden = mid === null || thin; if (mid !== null) gbox.querySelector('.gate-h').textContent = fmt(mid) + ' fokkers. Klein clubje, grote kans.'; }
    f.dataset.thin = thin ? '1' : ''; sub.disabled = thin;
  };
  f.addEventListener('change', run); f.addEventListener('click', () => setTimeout(run)); run();
  f.addEventListener('submit', e => { if (f.dataset.thin === '1') { e.preventDefault(); e.stopImmediatePropagation(); f.querySelector('.status').textContent = C.lo; } }, true);
}).catch(() => {});
})();
