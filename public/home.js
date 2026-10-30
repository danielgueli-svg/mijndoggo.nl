// Selectors navigate to their page. Counter: number only (no listings), from /api/counts.
// Homepage pill = breeders in the Netherlands (countries.NL). Breed pages = that breed (Europe-wide), colour tier: <=4 red, 5-9 orange, >=10 green.
document.querySelectorAll('select.go').forEach(s => s.addEventListener('change', () => { if (s.value) location.href = s.value; }));
const pcs = document.querySelectorAll('.pup-counter');
if (pcs.length) fetch('/api/counts').then(r => r.ok ? r.json() : null).then(d => { if (!d || d.total == null) return;
  pcs.forEach(p => { let n, l;
    if (p.dataset.breed) { n = d.by_breed[p.dataset.breed] || 0; l = n === 1 ? 'fokker van dit ras in ons netwerk (Europa)' : 'fokkers van dit ras in ons netwerk (Europa)';
      const t = n <= 4 ? 'lo' : n < 10 ? 'mid' : 'ok'; p.dataset.t = t;
      if (t !== 'ok') { const x = document.createElement('span'); x.className = 'pc-tier'; x.textContent = t === 'lo' ? 'Te weinig fokkers voor dit ras. Aanmelden voor dit ras kan nog niet.' : 'Kleine groep fokkers, dus nestjes zijn schaars.'; p.append(x); } }
    else { n = d.countries && d.countries.NL || 0; l = 'fokkers in Nederland in ons netwerk'; }
    p.querySelector('.pc-n').textContent = n.toLocaleString('nl-NL'); p.querySelector('.pc-l').textContent = l; p.hidden = false; }); }).catch(() => {});
