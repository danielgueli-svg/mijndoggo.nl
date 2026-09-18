# Tips-contract voor een NL-schrijfbot

De artikelen op `/tips` komen **alleen** uit deze map: `content/tips/*.md`.
Er is geen runtime-koppeling met een bot. Een schrijfbot levert bestanden aan, een mens (of CI) bouwt de site opnieuw.

## Bestandsnaam = URL

| Bestand | URL |
| --- | --- |
| `content/tips/hond-wassen.md` | `/tips/hond-wassen` |

- Alleen kleine letters, cijfers en streepjes (`kebab-case`).
- Geen spaties, geen underscores, geen `README.md` in deze map.
- Bestaande slugs liever niet hernoemen: links blijven dan heel.

## Verplichte frontmatter

```yaml
---
title: Korte, warme titel
description: Eén of twee zinnen, max ~160 tekens, voor cards en SEO.
category: wassen | wandelen | plekken | voeding | verzorging | overig
heroImage: photo-1552053831-71594a27632d
heroImageAlt: Beschrijving van de foto, in het Nederlands
photographer: Jamie Street
unsplashUrl: https://unsplash.com/photos/BJaNDEHARvE
publishedAt: 2026-03-12
author: MijnDoggo
featured: false
minutes: 5
---
```

- `heroImage` is een Unsplash-id (`photo-…`), geen willekeurige URL. Alleen lieve, wholesome hondenfoto's.
- `featured: true` mag op een paar stukken; die duiken extra op de homepage op.
- `updatedAt` is optioneel (`YYYY-MM-DD`).

## Toon (niet onderhandelbaar)

- Nederlands, `nl-NL`.
- Warm, een beetje tiener-achtig, nooit stijf, nooit brochure, nooit “in deze blogpost bespreken we”.
- Geen medisch advies als feit. Bij twijfel: dierenarts noemen.
- Geen merken pushen. Geen clickbait.

## Body

Gewone Markdown: `##` kopjes, lijsten, korte alinea's. Geen HTML, geen images in de body (de hero komt uit frontmatter).

## Workflow voor de bot

1. Lees dit contract + 1 bestaand artikel als voorbeeld.
2. Schrijf of vervang **alleen** `.md`-bestanden in `content/tips/`.
3. Raak `src/` niet aan.
4. Run lokaal `npm run build`. Faalt de collection-schema-check, dan frontmatter fixen.
5. Commit de markdown, deploy de static build.

Klaar. Geen API, geen webhook, geen geheimen.
