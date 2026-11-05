// Matching for a stored signup against shared puppyalert-listings (READ-ONLY).
// Listings have country-level location only, so a chosen province and radius are stored on the
// signup but the match is the selected countries. Older NL + cross-border rows still match.
import { breedKeys, listingCountry } from './data.js';
export function matchQuery(signup) {
  const breeds = JSON.parse(signup.breeds), near = signup.near ? JSON.parse(signup.near) : {};
  let raw;
  if (Array.isArray(near.countries) && near.countries.length) raw = near.countries;
  else {
    raw = [signup.country || 'NL'];
    if (near.crossBorder && Array.isArray(near.reach)) raw = raw.concat(near.reach);
  }
  const countries = [...new Set(raw.map(listingCountry).filter(Boolean))];
  const breedBinds = [...new Set(breeds.flatMap(b => { const k = breedKeys(b); return [k.en, k.slug]; }))];
  return { sql: `SELECT id, breed, country, listing_url FROM listings WHERE is_active = 1 AND breed IN (${breedBinds.map(() => '?').join(',')}) AND country IN (${countries.map(() => '?').join(',')})`, binds: [...breedBinds, ...countries] };
}
