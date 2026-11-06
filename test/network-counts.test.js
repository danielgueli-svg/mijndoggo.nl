import test from 'node:test';
import assert from 'node:assert/strict';
import COUNTRY_ROWS from '../data/countries.json' with { type: 'json' };
import { EU_UK, listingCountry, networkTotals } from '../lib/data.js';

test('EU plus UK is the signup country list, with the UK stored as GB', () => {
  assert.deepEqual(new Set(EU_UK), new Set(COUNTRY_ROWS.map(row => listingCountry(row[0]))));
  assert.ok(EU_UK.includes('NL') && EU_UK.includes('GB') && EU_UK.includes('DE'));
  assert.equal(EU_UK.includes('CH'), false);
  assert.equal(EU_UK.includes('NO'), false);
  assert.equal(listingCountry('Nederland'), 'NL');
  assert.equal(listingCountry('GB-ENG'), 'GB');
});

test('network totals keep the Netherlands inside Europe plus the UK', () => {
  const totals = networkTotals([
    { country: 'NL', n: 655 },
    { country: 'DE', n: 1175 },
    { country: 'GB', n: 215 },
    { country: 'GB-SCT', n: 1 },
    { country: 'Nederland', n: 2 },
    { country: 'CH', n: 448 },
    { country: 'NO', n: 123 },
    { country: 'LI', n: 1 },
  ]);
  assert.equal(totals.nl, 657);
  assert.equal(totals.europe, 655 + 1175 + 215 + 1 + 2);
});
