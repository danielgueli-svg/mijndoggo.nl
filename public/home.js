// Homepage selectors: language and country each navigate to their page.
document.querySelectorAll('select.go').forEach(s => s.addEventListener('change', () => { if (s.value) location.href = s.value; }));
