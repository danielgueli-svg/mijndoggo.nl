import { useMemo, useState } from "react";
import type { CatalogBreed } from "../lib/catalog";
import { fold } from "../lib/text";

type Props = {
  breeds: CatalogBreed[];
  value: string;
  onChange: (slug: string) => void;
  id?: string;
  label?: string;
};

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export default function BreedPicker({
  breeds,
  value,
  onChange,
  id = "ras-kiezer",
  label = "Ras van mijn hond",
}: Props) {
  const [query, setQuery] = useState("");
  const [letter, setLetter] = useState<string | null>(null);

  const sorted = useMemo(
    () => [...breeds].sort((a, b) => a.name.localeCompare(b.name, "nl")),
    [breeds],
  );

  const availableLetters = useMemo(() => {
    const set = new Set<string>();
    for (const breed of sorted) {
      const first = fold(breed.name).charAt(0).toUpperCase();
      if (LETTERS.includes(first)) set.add(first);
    }
    return set;
  }, [sorted]);

  const visible = useMemo(() => {
    const q = fold(query);
    return sorted.filter((breed) => {
      const name = fold(`${breed.name} ${breed.shortName}`);
      const first = fold(breed.name).charAt(0).toUpperCase();
      const letterOk = !letter || first === letter;
      const queryOk = !q || name.includes(q);
      return letterOk && queryOk;
    });
  }, [sorted, query, letter]);

  const selected = sorted.find((breed) => breed.slug === value);

  return (
    <div className="grid gap-2">
      <label className="grid gap-1 text-sm font-extrabold" htmlFor={id}>
        {label}
        <input
          id={id}
          type="search"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            if (event.target.value) setLetter(null);
          }}
          placeholder="Typ een ras, of tik een letter…"
          className="rounded-2xl border-2 border-ink/10 bg-white px-4 py-2.5 font-bold"
        />
      </label>

      <div className="flex flex-wrap gap-1" role="group" aria-label="Filter op beginletter">
        <button
          type="button"
          onClick={() => setLetter(null)}
          className={`rounded-full px-2.5 py-1 text-xs font-extrabold ring-2 ring-ink/10 ${
            letter === null ? "bg-ink text-cream" : "bg-white text-ink hover:bg-sun"
          }`}
        >
          Alle
        </button>
        {LETTERS.map((item) => {
          const enabled = availableLetters.has(item);
          const active = letter === item;
          return (
            <button
              key={item}
              type="button"
              disabled={!enabled}
              onClick={() => {
                setLetter(item);
                setQuery("");
              }}
              className={`rounded-full px-2 py-1 text-xs font-extrabold ring-2 ring-ink/10 ${
                active
                  ? "bg-ink text-cream"
                  : enabled
                    ? "bg-white text-ink hover:bg-sun"
                    : "bg-white/50 text-muted/50"
              }`}
            >
              {item}
            </button>
          );
        })}
      </div>

      {selected && (
        <p className="text-xs font-bold text-muted">
          Gekozen: <span className="text-ink">{selected.name}</span>
        </p>
      )}

      <ul
        className="max-h-56 overflow-auto rounded-[1.2rem] bg-white p-1 ring-2 ring-ink/10"
        role="listbox"
        aria-label="Rassen"
      >
        {visible.length === 0 ? (
          <li className="px-4 py-3 text-sm font-bold text-muted">Geen ras met die letter of naam.</li>
        ) : (
          visible.map((breed) => {
            const active = breed.slug === value;
            return (
              <li key={`${breed.custom ? "c" : "s"}-${breed.slug}`}>
                <button
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => onChange(breed.slug)}
                  className={`flex w-full items-center justify-between rounded-2xl px-3 py-2 text-left text-sm font-extrabold ${
                    active ? "bg-sun text-ink" : "hover:bg-foam"
                  }`}
                >
                  <span>{breed.name}</span>
                  {breed.custom && (
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-sky-deep">
                      Eigen
                    </span>
                  )}
                </button>
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
}
