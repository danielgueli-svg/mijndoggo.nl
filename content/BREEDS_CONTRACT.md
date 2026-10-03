# Rassen-contract voor een NL-schrijfbot

Ras-pagina's komen uit **`content/breeds/*.md`**. Geen live-bot. Jij schrijft bestanden, de site bouwt ze.

## Bestand = URL

| Bestand | URL |
| --- | --- |
| `content/breeds/labrador-retriever.md` | `/rassen/labrador-retriever` |

- kebab-case, geen spaties.
- Bestaande slugs niet hernoemen.
- Geen `README.md` in deze map.

## Frontmatter

```yaml
---
name: Labrador Retriever
shortName: Labrador
tagline: Eén zin, warm, geen slogan-robot.
size: klein | middel | groot
energy: laag | middel | hoog
goodWithKids: true
origin: Canada / Verenigd Koninkrijk
traits: [vriendelijk, watergek, leerbaar]
gallery:
  - unsplashId: photo-1552053831-71594a27632d
    alt: Nederlandse beschrijving van de foto
    photographer: Jamie Street
    unsplashUrl: https://unsplash.com/photos/BJaNDEHARvE
    sfeer: false
---
```

- `gallery`: **3 foto's** waar het kan (min 1, max 6). Alleen lieve, wholesome honden (Unsplash).
- `sfeer: true` als het geen ras-exacte foto is maar wél een vrolijke fallback.
- Eerste gallery-foto = cover in de ras-klikker.

## Body (verplichte kopjes)

Gebruik precies deze `##` kopjes, in deze volgorde:

1. `## Temperament`
2. `## Achtergrond`
3. `## Verzorging`
4. `## Voor wie?`

Toon: Nederlands, warm, een beetje tiener-achtig. Geen brochure, geen "in dit artikel". Geen medisch advies als feit — bij twijfel: dierenarts.

## Workflow

1. Lees dit contract + 1 bestaand rasbestand.
2. Schrijf of vervang alleen `content/breeds/*.md`.
3. Foto's: bestaande Unsplash-ids hergebruiken of nieuwe wholesome ids + credit.
4. `npm run build` — schema-fout = frontmatter fixen.
5. Commit + deploy.
