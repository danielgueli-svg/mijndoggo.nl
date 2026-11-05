import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { breedKeys, listingCountry, RADII } from '../lib/data.js';
import { matchQuery } from '../lib/match.js';
import { onRequestPost } from '../functions/api/signup.js';

const post = body => onRequestPost({
  request: new Request('https://mijndoggo.nl/api/signup', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) }),
  env: { SIGNUPS_OPEN: 'true' },
});

const base = {
  email: 'a@example.com', email2: 'A@Example.com', consent: true,
  breeds: ['Dachshund'], countries: ['NL'], plan: '12m',
};

test('breed keys map English and slug both ways', () => {
  assert.deepEqual(breedKeys('Dachshund'), breedKeys('dachshund'));
  assert.equal(breedKeys('German Shepherd').slug, 'german-shepherd');
  assert.equal(listingCountry('GB-ENG'), 'GB');
  assert.deepEqual(RADII, [150, 300, 500]);
});

test('match uses stacked countries and still understands the old NL reach', () => {
  const next = matchQuery({ breeds: '["Dachshund"]', country: 'GB', near: JSON.stringify({ countries: ['NL', 'GB-SCT'], radius: 300, regions: [{ country: 'NL', id: 'NL-NH', name: 'Noord-Holland' }] }) });
  assert.deepEqual(next.binds.slice(-2), ['NL', 'GB']);
  assert.ok(next.binds.includes('Dachshund') && next.binds.includes('dachshund'));
  const old = matchQuery({ breeds: '["Poodle"]', country: 'NL', near: JSON.stringify({ province: 'Limburg', radius: 50, crossBorder: true, reach: ['BE', 'DE'] }) });
  assert.deepEqual(old.binds.slice(-3), ['NL', 'BE', 'DE']);
});

test('signup rejects a bad region and accepts a real province with 300 km', async () => {
  const bad = await (await post({ ...base, near: { unit: 'km', radius: 50, regions: [{ country: 'NL', id: 'NL-NH', name: 'Noord-Holland' }] } })).json();
  assert.equal(bad.error, 'near');
  const unknown = await (await post({ ...base, near: { unit: 'km', radius: 300, regions: [{ country: 'NL', id: 'nope', name: 'Ergens' }] } })).json();
  assert.equal(unknown.error, 'near');
  const ok = await post({ ...base, countries: ['NL', 'DE'], near: { unit: 'km', radius: 300, regions: [{ country: 'NL', id: 'NL-NH', name: 'ignored' }, { country: 'DE', id: 'DE-BY', name: 'ignored' }] } });
  assert.equal(ok.status, 503);
  assert.equal((await ok.json()).error, 'not_stored');
});

test('signup rejects a fourth country and an unknown breed', async () => {
  const countries = await (await post({ ...base, countries: ['NL', 'BE', 'DE', 'FR'] })).json();
  assert.equal(countries.error, 'countries');
  const breed = await (await post({ ...base, breeds: ['Not A Breed'] })).json();
  assert.equal(breed.error, 'breeds');
});

test('built breed page wires Dutch search, stack, radius and gate', () => {
  const html = readFileSync(new URL('../dist/rassen/teckel/index.html', import.meta.url), 'utf8');
  assert.match(html, /class="sel bfind"/);
  assert.match(html, /Zoek een ras…/);
  assert.match(html, /value="Dachshund"[^>]*selected/);
  assert.match(html, />Teckel</);
  assert.match(html, /class="addc"/);
  assert.match(html, /value="150"/);
  assert.match(html, /value="300"[^>]*checked/);
  assert.match(html, /value="500"/);
  assert.match(html, /class="gate"/);
  assert.match(html, /Nog weinig pups in de buurt/);
  assert.match(html, /data-minopen="5"/);
  assert.match(html, /src="\/signup.js"/);
  assert.match(html, /static\.cloudflareinsights\.com\/beacon\.min\.js/);
  assert.doesNotMatch(html, /name="province"/);
  assert.doesNotMatch(html, /name="crossBorder"/);
  const idx = JSON.parse(readFileSync(new URL('../dist/breed-index.json', import.meta.url), 'utf8'));
  const teckel = idx.find(b => b.id === 'Dachshund');
  assert.equal(teckel.names[1], 'Teckel');
  assert.equal(teckel.n, 113);
  assert.match(html, /data-n="113"/);
  const home = readFileSync(new URL('../dist/index.html', import.meta.url), 'utf8');
  assert.match(home, /id="signup"/);
  assert.match(home, /class="sel bfind"/);
  assert.match(home, /Zoek een ras…/);
  assert.match(home, /Welke pup zoek je\?/);
  assert.match(home, /src="\/signup\.js"/);
  assert.match(home, /data-n="662">Golden Retriever/);
  assert.match(home, /MijnDoggo/);
  assert.match(home, /value="NL"/);
  assert.doesNotMatch(home, /class="go"/);
  assert.doesNotMatch(home, /PuppyAlert/);
  const rassen = readFileSync(new URL('../dist/rassen/index.html', import.meta.url), 'utf8');
  assert.match(rassen, /breed-grid"><li><a href="\/rassen\/golden-retriever\/"/);
  const regions = JSON.parse(readFileSync(new URL('../dist/regions.json', import.meta.url), 'utf8'));
  assert.equal(regions.NL.term.nl, 'Provincie');
  assert.equal(regions.DE.term.nl, 'Deelstaat');
  assert.ok(regions.NL.regions.some(r => r.id === 'NL-NH'));
});
