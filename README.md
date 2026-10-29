# PuppyAlert.eu

Static site + Cloudflare Pages Functions, same pattern as EuroRentAlert (`src/build.mjs` → `dist/`, `functions/api/*`).
**Not deployed. DNS not touched.** Canonical: https://puppyalert.eu (www → apex redirect planned).

- `npm run build` → `dist/` (en at `/`, nl/de/fr at `/nl/ /de/ /fr/`), robots.txt, sitemap.xml with hreflang.
- Languages: English default; Dutch, German, French behind the 🇪🇺 switcher.
- Logo: `public/logo-doghead.png` is the unchanged dog illustration from mijndoggo.nl; the wordmark "PuppyAlert" is HTML text next to it.
- Visual: WorldRentAlert green tokens + Inter/Newsreader fonts; header shows only logo + wordmark.
- Counts show "coming soon". No numbers, no listings, no prices anywhere on the site.

## Signup
1. Breeds: fold-open picker (alphabetical), multi-select, max 3 (top 20 list in `data/breeds.json`).
2. Countries: fold-open picker (alphabetical per language), multi-select, max 3, EU-27.
3. Email + confirm email (must match; checked client- and server-side) + consent + payment placeholder (no price shown). At a limit, the rest greys out with a translated message. Server re-validates limits.

## Backend behaviour (to build; `functions/api/*` are stubs)
- Payment: Mollie, set up later with Mollie Payments BOT. The amount lives **server-side only**; Daniel sets the price.
- Double opt-in: confirmation email first; nothing else is sent before confirmation.
- Instant first email: once opt-in is confirmed **and** payment is paid, query breeders/puppies already indexed for the chosen breeds × countries. If any match, send them right away. If none, send only a welcome email.
- After that, new listings go out as normal alert emails. Anything already in the first email is never repeated (track sent listing IDs per subscriber).
- GDPR: every email carries a one-click unsubscribe link (+ `List-Unsubscribe` header).

## Plans (preview-wra branch)
- Shown: €12 for 6 months, €20 for 1 year. **One-time payment, NOT a subscription, no auto-renewal.** **Payments are OFF**: no Mollie call; the button only starts double opt-in and says payment opens later. When enabled, amounts come from the server only.
- Page sections: header (logo + wordmark, language menu), hero + signup card, story / why-cheap, example alert email (clearly labelled, no real or invented breeders or counts), EU country cards ("Coming soon", no numbers), footer.
- Mollie: **one-off payments only** (`sequenceType: oneoff`). No customers/mandates, no recurring or subscription API.
- The confirmation email, welcome email, and any future FAQ and terms must state: one-time payment, no auto-renewal. The alert simply ends after 6 months / 1 year. (No email templates exist yet; this applies when they are added.)

## Optional "Near a place"
- Fold-open "Near a place (optional)" in step 2: one town/city field with autocomplete from `data/places.json` (static list of major towns with lat/lon) and a radius select. Metric: 50 / 100 / 150 km. If England, Scotland, Wales or Northern Ireland is among the chosen areas: 50 / 100 miles. Skipping it (default) = the whole of the chosen countries.
- England, Scotland, Wales and Northern Ireland are selectable as separate areas in addition to the EU-27. Max 3 breeds and max 3 countries still apply.
- Server (`functions/api/signup.js`) validates the place against the list, the unit (mi only when GB is chosen) and the radius. Stored as `near: { place, cc, lat, lon, radius, unit }` or `null`.
- **Matching**: when `near` is set, a listing matches only if its breeder location is within `radius` of the place (great-circle distance). Whether listings over the border match is set by `crossBorder` (below). When `near` is null, the whole chosen countries match. Applies to the instant first email and all later alerts.
- **Email copy**: when set, the welcome and alert emails include `{location}` and `{radius}` (e.g. "within 100 km of Utrecht"). Left out when not set.
- **Future account settings page (spec only)**: must offer the same UI as signup: breeds (max 3), countries (max 3), the same optional place + radius with km/mi rule, same server validation.
- **Cross-border**: `scripts/border-reach.py` precomputes, per place and radius, which other countries the circle reaches (coarse: Natural Earth 1:50m borders, ~5 km point spacing; sea crossings count). When it reaches a country that isn't already chosen, the card shows "Also show puppies across the border" (default ON). Stored as `near.crossBorder: boolean` (server forces `false` when the radius crosses no border). Matching: with `crossBorder: true`, listings within the radius match even outside the chosen countries; with `false`, only listings inside the chosen countries and within the radius. Cross-border matches do **not** count toward the 3-country cap (hard max 3 chosen countries). Same checkbox goes in the future account settings.

## Site structure (preview-wra)
- Homepage `/` (and `/nl/`, `/de/`, `/fr/`): language picker + country picker, **no signup form**. Choosing a country opens its page.
- Country pages (WRA pattern): `/europe/<slug>/` for English, `/nl/europe/<slug>/`, `/de/europe/<slug>/`, `/fr/europe/<slug>/`. Each has a localized title/description, canonical, hreflang (en/nl/de/fr + x-default), and the full signup form with that country preselected (up to 2 more can be added), optional place + radius, and the cross-border box. The 🇪🇺 language switch keeps you on the same country page.
- Coverage: EU-27 (incl. Ireland) + England, Scotland, Wales, Northern Ireland as separate areas (`GB-ENG`, `GB-SCT`, `GB-WLS`, `GB-NIR`), with miles for those 4. 31 areas, 128 pages. Non-EU countries (NO, CH, IS, …) are not included yet.
- `sitemap.xml` lists every page in all 4 languages with hreflang alternates; `robots.txt` points to it. Counts show "coming soon"; no listings anywhere.
