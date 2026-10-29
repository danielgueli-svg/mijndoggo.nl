// Selectors navigate to their page. Counter: number only (no listings), from /api/counts.
document.querySelectorAll('select.go').forEach(s => s.addEventListener('change', () => { if (s.value) location.href = s.value; }));
const pcs = document.querySelectorAll('.pup-counter');
if (pcs.length) fetch('/api/counts').then(r => r.ok ? r.json() : null).then(d => { if (!d || d.total == null) return;
  pcs.forEach(p => { let n, l;
    if (p.dataset.breed) { n = d.by_breed[p.dataset.breed] || 0; l = 'actieve aanbiedingen van dit ras bij fokkers in Europa'; }
    else if (p.dataset.country) { n = d.countries[p.dataset.country === 'GB-ENG' || p.dataset.country.startsWith('GB-') ? 'GB' : p.dataset.country] || 0; l = 'actieve aanbiedingen in dit land'; }
    else { n = d.total; l = 'actieve aanbiedingen van fokkers in onze gegevens'; }
    p.querySelector('.pc-n').textContent = n.toLocaleString('nl-NL'); p.querySelector('.pc-l').textContent = l; p.hidden = false; }); }).catch(() => {});
