import COUNTRY_ROWS from '../data/countries.json' with { type: 'json' };
export const BREEDS = new Set(["Labrador Retriever", "Golden Retriever", "Cockapoo", "Cavapoo", "Labradoodle", "Goldendoodle", "Maltipoo", "French Bulldog", "English Bulldog", "Dachshund", "Cocker Spaniel", "English Springer Spaniel", "Cavalier King Charles Spaniel", "German Shepherd", "White Swiss Shepherd", "Border Collie", "Staffordshire Bull Terrier", "Dobermann", "Cane Corso", "Rottweiler", "Boxer", "Poodle", "Siberian Husky", "Alaskan Malamute", "Samoyed", "Whippet", "Shih Tzu", "Pomeranian", "Jack Russell Terrier", "Maltese", "Bichon Frise", "Havanese", "Chihuahua", "Pug", "Yorkshire Terrier", "West Highland White Terrier", "Border Terrier", "Norwich Terrier", "Boston Terrier", "Bull Terrier", "Tibetan Terrier", "Weimaraner", "Rhodesian Ridgeback", "Great Dane", "Dogue de Bordeaux", "Bullmastiff", "Dalmatian", "Giant Schnauzer", "Pembroke Welsh Corgi", "Shiba Inu", "Akita", "Chow Chow", "Eurasier", "Brittany", "Gordon Setter", "Italian Spinone", "Saluki", "Bavarian Mountain Hound", "Bernese Mountain Dog"]);
// Province -> countries (BE/DE) within each radius from the province centre (approx. km to nearest border).
export const PROVINCES = {"Groningen": {"km25": [], "km50": ["DE"], "km100": ["DE"], "km150": ["DE"]}, "Friesland": {"km25": [], "km50": [], "km100": ["DE"], "km150": ["DE"]}, "Drenthe": {"km25": [], "km50": ["DE"], "km100": ["DE"], "km150": ["DE"]}, "Overijssel": {"km25": ["DE"], "km50": ["DE"], "km100": ["DE"], "km150": ["BE", "DE"]}, "Flevoland": {"km25": [], "km50": [], "km100": [], "km150": ["BE", "DE"]}, "Gelderland": {"km25": [], "km50": ["DE"], "km100": ["BE", "DE"], "km150": ["BE", "DE"]}, "Utrecht": {"km25": [], "km50": [], "km100": ["BE", "DE"], "km150": ["BE", "DE"]}, "Noord-Holland": {"km25": [], "km50": [], "km100": [], "km150": ["BE", "DE"]}, "Zuid-Holland": {"km25": [], "km50": [], "km100": ["BE"], "km150": ["BE", "DE"]}, "Zeeland": {"km25": ["BE"], "km50": ["BE"], "km100": ["BE"], "km150": ["BE"]}, "Noord-Brabant": {"km25": ["BE"], "km50": ["BE", "DE"], "km100": ["BE", "DE"], "km150": ["BE", "DE"]}, "Limburg": {"km25": ["BE", "DE"], "km50": ["BE", "DE"], "km100": ["BE", "DE"], "km150": ["BE", "DE"]}};
export const RADII = [150, 300, 500];
export const slugifyBreed = t => String(t).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const EN_BY_SLUG = Object.fromEntries([...BREEDS].map(n => [slugifyBreed(n), n]));
// Listings store either the English breed key or its slug. Callers match on both.
export function breedKeys(raw) {
  const text = String(raw || '');
  if (EN_BY_SLUG[text]) return { en: EN_BY_SLUG[text], slug: text };
  const slug = slugifyBreed(text);
  if (BREEDS.has(text)) return { en: text, slug };
  if (EN_BY_SLUG[slug]) return { en: EN_BY_SLUG[slug], slug };
  return { en: text, slug };
}
// Shared listings use GB for England, Scotland, Wales and Northern Ireland.
export function listingCountry(code) {
  const c = String(code || '');
  if (c === 'GB' || c.startsWith('GB-')) return 'GB';
  if (c === 'Nederland' || c === 'Netherlands') return 'NL';
  return c;
}
// Signup countries are the EU members plus the UK. Listings store the UK as GB.
export const EU_UK = [...new Set(COUNTRY_ROWS.map(row => listingCountry(row[0])))];
const EU_UK_SET = new Set(EU_UK);
// Active listing rows: NL alone, and NL inside EU + UK. Switzerland, Norway and Liechtenstein are outside that set.
export function networkTotals(rows) {
  let nl = 0, europe = 0;
  for (const r of rows || []) {
    const n = +r.n || 0, cc = listingCountry(r.country);
    if (cc === 'NL') nl += n;
    if (EU_UK_SET.has(cc)) europe += n;
  }
  return { nl, europe };
}
