# MijnDoggo

Vrolijke Nederlandstalige site voor hondenvrienden: ras-klikker, ras-pagina's, tips & trucs, en een MVP waarin je je eigen hond kunt showen.

Live-idee: [mijndoggo.nl](https://mijndoggo.nl) · stack: **Astro + TypeScript + Tailwind** · licentie: **MIT**

## Snel starten

```sh
npm install
npm run dev
```

Dev-server: `http://127.0.0.1:43147`

```sh
npm run build    # static files in dist/
npm run preview  # lokale preview van de build
```

Node 22+.

## Wat zit erin (v1)

- Homepage met hero (lieve Unsplash-honden) en een **ras-klikker**: zoeken, filteren op formaat, klikken naar het ras.
- **30+ rassen** (NL-favs + Nederlandse rassen zoals Stabij, Kooiker, Drent, Schapendoes, Hollandse herder, Saarloos).
- Ras-pagina: fotogalerij (~3 foto's), Nederlands rasverhaal (temperament, achtergrond, verzorging, voor wie) + **honden van eigenaren**. Toevoegen kan zonder account.
- **Tips & trucs** als Markdown, klaar voor een externe NL-schrijfbot.
- Helemaal `nl-NL`. Geen auth, geen webshop.

## Mapstructuur

```
content/breeds/          Rasverhalen + fotogalerij (Markdown)
content/BREEDS_CONTRACT.md  Contract voor een NL-schrijfbot
content/tips/            Tip-artikelen
content/TIPS_CONTRACT.md Contract voor tips-bot
src/lib/owner-dogs.ts    Datamodel + localStorage-repository (API-vorm in comments)
src/pages/               Routes
```

## Rassen toevoegen

Nieuw ras = nieuw bestand `content/breeds/jouw-ras.md`. Lees **[content/BREEDS_CONTRACT.md](content/BREEDS_CONTRACT.md)**.

Verplicht in de body: `## Temperament`, `## Achtergrond`, `## Verzorging`, `## Voor wie?`.
In de frontmatter: naam, tagline, size/energy, en een `gallery` van ±3 wholesome Unsplash-foto's (eerste foto = cover in de ras-klikker).

Een NL-schrijfbot mag die Markdown overschrijven; daarna `npm run build`.

## Tips van een NL-schrijfbot

Geen live-koppeling. De bot schrijft bestanden, de site bouwt ze in.

1. Lees **[content/TIPS_CONTRACT.md](content/TIPS_CONTRACT.md)** (frontmatter, toon, slug-regels).
2. Zet of vervang `content/tips/*.md`.
3. Raak `src/` niet aan.
4. `npm run build` — schema-fouten = frontmatter fixen.
5. Commit + deploy.

Voorbeeld staat al in `content/tips/` (wassen, wandelen, plekken, voeding, verzorging, pup).

## Eigen hond (MVP-persistentie)

Op elke ras-pagina kun je een hond toevoegen: naam, leeftijd, bio, max 3 foto's.

| Wat | Waar |
| --- | --- |
| Opslag v1 | `localStorage`, key `mijndoggo.ownerDogs.v1` |
| Zichtbaar | Alleen op **dit apparaat**, in **deze browser** |
| Types | `src/lib/owner-dogs.ts` → `OwnerDog`, `OwnerDogWrite` |
| Swap later | Vervang `createOwnerDogRepository()` door een HTTP-client |

Geplande API-vorm (nog niet gebouwd):

```
GET    /api/rassen/:breedSlug/honden       → { dogs: OwnerDog[] }
POST   /api/rassen/:breedSlug/honden       → { dog: OwnerDog }
DELETE /api/rassen/:breedSlug/honden/:id   → { ok: true }
```

Foto's in v1 zijn verkleinde JPEGs (data-URL's) zodat localStorage het volhoudt. Een echte backend zou multipart of signed uploads teruggeven als `https://`-URL's. De UI hoeft dan nauwelijks om.

## Deploy (Cloudflare Pages of elke static host)

1. Build command: `npm run build`
2. Output: `dist`
3. Node: `22`

Cloudflare Pages: nieuw project → deze repo → die twee velds, klaar. Elke andere static host (Netlify, GitHub Pages + Actions, Nginx) werkt hetzelfde: serve `dist/`.

## Foto's

Unsplash License. Alleen positieve, schattige honden. Credits op [/over#credits](/over#credits) en in de bijschriften.

## English

Dutch-only UI for dog lovers. Astro static site, MIT licensed. Breed stories live in `content/breeds/` (gallery + Dutch story). Tips are Markdown in `content/tips/`. See `content/BREEDS_CONTRACT.md` and `content/TIPS_CONTRACT.md` for the copy-bot pipelines. Owner-submitted dogs use a localStorage MVP (`src/lib/owner-dogs.ts`) with a typed repository ready to swap for a real API.

## Licentie

[MIT](LICENSE)
