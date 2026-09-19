import { useMemo, useState } from "react";
import { dutchPlaces, filterNlPlaces } from "../lib/nl-places";

type Props = {
  value: string;
  onChange: (plaats: string) => void;
  id?: string;
};

export default function PlacePicker({ value, onChange, id = "plaats-kiezer" }: Props) {
  const [query, setQuery] = useState("");
  const visible = useMemo(
    () => (query.trim() ? filterNlPlaces(query) : dutchPlaces()).slice(0, 80),
    [query],
  );

  return (
    <div className="grid gap-2">
      <label className="grid gap-1 text-sm font-extrabold" htmlFor={id}>
        Woonplaats
        <input
          id={id}
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Alleen Nederlandse plaatsen — typ of tik…"
          className="rounded-2xl border-2 border-ink/10 bg-cream px-4 py-2.5 font-bold"
        />
      </label>
      <p className="text-xs font-bold text-muted">
        Optioneel. Alleen NL-woonplaatsen — geen buitenland.
        {value ? (
          <>
            {" "}
            Gekozen: <span className="text-ink">{value}</span>
            <button
              type="button"
              className="ml-2 underline decoration-2 underline-offset-2"
              onClick={() => onChange("")}
            >
              wissen
            </button>
          </>
        ) : null}
      </p>
      <ul
        className="max-h-40 overflow-auto rounded-[1.2rem] bg-white p-1 ring-2 ring-ink/10"
        role="listbox"
        aria-label="Nederlandse woonplaatsen"
      >
        {visible.length === 0 ? (
          <li className="px-4 py-3 text-sm font-bold text-muted">
            Geen Nederlandse plaats met die naam.
          </li>
        ) : (
          visible.map((place) => {
            const active = place === value;
            return (
              <li key={place}>
                <button
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => {
                    onChange(place);
                    setQuery("");
                  }}
                  className={`flex w-full rounded-2xl px-3 py-2 text-left text-sm font-extrabold ${
                    active ? "bg-sun text-ink" : "hover:bg-foam"
                  }`}
                >
                  {place}
                </button>
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
}
