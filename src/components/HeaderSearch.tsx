import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";
import { breedHref, breedMatchesQuery, type CatalogBreed } from "../lib/catalog";
import {
  customBreedToCatalog,
  listCustomBreeds,
  subscribeCustomBreeds,
} from "../lib/custom-breeds";
import {
  displayNickname,
  listMembers,
  memberPlace,
  subscribeMembers,
  type Member,
} from "../lib/members";
import { filterNlPlaces } from "../lib/nl-places";
import { fold } from "../lib/text";
import { searchWalkSpots, walkKindLabels, type WalkSpot } from "../lib/walk-spots";

type Props = {
  breeds: CatalogBreed[];
};

const LIMIT = 6;

function membersInPlace(members: Member[], place: string): Member[] {
  const target = fold(place);
  return members.filter((member) => fold(memberPlace(member)) === target);
}

export default function HeaderSearch({ breeds }: Props) {
  const [ras, setRas] = useState("");
  const [plek, setPlek] = useState("");
  const [plaats, setPlaats] = useState("");
  const [open, setOpen] = useState<"ras" | "plek" | "plaats" | null>(null);
  const [custom, setCustom] = useState<CatalogBreed[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const rootRef = useRef<HTMLDivElement>(null);
  const rasId = useId();
  const plekId = useId();
  const plaatsId = useId();

  useEffect(() => {
    const refreshBreeds = () => setCustom(listCustomBreeds().map(customBreedToCatalog));
    const refreshMembers = () => setMembers(listMembers());
    refreshBreeds();
    refreshMembers();
    const stopBreeds = subscribeCustomBreeds(refreshBreeds);
    const stopMembers = subscribeMembers(refreshMembers);
    return () => {
      stopBreeds();
      stopMembers();
    };
  }, []);

  useEffect(() => {
    const onPointer = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(null);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(null);
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const breedHits = useMemo(() => {
    const q = ras.trim();
    if (!q) return [];
    const seen = new Set(breeds.map((breed) => breed.slug));
    const extra = custom.filter((breed) => !seen.has(breed.slug));
    return [...breeds, ...extra].filter((breed) => breedMatchesQuery(breed, q)).slice(0, LIMIT);
  }, [breeds, custom, ras]);

  const spotHits = useMemo(() => (plek.trim() ? searchWalkSpots(plek).slice(0, LIMIT) : []), [plek]);

  const placeHits = useMemo(() => {
    const q = plaats.trim();
    if (!q) return [];
    return filterNlPlaces(q).slice(0, LIMIT).map((name) => ({
      name,
      members: membersInPlace(members, name),
    }));
  }, [plaats, members]);

  return (
    <div ref={rootRef} className="grid grid-cols-1 gap-2 sm:grid-cols-3">
      <SearchField
        id={rasId}
        label="Ras"
        value={ras}
        placeholder="Zoek een ras"
        open={open === "ras" && ras.trim().length > 0}
        onFocus={() => setOpen("ras")}
        onChange={(value) => {
          setRas(value);
          setOpen("ras");
        }}
      >
        {breedHits.length === 0 ? (
          <Empty>Geen ras gevonden</Empty>
        ) : (
          <ul className="grid">
            {breedHits.map((breed) => (
              <li key={`${breed.custom ? "eigen" : "ras"}-${breed.slug}`}>
                <a
                  href={breedHref(breed)}
                  className="block px-4 py-2 text-sm hover:bg-sun"
                >
                  <span className="font-extrabold">{breed.name}</span>
                  {breed.shortName && breed.shortName !== breed.name ? (
                    <span className="mt-0.5 block text-xs font-bold text-muted">{breed.shortName}</span>
                  ) : null}
                </a>
              </li>
            ))}
          </ul>
        )}
      </SearchField>

      <SearchField
        id={plekId}
        label="Uitlaatplekken"
        value={plek}
        placeholder="Zoek een uitlaatplek"
        open={open === "plek" && plek.trim().length > 0}
        onFocus={() => setOpen("plek")}
        onChange={(value) => {
          setPlek(value);
          setOpen("plek");
        }}
      >
        {spotHits.length === 0 ? (
          <Empty>Geen uitlaatplek gevonden</Empty>
        ) : (
          <ul className="grid">
            {spotHits.map((spot) => (
              <li key={spot.id}>
                <a
                  href={`/community?uitlaat=${encodeURIComponent(spot.id)}`}
                  className="block px-4 py-2 text-sm hover:bg-sun"
                >
                  <span className="font-extrabold">{spot.name}</span>
                  <span className="mt-0.5 block text-xs font-bold text-muted">{spotLine(spot)}</span>
                </a>
              </li>
            ))}
          </ul>
        )}
      </SearchField>

      <SearchField
        id={plaatsId}
        label="Woonplaats"
        value={plaats}
        placeholder="Zoek een woonplaats"
        open={open === "plaats" && plaats.trim().length > 0}
        onFocus={() => setOpen("plaats")}
        onChange={(value) => {
          setPlaats(value);
          setOpen("plaats");
        }}
      >
        {placeHits.length === 0 ? (
          <Empty>Geen Nederlandse woonplaats gevonden</Empty>
        ) : (
          <ul className="grid">
            {placeHits.map((place) => (
              <li key={place.name} className="border-b border-ink/10 last:border-b-0">
                <a
                  href={`/community?plaats=${encodeURIComponent(place.name)}`}
                  className="block px-4 py-2 text-sm hover:bg-sun"
                >
                  <span className="font-extrabold">
                    {place.name} · {place.members.length}{" "}
                    {place.members.length === 1 ? "lid" : "leden"}
                  </span>
                  {place.members.length > 0 && (
                    <span className="mt-1 grid gap-0.5">
                      {place.members.slice(0, 4).map((member) => (
                        <span key={member.id} className="block text-xs font-bold text-muted">
                          {displayNickname(member)} · {member.breedName || "Ras onbekend"}
                        </span>
                      ))}
                      {place.members.length > 4 && (
                        <span className="block text-xs font-bold text-sky-deep">
                          en nog {place.members.length - 4}
                        </span>
                      )}
                    </span>
                  )}
                </a>
              </li>
            ))}
          </ul>
        )}
      </SearchField>
    </div>
  );
}

function spotLine(spot: WalkSpot): string {
  const kind = walkKindLabels[spot.kind];
  return spot.city ? `${kind} · ${spot.city}` : kind;
}

function Empty({ children }: { children: string }) {
  return <p className="px-4 py-3 text-sm font-bold text-muted">{children}</p>;
}

function SearchField({
  id,
  label,
  value,
  placeholder,
  open,
  onFocus,
  onChange,
  children,
}: {
  id: string;
  label: string;
  value: string;
  placeholder: string;
  open: boolean;
  onFocus: () => void;
  onChange: (value: string) => void;
  children: ReactNode;
}) {
  const listId = `${id}-lijst`;
  return (
    <div className="relative">
      <label htmlFor={id} className="grid gap-1 text-xs font-extrabold uppercase tracking-widest text-ink">
        {label}
        <input
          id={id}
          type="search"
          value={value}
          placeholder={placeholder}
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          autoComplete="off"
          onFocus={onFocus}
          onChange={(event) => onChange(event.target.value)}
          className="w-full rounded-full border-2 border-ink/15 bg-white px-4 py-2 text-sm font-bold normal-case tracking-normal text-ink shadow-pop outline-none placeholder:font-semibold placeholder:text-muted/70"
        />
      </label>
      {open && (
        <div
          id={listId}
          className="absolute left-0 right-0 z-50 mt-2 max-h-72 overflow-auto rounded-2xl bg-white py-1 text-left shadow-pop-lg ring-2 ring-ink/10"
        >
          {children}
        </div>
      )}
    </div>
  );
}
