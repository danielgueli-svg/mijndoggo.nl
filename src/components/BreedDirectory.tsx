import { useEffect, useMemo, useState } from "react";
import {
  breedHref,
  breedMatchesQuery,
  energyLabels,
  sizeLabels,
  type BreedSize,
  type CatalogBreed,
} from "../lib/catalog";
import {
  customBreedToCatalog,
  listCustomBreeds,
  subscribeCustomBreeds,
} from "../lib/custom-breeds";
import { POPULAR_BREED_SLUGS } from "../lib/popular-breeds";

type Props = {
  catalog: CatalogBreed[];
  mode: "home" | "all";
  heading: string;
  intro?: string;
};

const sizes: { id: "alle" | BreedSize; label: string }[] = [
  { id: "alle", label: "Alle" },
  { id: "klein", label: "Klein" },
  { id: "middel", label: "Middel" },
  { id: "groot", label: "Groot" },
];

function BreedTile({ breed }: { breed: CatalogBreed }) {
  return (
    <a
      href={breedHref(breed)}
      className="group flex flex-col overflow-hidden rounded-[1.6rem] bg-white shadow-pop ring-2 ring-ink/10 transition hover:-translate-y-1 hover:ring-coral"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-foam">
        <img
          src={breed.imageSrc}
          alt={breed.imageAlt}
          width="640"
          height="480"
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          loading="lazy"
        />
        <span className="absolute left-3 top-3 rounded-full bg-sun px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wide text-ink">
          {sizeLabels[breed.size]}
        </span>
        {breed.custom && (
          <span className="absolute right-3 top-3 rounded-full bg-sky px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wide text-ink">
            Eigen
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="font-display text-xl font-semibold leading-tight text-ink">{breed.name}</h3>
        <p className="text-sm leading-snug text-muted">{breed.tagline}</p>
        <p className="mt-auto pt-2 text-xs font-extrabold uppercase tracking-widest text-sky-deep">
          {energyLabels[breed.energy]} →
        </p>
      </div>
    </a>
  );
}

export default function BreedDirectory({ catalog, mode, heading, intro }: Props) {
  const [query, setQuery] = useState("");
  const [size, setSize] = useState<"alle" | BreedSize>("alle");
  const [custom, setCustom] = useState<CatalogBreed[]>([]);

  useEffect(() => {
    const refresh = () => setCustom(listCustomBreeds().map(customBreedToCatalog));
    refresh();
    return subscribeCustomBreeds(refresh);
  }, []);

  const all = useMemo(() => {
    const seen = new Set(catalog.map((breed) => breed.slug));
    return [...catalog, ...custom.filter((breed) => !seen.has(breed.slug))];
  }, [catalog, custom]);

  const searching = query.trim().length > 0;

  const visible = useMemo(() => {
    if (mode === "home" && !searching) {
      const popular = POPULAR_BREED_SLUGS.map((slug) =>
        all.find((breed) => breed.slug === slug),
      ).filter((breed): breed is CatalogBreed => Boolean(breed));
      const extras = all.filter((breed) => breed.custom);
      return [...popular, ...extras].filter((breed) => size === "alle" || breed.size === size);
    }
    return all.filter((breed) => {
      const nameOk = breedMatchesQuery(breed, query);
      const sizeOk = size === "alle" || breed.size === size;
      return nameOk && sizeOk;
    });
  }, [all, mode, searching, query, size]);

  const countLabel =
    mode === "home" && !searching
      ? `${visible.filter((breed) => !breed.custom).length} populaire rassen` +
        (custom.length ? ` + ${custom.length} eigen` : "")
      : `${visible.length} rassen`;

  return (
    <section id="rassen" className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-widest text-coral">Ras-klikker</p>
          <h2 className="mt-1 font-display text-3xl font-semibold sm:text-4xl">{heading}</h2>
          {intro && <p className="mt-2 max-w-2xl text-muted">{intro}</p>}
        </div>
        <div className="flex flex-col items-start gap-2 sm:items-end">
          <p className="text-sm font-bold text-muted">{countLabel}</p>
          <a
            href="/rassen/nieuw"
            className="rounded-full bg-white px-4 py-2 text-sm font-extrabold shadow-pop ring-2 ring-ink/10 hover:bg-sun"
          >
            Ras toevoegen
          </a>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="relative block flex-1">
          <span className="sr-only">Zoek een ras</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={
              mode === "home"
                ? "Zoek in alle rassen…"
                : "Zoek op rasnaam…"
            }
            className="w-full rounded-full border-2 border-ink/15 bg-white px-5 py-3 text-sm font-bold shadow-pop outline-none placeholder:font-semibold placeholder:text-muted/70"
          />
        </label>
        {mode === "all" && (
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter op formaat">
            {sizes.map((item) => {
              const active = size === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSize(item.id)}
                  className={`rounded-full px-4 py-2 text-sm font-extrabold ring-2 ring-ink/10 transition ${
                    active ? "bg-ink text-cream" : "bg-white text-ink hover:bg-sun"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {mode === "home" && !searching && (
        <p className="mt-3 text-sm font-bold text-muted">
          We tonen acht bekende rassen. Typ hierboven om alles te doorzoeken — ook rassen die jij hebt toegevoegd.
        </p>
      )}

      {visible.length === 0 && (
        <p className="mt-8 rounded-[1.5rem] bg-white p-8 text-center font-bold text-muted ring-2 ring-ink/10">
          Geen ras gevonden.{" "}
          <a className="text-sky-deep underline decoration-2 underline-offset-2" href="/rassen/nieuw">
            Voeg ’m zelf toe
          </a>
          ?
        </p>
      )}

      {visible.length > 0 && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visible.map((breed) => (
            <BreedTile key={`${breed.custom ? "c" : "s"}-${breed.slug}`} breed={breed} />
          ))}
        </div>
      )}
    </section>
  );
}
