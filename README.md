# PuppyAlert.eu

Static site + Cloudflare Pages Functions, same pattern as EuroRentAlert (`src/build.mjs` → `dist/`, `functions/api/*`).
**Not deployed. DNS not touched.** Canonical: https://puppyalert.eu (www → apex redirect planned).

- `npm run build` → `dist/` (en at `/`, nl/de/fr at `/nl/ /de/ /fr/`), robots.txt, sitemap.xml with hreflang.
- Languages: English default; Dutch, German, French behind the 🇪🇺 switcher.
- Logo: `public/logo-doghead.png` is the unchanged dog illustration from mijndoggo.nl; the wordmark "PuppyAlert" is HTML text next to it.
- Visual: WorldRentAlert green tokens + Inter/Newsreader fonts; header shows only logo + wordmark.
- Counts show "coming soon". No numbers, no listings, no prices anywhere on the site.

## Signup
1. Breeds: multi-select, max 3 (top 20 list in `data/breeds.json`).
2. Countries: multi-select, max 3, EU-27.
3. Email + consent + payment placeholder (no price shown). At a limit, the rest greys out with a translated message. Server re-validates limits.

## Backend behaviour (to build; `functions/api/*` are stubs)
- Payment: Mollie, set up later with Mollie Payments BOT. The amount lives **server-side only**; Daniel sets the price.
- Double opt-in: confirmation email first; nothing else is sent before confirmation.
- Instant first email: once opt-in is confirmed **and** payment is paid, query breeders/puppies already indexed for the chosen breeds × countries. If any match, send them right away. If none, send only a welcome email.
- After that, new listings go out as normal alert emails. Anything already in the first email is never repeated (track sent listing IDs per subscriber).
- GDPR: every email carries a one-click unsubscribe link (+ `List-Unsubscribe` header).
